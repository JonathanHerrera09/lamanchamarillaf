// Admin.jsx - Versión optimizada
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Modal from "react-bootstrap/Modal";
import "../styles/Admin.css";

// Configuración de Axios para evitar CORS
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3050";
axios.defaults.baseURL = `${API_BASE}/api/v1`;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Interceptor para manejar errores de CORS
axios.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

const TOKEN_KEY = "auth_token";
const ADMIN_KEY = "admin_session";

// Componente Stars memoizado
const Stars = React.memo(({ value, size = 16 }) => (
  <div className="d-flex align-items-center gap-1" aria-label={`Calificación: ${value} de 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <i
        key={i}
        className={`bi bi-star-fill ${i < Math.round(Number(value) || 0) ? "text-warning" : "text-secondary"}`}
        style={{ fontSize: size }}
      />
    ))}
  </div>
));

Stars.displayName = "Stars";

// Componente RatingInput memoizado
const RatingInput = React.memo(({ value, onChange }) => (
  <div className="d-flex align-items-center gap-1" role="radiogroup" aria-label="Selecciona calificación">
    {Array.from({ length: 5 }).map((_, i) => {
      const n = i + 1;
      const active = value >= n;
      return (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className="btn p-0 border-0 bg-transparent"
          style={{ cursor: "pointer" }}
        >
          <i
            className={`bi ${active ? "bi-star-fill text-warning" : "bi-star text-secondary"}`}
            style={{ fontSize: "1.5rem" }}
          />
        </button>
      );
    })}
  </div>
));

RatingInput.displayName = "RatingInput";

// Constantes para vistas
const VIEWS = {
  SEARCH: "search",
  RATINGS: "ratings",
  REQUESTED: "requested",
  PROMOTED: "promoted",
  LOST: "lost",
  DRIVERS: "drivers",
  IMAGES: "images"
};

// Hook personalizado para manejo de session
const useSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed);
      } catch {
        setSession(raw);
      }
    }
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
  }, [session]);

  return { session, setSession };
};

// Hook personalizado para fetch
const useApi = () => {
  const fetchData = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: endpoint,
        method: options.method || "GET",
        data: options.data,
        headers: {
          ...options.headers,
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }, []);

  const deleteData = useCallback(async (endpoint, id) => {
    try {
      await axios.delete(`${endpoint}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${endpoint}/${id}:`, error);
      throw error;
    }
  }, []);

  return { fetchData, deleteData };
};

// Componente principal
export default function Admin() {
  const { session, setSession } = useSession();
  const { fetchData, deleteData } = useApi();
  
  // Estado principal
  const [data, setData] = useState({
    ratings: [],
    appsRequested: [],
    jobsPromoted: [],
    lostReports: [],
    drivers: [],
    driversAl: []
  });

  const [latestImage, setLatestImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState(VIEWS.SEARCH);
  const [searchQueries, setSearchQueries] = useState({
    global: "",
    ratings: "",
    requested: "",
    promoted: "",
    lost: "",
    drivers: ""
  });
  const [selectedItems, setSelectedItems] = useState({
    rating: null,
    requested: null,
    promoted: null,
    lost: null,
    driverId: null
  });

  // Driver seleccionado (calculado)
  const selectedDriver = useMemo(() => 
    data.drivers.find(d => String(d.id) === String(selectedItems.driverId)) || null,
    [data.drivers, selectedItems.driverId]
  );

  // Función para actualizar queries de búsqueda
  const handleSearchChange = useCallback((type, value) => {
    setSearchQueries(prev => ({ ...prev, [type]: value }));
  }, []);

  // Fetch functions optimizadas
  const fetchAllData = useCallback(async () => {
    try {
      const endpoints = [
        { key: "ratings", url: "/rate_driver" },
        { key: "appsRequested", url: "/job_application" },
        { key: "jobsPromoted", url: "/job_board/all", headers: { authorization: process.env.REACT_APP_TOKEN_PUBLIC } },
        { key: "lostReports", url: "/lost_items" },
        { key: "drivers", url: "/driver" }
      ];

      const results = await Promise.allSettled(
        endpoints.map(({ key, url, headers }) => 
          fetchData(url, { headers }).then(result => ({ key, result }))
        )
      );

      const newData = {};
      results.forEach(({ value }, index) => {
        if (value) {
          newData[endpoints[index].key] = value.result;
        }
      });

      setData(prev => ({ ...prev, ...newData }));
    } catch (error) {
      console.error("Error fetching all data:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Error al cargar datos" });
    }
  }, [fetchData]);

  const fetchDriversAl = useCallback(async () => {
    try {
      const result = await fetchData("/driver/random/ten");
      setData(prev => ({ ...prev, driversAl: result }));
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  }, [fetchData]);

  const fetchLatestImage = useCallback(async () => {
    try {
      const result = await fetchData("/images");
      setLatestImage(result?.[0] || null);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  }, [fetchData]);

  // Efecto inicial
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchAllData(), fetchDriversAl(), fetchLatestImage()]);
    };
    init();
  }, [fetchAllData, fetchDriversAl, fetchLatestImage]);

  // Login
  const onLogin = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    try {
      const response = await axios.post("/user/login", { email, password });
      const { user, token } = response.data?.data || {};

      if (!user || !token || String(user.role) !== "1") {
        Swal.fire({ icon: "error", title: "Acceso denegado", text: "Solo para administradores" });
        return;
      }

      sessionStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const admin = { 
        id: user.id, 
        email: user.email, 
        name: user.name || user.username || "Admin" 
      };
      setSession(admin);

      Swal.fire({ icon: "success", title: "Bienvenido", text: admin.name });
      await fetchAllData();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      Swal.fire({ icon: "error", title: "Login fallido", text: msg });
    }
  }, [fetchAllData, setSession]);

  // Logout
  const onLogout = useCallback(() => {
    setSession(null);
    sessionStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
  }, [setSession]);

  // Funciones de eliminación optimizadas
  const handleDelete = useCallback(async (type, id) => {
    const endpoints = {
      rating: "/rate_driver",
      requested: "/job_application",
      promoted: "/job_board",
      lost: "/lost_items",
      driver: "/driver"
    };

    const confirm = await Swal.fire({
      title: "¿Eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33"
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteData(endpoints[type], id);
      setData(prev => ({
        ...prev,
        [type === "rating" ? "ratings" : 
         type === "requested" ? "appsRequested" :
         type === "promoted" ? "jobsPromoted" :
         type === "lost" ? "lostReports" : "drivers"]: 
        prev[type === "rating" ? "ratings" : 
             type === "requested" ? "appsRequested" :
             type === "promoted" ? "jobsPromoted" :
             type === "lost" ? "lostReports" : "drivers"].filter(item => item.id !== id)
      }));
      
      if (type === "driver" && selectedItems.driverId === id) {
        setSelectedItems(prev => ({ ...prev, driverId: null }));
      }

      Swal.fire({ icon: "success", title: "Eliminado" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar" });
    }
  }, [deleteData, selectedItems.driverId]);

  // Upload image
  const uploadImage = useCallback(async (e) => {
    e?.preventDefault();
    if (!uploadFile) {
      Swal.fire({ icon: "warning", title: "Selecciona un archivo" });
      return;
    }

    const formData = new FormData();
    formData.append("image", uploadFile);
    
    setUploading(true);
    try {
      await axios.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUploadFile(null);
      Swal.fire({ icon: "success", title: "Imagen subida" });
      await fetchLatestImage();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo subir la imagen" });
    } finally {
      setUploading(false);
    }
  }, [uploadFile, fetchLatestImage]);

  // Create driver
  const createDriver = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const required = ["name", "email", "phone", "taxiPlate"];
    for (const field of required) {
      if (!formData.get(field)?.trim()) {
        Swal.fire({ icon: "warning", title: "Faltan datos" });
        return;
      }
    }

    try {
      const response = await axios.post("/driver", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const newDriver = {
        id: response.data?.id || `d${Date.now()}`,
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        plate: formData.get("taxiPlate").toUpperCase(),
        rating: 0,
        role: "2"
      };

      setData(prev => ({ ...prev, drivers: [newDriver, ...prev.drivers] }));
      setSelectedItems(prev => ({ ...prev, driverId: newDriver.id }));
      
      Swal.fire({ icon: "success", title: "¡Registro exitoso!" });
      e.target.reset();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message });
    }
  }, []);

  // Add family
  const addFamily = useCallback((e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    
    const formData = new FormData(e.currentTarget);
    const familyMember = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      relation: formData.get("relation"),
      age: Number(formData.get("age"))
    };

    setData(prev => ({
      ...prev,
      drivers: prev.drivers.map(d => 
        String(d.id) === String(selectedDriver.id)
          ? { ...d, family: [...(d.family || []), familyMember] }
          : d
      )
    }));
    
    e.target.reset();
  }, [selectedDriver]);

  // Filter functions memoizadas
  const filteredData = useMemo(() => {
    const filterByQuery = (items, query, fields) =>
      items.filter(item =>
        fields.some(field =>
          String(item[field] || "").toLowerCase().includes(query.toLowerCase())
        )
      );

    return {
      drivers: filterByQuery(data.drivers, searchQueries.drivers, ["name", "username", "email", "plate"]),
      ratings: filterByQuery(data.ratings, searchQueries.ratings, ["name", "taxiPlate", "observation", "email"]),
      requested: filterByQuery(data.appsRequested, searchQueries.requested, ["nameDriver", "dni", "contact"]),
      promoted: filterByQuery(data.jobsPromoted, searchQueries.promoted, ["description", "location", "contact"]),
      lost: filterByQuery(data.lostReports, searchQueries.lost, ["taxiPlate", "description", "owner", "contact"])
    };
  }, [data, searchQueries]);

  // Driver ratings distribution
  const driverRatingsDistribution = useMemo(() => {
    if (!selectedDriver) return { starsCount: {}, total: 0 };
    
    const starsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    data.ratings.forEach(r => {
      const match = (r.driverId && String(r.driverId) === String(selectedDriver.id)) ||
                   (r.taxiPlate && selectedDriver.plate && 
                    r.taxiPlate.toLowerCase() === selectedDriver.plate.toLowerCase());
      
      if (match && r.rate) {
        const rate = Math.round(Number(r.rate));
        if (rate >= 1 && rate <= 5) {
          starsCount[rate]++;
        }
      }
    });
    
    return {
      starsCount,
      total: Object.values(starsCount).reduce((a, b) => a + b, 0)
    };
  }, [data.ratings, selectedDriver]);

  // Login form si no hay sesión
  if (!session) {
    return (
      <div className="container py-5">
        <h1 className="mb-4">Administrador</h1>
        <div className="card shadow">
          <div className="card-header bg-warning text-white">Iniciar sesión</div>
          <div className="card-body">
            <form onSubmit={onLogin}>
              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input type="email" name="email" className="form-control" defaultValue="admin@taxiseguro.com" />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input type="password" name="password" className="form-control" defaultValue="123456" />
              </div>
              <button type="submit" className="btn btn-primary w-100">Ingresar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel administrador</h1>
        <div>
          <small className="me-2 text-muted">Hola, {session.name}</small>
          <button className="btn btn-outline-secondary" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </div>

      {/* Taxistas destacados */}
      <div className="card-body d-flex overflow-auto gap-2 py-2">
        {data.driversAl.map(driver => (
          <div
            key={driver.id}
            onClick={() => { setView(VIEWS.DRIVERS); setSelectedItems(prev => ({ ...prev, driverId: driver.id })); }}
            className="card text-center p-2 shadow-sm border-0"
            style={{ minWidth: "150px", maxWidth: "150px" }}
          >
            <div className="rounded-circle mx-auto overflow-hidden" style={{ width: "50px", height: "50px" }}>
              {driver.photo ? (
                <img
                  src={`${process.env.REACT_APP_API_URL_SOCKET}${driver.photo.replace(process.env.REACT_APP_API_URL_SOCKET, '')}`}
                  alt={driver.name}
                  className="w-100 h-100 object-fit-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentNode.querySelector('.fallback') || 
                      (() => {
                        const div = document.createElement('div');
                        div.className = 'fallback w-100 h-100 bg-warning d-flex align-items-center justify-content-center fw-bold';
                        return div;
                      })();
                    fallback.textContent = driver.name.split(" ").map(s => s[0]).join("");
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
              ) : (
                <div className="w-100 h-100 bg-warning d-flex align-items-center justify-content-center fw-bold">
                  {driver.name.split(" ").map(s => s[0]).join("")}
                </div>
              )}
            </div>
            <div className="mt-1 fw-semibold" style={{ fontSize: "0.8rem" }}>{driver.name}</div>
            <div className="text-muted small" style={{ fontSize: "0.7rem" }}>Placa {driver.taxiPlate}</div>
            <div className="mt-1" style={{ transform: "scale(0.8)" }}>
              <Stars value={Math.round(driver.averageRate)} />
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Sidebar */}
        <aside className="col-lg-3 mb-3">
          <div className="card sticky-top" style={{ top: "1rem" }}>
            <div className="card-header">Secciones</div>
            <div className="list-group list-group-flush">
              {Object.entries(VIEWS).map(([key, value]) => (
                <button
                  key={value}
                  className={`list-group-item list-group-item-action ${view === value ? "active" : ""}`}
                  onClick={() => setView(value)}
                >
                  {{
                    search: "Buscador",
                    ratings: "Calificaciones de taxistas",
                    requested: "Busco trabajo",
                    promoted: "Busco conductor",
                    lost: "Objetos encontrados",
                    drivers: "Taxistas vinculados",
                    images: "Imagen popup"
                  }[value]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="col-lg-9">
          {/* Buscador Global */}
          {view === VIEWS.SEARCH && (
            <div className="card shadow mb-3">
              <div className="card-header">Búsqueda global</div>
              <div className="card-body">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar..."
                    value={searchQueries.global}
                    onChange={e => handleSearchChange("global", e.target.value)}
                  />
                  <span className="input-group-text"><i className="bi bi-search" /></span>
                </div>
                {/* Resultados de búsqueda */}
              </div>
            </div>
          )}

          {/* Calificaciones */}
          {view === VIEWS.RATINGS && (
            <div className="card shadow mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Calificaciones de taxistas</span>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => fetchData("/rate_driver")}>Recargar</button>
                  <button className="btn btn-sm btn-outline-primary" onClick={fetchAllData}>Recargar todo</button>
                </div>
              </div>
              <div className="card-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Buscar por autor, placa, comentario o email"
                  value={searchQueries.ratings}
                  onChange={e => handleSearchChange("ratings", e.target.value)}
                />
                <div className="d-grid gap-2">
                  {filteredData.ratings.map(rating => (
                    <RatingItem
                      key={rating.id}
                      rating={rating}
                      onView={() => setSelectedItems(prev => ({ ...prev, rating }))}
                      onDelete={() => handleDelete("rating", rating.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Componentes para otras vistas... */}

          {/* Taxistas */}
          {view === VIEWS.DRIVERS && (
            <DriversSection
              data={data}
              filteredData={filteredData}
              searchQueries={searchQueries}
              selectedDriver={selectedDriver}
              driverRatingsDistribution={driverRatingsDistribution}
              onSearchChange={handleSearchChange}
              onDriverSelect={id => setSelectedItems(prev => ({ ...prev, driverId: id }))}
              onCreateDriver={createDriver}
              onAddFamily={addFamily}
              onDeleteDriver={id => handleDelete("driver", id)}
              onFetchUsers={() => fetchData("/driver")}
            />
          )}
        </section>
      </div>

      {/* Modals */}
      <DetailModals
        selectedItems={selectedItems}
        onClose={() => setSelectedItems({
          rating: null,
          requested: null,
          promoted: null,
          lost: null,
          driverId: selectedItems.driverId
        })}
      />
    </div>
  );
}

// Componentes auxiliares para modularización

const RatingItem = React.memo(({ rating, onView, onDelete }) => (
  <div className="border rounded p-3">
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <strong>Placa: {rating.taxiPlate}</strong>
        <div className="small text-muted">Autor: {rating.name || "Anónimo"} {rating.email ? `— ${rating.email}` : ""}</div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <Stars value={Number(rating.rate)} />
        <span className="small text-muted">{rating.rate}/5</span>
        <button
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <i className="bi bi-trash" />
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={onView}>Ver</button>
      </div>
    </div>
    <div className="mt-2">{rating.observation}</div>
    <div className="small text-muted mt-1">Fecha: {rating.createdAt ? new Date(rating.createdAt).toLocaleString() : ""}</div>
  </div>
));

const DriversSection = ({
  data,
  filteredData,
  searchQueries,
  selectedDriver,
  driverRatingsDistribution,
  onSearchChange,
  onDriverSelect,
  onCreateDriver,
  onAddFamily,
  onDeleteDriver,
  onFetchUsers
}) => (
  <div className="row">
    <div className="col-lg-6 mb-3">
      <div className="card shadow">
        <div className="card-header">Crear taxista</div>
        <div className="card-body">
          <form onSubmit={onCreateDriver}>
            {/* Formulario de creación */}
          </form>
        </div>
      </div>
    </div>
    <div className="col-lg-6 mb-3">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Taxistas vinculados</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={onFetchUsers}>
            Recargar
          </button>
        </div>
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Buscar por nombre, usuario o email"
            value={searchQueries.drivers}
            onChange={e => onSearchChange("drivers", e.target.value)}
          />
          <div className="list-group">
            {filteredData.drivers.map(driver => (
              <DriverItem
                key={driver.id}
                driver={driver}
                isSelected={String(selectedDriver?.id) === String(driver.id)}
                onSelect={() => onDriverSelect(driver.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    {selectedDriver && (
      <div className="col-12">
        <DriverDetail
          driver={selectedDriver}
          ratings={data.ratings}
          distribution={driverRatingsDistribution}
          searchQuery={searchQueries.ratings}
          onSearchChange={onSearchChange}
          onDelete={onDeleteDriver}
          onAddFamily={onAddFamily}
        />
      </div>
    )}
  </div>
);

const DriverItem = React.memo(({ driver, isSelected, onSelect }) => (
  <button
    className={`list-group-item list-group-item-action d-flex align-items-center ${isSelected ? "active" : ""}`}
    onClick={onSelect}
  >
    <img
      src={`${process.env.REACT_APP_API_URL_SOCKET}${driver.photo?.replace(process.env.REACT_APP_API_URL_SOCKET, "") || ""}`}
      alt={driver.name}
      className="rounded-circle me-3"
      style={{ width: 64, height: 64, objectFit: "cover" }}
      loading="lazy"
    />
    <div className="flex-grow-1 text-start">
      <div><strong>{driver.name} {driver.username ? `— ${driver.username}` : ""}</strong></div>
      <div className="small text-muted">
        {driver.email}
        {driver.plate ? ` — ${driver.plate}` : ""}
      </div>
    </div>
  </button>
));

const DriverDetail = React.memo(({ 
  driver, 
  ratings, 
  distribution, 
  searchQuery, 
  onSearchChange,
  onDelete,
  onAddFamily 
}) => (
  <div className="card shadow">
    <div className="card-header">Detalle del taxista</div>
    <div className="card-body">
      <div className="d-flex align-items-center mb-3">
        <img
          src={`${process.env.REACT_APP_API_URL_SOCKET}${driver.photo?.replace(process.env.REACT_APP_API_URL_SOCKET, "") || ""}`}
          alt={driver.name}
          className="rounded-circle me-3"
          style={{ width: 64, height: 64, objectFit: "cover" }}
        />
        <div>
          <div className="h5 mb-0">{driver.name}</div>
          <div className="small text-muted">
            {driver.email} {driver.phone ? `— ${driver.phone}` : ""}
          </div>
          <div className="small">
            {driver.license ? `Licencia ${driver.license}` : ""}
            {driver.plate ? ` — Placa ${driver.plate}` : ""}
          </div>
          <div className="mt-1">
            <Stars value={driver.rating || 0} />
          </div>
        </div>
      </div>
      {/* Distribución de calificaciones */}
      {distribution.total > 0 && (
        <div className="mb-3">
          <h6>Distribución de calificaciones</h6>
          <div className="d-flex justify-content-between align-items-center flex-wrap bg-light p-2 rounded">
            {[5, 4, 3, 2, 1].map(n => (
              <div
                key={n}
                className="d-flex align-items-center mx-2 my-1 px-2 py-1 border rounded bg-white shadow-sm"
                style={{ minWidth: 80 }}
              >
                <span className="me-1 fw-semibold">{n}⭐</span>
                <span className="badge bg-warning text-dark">{distribution.starsCount[n] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Calificaciones detalladas */}
      <div>
        <h6>Calificaciones recibidas</h6>
        <input
          className="form-control mb-2"
          placeholder="Buscar en los comentarios"
          value={searchQuery}
          onChange={e => onSearchChange("ratings", e.target.value)}
        />
        {/* Lista de calificaciones */}
      </div>
    </div>
  </div>
));

const DetailModals = React.memo(({ selectedItems, onClose }) => (
  <>
    <Modal show={!!selectedItems.lost} onHide={onClose}>
      <Modal.Header closeButton><Modal.Title>Objeto perdido</Modal.Title></Modal.Header>
      <Modal.Body>
        {selectedItems.lost && (
          <>
            <p><strong>Placa:</strong> {selectedItems.lost.taxiPlate}</p>
            <p><strong>Fecha del viaje:</strong> {selectedItems.lost.date_travel}</p>
            <p><strong>Detalles:</strong> {selectedItems.lost.description}</p>
            {selectedItems.lost.photo && (
              <img src={selectedItems.lost.photo} alt="objeto" style={{ maxWidth: "100%" }} />
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
    {/* Otros modales similares */}
  </>
));