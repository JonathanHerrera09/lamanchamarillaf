// Drivep.js - Versión optimizada
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import Swal from "sweetalert2";

// Configuración de Axios para evitar CORS
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3050/api/v1";
axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Keys de almacenamiento
const SESSION_KEY = "driver_session_v1";
const TOKEN_KEY = "driver_token_v1";

// Componente memoizado para estrellas
const StarRating = memo(({ rating, size = "fs-4" }) => (
  <div>
    {[1, 2, 3, 4, 5].map((num) => (
      <i
        key={num}
        className={`bi ${num <= rating ? "bi-star-fill text-warning" : "bi-star text-muted"} mx-1 ${size}`}
      />
    ))}
  </div>
));

StarRating.displayName = "StarRating";

// Hook personalizado para manejo de sesión
const useSession = () => {
  const [session, setSession] = useState(null);
  const [relatives, setRelatives] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed.driver);
        setRelatives(parsed.relatives || []);
      } catch {}
    }
    
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ 
        driver: session, 
        relatives 
      }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session, relatives]);

  const logout = useCallback(() => {
    setSession(null);
    setRelatives([]);
    sessionStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    Swal.fire({ icon: "info", title: "Sesión cerrada", timer: 900 });
  }, []);

  return { session, setSession, relatives, setRelatives, logout };
};

// Hook personalizado para API calls
const useApi = () => {
  const apiCall = useCallback(async (method, endpoint, data = null, headers = {}) => {
    try {
      const config = { 
        method, 
        url: endpoint,
        headers: { 
          ...headers,
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      };
      
      if (data) {
        if (data instanceof FormData) {
          config.data = data;
          config.headers["Content-Type"] = "multipart/form-data";
        } else {
          config.data = data;
        }
      }
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Error ${method} ${endpoint}:`, error);
      throw error;
    }
  }, []);

  return { apiCall };
};

// Hook personalizado para formularios
const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);
  
  return { formData, updateField, resetForm };
};

// Componente Acordeón
const Accordion = memo(({ title, subtitle, isOpen, onToggle, children }) => (
  <div className="shadow p-4 bg-white rounded mb-4">
    <div
      onClick={onToggle}
      className="d-flex justify-content-between align-items-center cursor-pointer"
      style={{ cursor: "pointer" }}
    >
      <div>
        <h5 className="fw-bold mb-0">{title}</h5>
        <p className="text-muted small mb-0">{subtitle}</p>
      </div>
      <span className="fs-4 text-warning">{isOpen ? "▾" : "▸"}</span>
    </div>
    
    <div
      className="overflow-hidden"
      style={{
        maxHeight: isOpen ? "2000px" : "0",
        opacity: isOpen ? 1 : 0,
        transition: "all 0.5s ease",
      }}
    >
      <hr />
      {children}
    </div>
  </div>
));

Accordion.displayName = "Accordion";

// Componente Login
const LoginForm = memo(({ onSubmit, onSwitchToRegister }) => (
  <>
    <h4 className="mb-3">Iniciar sesión</h4>
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="form-label">Correo</label>
        <input type="email" name="email" className="form-control bg-light border-0 shadow-sm" required />
      </div>
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input type="password" name="password" className="form-control bg-light border-0 shadow-sm" required />
      </div>
      <button type="submit" className="btn btn-warning w-100 shadow-sm">Ingresar</button>
    </form>
    <p className="text-center mt-3">
      ¿No tienes cuenta?{" "}
      <button className="btn btn-link p-0" onClick={onSwitchToRegister}>Regístrate aquí</button>
    </p>
  </>
));

LoginForm.displayName = "LoginForm";

// Componente Registro
const RegisterForm = memo(({ onSubmit, onSwitchToLogin }) => {
  const fields = useMemo(() => [
    { name: "name", label: "Nombre", cols: 6 },
    { name: "lastName", label: "Apellido", cols: 6 },
    { name: "dni", label: "Cédula", cols: 6 },
    { name: "email", label: "Correo", type: "email", cols: 6 },
    { name: "phone", label: "Teléfono", cols: 6 },
    { name: "taxiPlate", label: "Placa", cols: 6 },
    { name: "companytaxi", label: "Empresa vinculada", cols: 12 },
    { name: "photo", label: "Foto", type: "file", cols: 12 }
  ], []);

  return (
    <>
      <h4 className="mb-3">Registrarme</h4>
      <form onSubmit={onSubmit}>
        <div className="row g-3">
          {fields.map((field) => (
            <div key={field.name} className={`col-md-${field.cols}`}>
              <label className="form-label">{field.label}</label>
              <input 
                type={field.type || "text"} 
                name={field.name} 
                className={`form-control ${field.name === "taxiPlate" || field.name === "companytaxi" ? "text-uppercase" : ""}`}
                required={field.name !== "companytaxi"}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button type="submit" className="btn btn-warning w-100 fw-bold">Registrarme</button>
        </div>
      </form>
      <p className="text-center mt-3">
        ¿Ya tienes cuenta?{" "}
        <button className="btn btn-link p-0" onClick={onSwitchToLogin}>Inicia sesión</button>
      </p>
    </>
  );
});

RegisterForm.displayName = "RegisterForm";

// Componente Perfil
const ProfileSection = memo(({ session, onUpdateProfile, onLogout }) => {
  const profileFields = useMemo(() => [
    { name: "name", label: "Nombre", value: session.name, cols: 4 },
    { name: "dni", label: "Cédula", value: session.dni, cols: 4 },
    { name: "phone", label: "Teléfono", value: session.phone, cols: 4 },
    { name: "plate", label: "Placa", value: session.plate, cols: 4 },
    { name: "companytaxi", label: "Empresa", value: session.companytaxi, cols: 4 }
  ], [session]);

  return (
    <div className="col-lg-6">
      <div className="shadow p-4 bg-white rounded">
        <h5 className="fw-bold">Mi información</h5>
        <p className="text-muted small">Perfil del conductor</p>
        
        <div className="d-flex align-items-center mb-3">
          <img
            src={`${process.env.REACT_APP_API_URL_SOCKET}/${session.photo || "uploads/default.png"}`}
            alt="Foto del conductor"
            className="rounded-circle me-3 border border-warning shadow"
            style={{ width: "64px", height: "64px", objectFit: "cover" }}
          />
          <div>
            <h6 className="mb-0">{session.name}</h6>
            <small className="text-muted">Placa {session.plate}</small>
            <div className="mt-1">
              <StarRating rating={session.averageRate || 0} />
            </div>
          </div>
        </div>

        <form onSubmit={onUpdateProfile}>
          <div className="row">
            {profileFields.map((field) => (
              <div key={field.name} className={`col-md-${field.cols} mb-2`}>
                <label className="form-label">{field.label}</label>
                <input 
                  name={field.name} 
                  className={`form-control bg-light border-0 shadow-sm ${field.name.includes("plate") ? "text-uppercase" : ""}`}
                  defaultValue={field.value} 
                />
              </div>
            ))}
          </div>
          
          <div className="mb-2">
            <label className="form-label">Subir foto de perfil</label>
            <input type="file" name="photo" className="form-control bg-light border-0 shadow-sm" accept="image/*" />
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-warning fw-bold">Guardar</button>
            <button type="button" onClick={onLogout} className="btn btn-light">Cerrar sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
});

ProfileSection.displayName = "ProfileSection";

// Componente Familiares
const FamilySection = memo(({ relatives, onAddRelative, onRemoveRelative, sessionToken }) => {
  const familyFormFields = useMemo(() => [
    { name: "firstName", placeholder: "Nombre", cols: 6 },
    { name: "lastName", placeholder: "Apellido", cols: 6 },
    { name: "relation", placeholder: "Parentesco", cols: 6 },
    { name: "dni", placeholder: "Documento", cols: 6, required: true },
    { name: "phone", placeholder: "Teléfono", cols: 6, required: true },
    { name: "emergency", type: "select", cols: 6, options: [
      { value: "", label: "Contacto de emergencia", disabled: true },
      { value: "1", label: "Sí" },
      { value: "0", label: "No" }
    ]}
  ], []);

  return (
    <div className="col-lg-6">
      <div className="shadow p-4 bg-white rounded">
        <h5 className="fw-bold">Familia</h5>
        <p className="text-muted small">¿Quieres pertenecer al club familiar?</p>
        <p className="text-muted small">Registra a tus familiares</p>

        <form onSubmit={onAddRelative} className="row g-2">
          {familyFormFields.map((field) => (
            <div key={field.name} className={`col-md-${field.cols}`}>
              {field.type === "select" ? (
                <select name={field.name} className="form-control bg-light border-0 shadow-sm" defaultValue="">
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  name={field.name} 
                  className="form-control bg-light border-0 shadow-sm" 
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="col-12">
            <button type="submit" className="btn btn-warning fw-bold w-100">Agregar un familiar</button>
          </div>
        </form>

        {relatives.length > 0 && (
          <FamilyTable relatives={relatives} onRemoveRelative={onRemoveRelative} />
        )}
      </div>
    </div>
  );
});

FamilySection.displayName = "FamilySection";

// Tabla de familiares
const FamilyTable = memo(({ relatives, onRemoveRelative }) => (
  <div className="mt-4">
    <h6 className="fw-bold mb-2">Lista de familiares</h6>
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Parentesco</th>
            <th>Teléfono</th>
            <th>Documento</th>
            <th>Emergencia</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {relatives.map((r) => (
            <tr key={r.id} className={r.emergency === "1" ? "table-warning fw-bold" : ""}>
              <td>{r.name} {r.lastName}</td>
              <td>{r.relationship}</td>
              <td>{r.phone}</td>
              <td>{r.dni}</td>
              <td>
                {r.emergency == 1 ? (
                  <span className="badge bg-danger">Emergencia</span>
                ) : (
                  <span className="badge bg-secondary">No</span>
                )}
              </td>
              <td>
                <button
                  onClick={() => onRemoveRelative(r.id)}
                  className="btn btn-link text-danger p-0"
                >
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

FamilyTable.displayName = "FamilyTable";

// Componente principal
export default function Drivep() {
  // Estados
  const { session, setSession, relatives, setRelatives, logout } = useSession();
  const { apiCall } = useApi();
  const [showRegister, setShowRegister] = useState(false);
  const [accordionStates, setAccordionStates] = useState({
    offers: false,
    lostItems: false,
    jobApplications: false,
    ratings: false
  });
  const [offers, setOffers] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [appsRequested, setAppsRequested] = useState([]);
  const [ratings, setRatings] = useState([]);

  // Toggle acordeón
  const toggleAccordion = useCallback((key) => {
    setAccordionStates(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Login
  const onLogin = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email").trim();
    const password = formData.get("password").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      Swal.fire({ icon: "warning", title: "Datos inválidos", text: "Introduce un correo válido y contraseña de al menos 6 caracteres" });
      return;
    }

    try {
      const response = await apiCall("POST", "/user/login", { email, password });
      const { user, token } = response?.data || {};

      if (!user || !token) throw new Error("Respuesta inválida");

      sessionStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const driver = {
        id: user.id,
        email: user.email,
        name: user.name || user.username || "Conductor",
        token
      };

      setSession(driver);
      
      // Cargar datos del conductor
      await Promise.all([
        fetchRelatives(user.id, token),
        fetchDriverData(user.id, token)
      ]);

      Swal.fire({ icon: "success", title: "Login exitoso", text: `Bienvenido ${driver.name}` });
    } catch (error) {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      Swal.fire({ icon: "error", title: "Login fallido", text: msg });
    }
  }, [apiCall, setSession]);

  // Registro
  const onRegister = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const required = ["name", "lastName", "dni", "email", "phone", "taxiPlate", "photo"];
    for (const field of required) {
      if (!formData.get(field)) {
        Swal.fire({ icon: "warning", title: "Faltan datos", text: "Completa todos los campos obligatorios" });
        return;
      }
    }

    try {
      await apiCall("POST", "/driver", formData);
      Swal.fire({ icon: "success", title: "¡Registro exitoso!", text: "El conductor fue creado correctamente" });
      e.target.reset();
      setShowRegister(false);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Hubo un problema al crear el conductor" });
    }
  }, [apiCall]);

  // Actualizar perfil
  const updateProfile = useCallback(async (e) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await apiCall("PUT", `/driver/${session.id}`, formData);
      
      if (response?.code === 1) {
        const updated = response.data;
        setSession(prev => prev ? { 
          ...prev, 
          id: updated.user.id,
          name: updated.driver.name,
          lastName: updated.driver.lastName,
          dni: updated.driver.dni,
          phone: updated.driver.phone,
          plate: updated.driver.taxiPlate,
          companytaxi: updated.driver.companytaxi,
          photo: updated.driver.photo
        } : prev);
        
        Swal.fire({ icon: "success", title: "Perfil actualizado" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el perfil" });
    }
  }, [apiCall, session, setSession]);

  // Agregar familiar
  const addRelative = useCallback(async (e) => {
    e.preventDefault();
    if (!session?.token) return;

    const formData = new FormData(e.currentTarget);
    const relative = {
      driverId: session.id,
      name: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      dni: formData.get("dni").trim(),
      relationship: formData.get("relation").trim(),
      phone: formData.get("phone").trim(),
      emergency: formData.get("emergency").trim()
    };

    for (const [key, value] of Object.entries(relative)) {
      if (!value && key !== "emergency") {
        Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Todos los campos son obligatorios" });
        return;
      }
    }

    try {
      await apiCall("POST", "/driver_family", relative);
      fetchRelatives(session.id, session.token);
      e.target.reset();
      Swal.fire({ icon: "success", title: "Familiar agregado" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar el familiar" });
    }
  }, [apiCall, session]);

  // Eliminar familiar
  const removeRelative = useCallback(async (id) => {
    if (!session?.token) return;

    try {
      await apiCall("DELETE", `/driver_family/${id}`);
      fetchRelatives(session.id, session.token);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el familiar" });
    }
  }, [apiCall, session]);

  // Obtener familiares
  const fetchRelatives = useCallback(async (driverId, token) => {
    try {
      const response = await apiCall("GET", `/driver_family/driver/${driverId}`);
      if (response?.code === 1) {
        setRelatives(response.data);
      }
    } catch (error) {
      console.error("Error obteniendo familiares:", error);
    }
  }, [apiCall, setRelatives]);

  // Obtener datos del conductor
  const fetchDriverData = useCallback(async (driverId, token) => {
    try {
      const response = await apiCall("GET", `/driver/${driverId}`);
      if (response?.code === 1) {
        const user = response.data;
        setSession(prev => prev ? { 
          ...prev, 
          companytaxi: user.companytaxi, 
          plate: user.taxiPlate, 
          phone: user.phone, 
          dni: user.dni, 
          photo: user.photo, 
          averageRate: user.averageRate 
        } : prev);
      }
    } catch (error) {
      console.error("Error obteniendo datos del conductor:", error);
    }
  }, [apiCall, setSession]);

  // Obtener ofertas
  const fetchOffers = useCallback(async () => {
    if (!session) return;

    try {
      const response = await apiCall("GET", "/job_board/all", null, {
        authorization: process.env.REACT_APP_TOKEN_PUBLIC
      });
      
      const filtered = (response.data || []).filter(
        o => String(o.owner) === String(session.id)
      );
      setOffers(filtered);
    } catch (error) {
      console.error("Error consultando ofertas:", error);
    }
  }, [apiCall, session]);

  // Agregar oferta
  const addOffer = useCallback(async (e) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData(e.currentTarget);
    const offer = {
      owner: session.id,
      description: formData.get("description").trim(),
      contact: formData.get("contact").trim(),
      location: formData.get("location").trim(),
      status: "1"
    };

    for (const value of Object.values(offer)) {
      if (!value) {
        Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Todos los campos son obligatorios" });
        return;
      }
    }

    try {
      await apiCall("POST", "/job_board", offer);
      e.target.reset();
      fetchOffers();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo publicar la oferta" });
    }
  }, [apiCall, session, fetchOffers]);

  // Actualizar estado de oferta
  const updateStatus = useCallback(async (id, status) => {
    if (!session?.token) return;

    try {
      await apiCall("PATCH", `/job_board/${id}/status`, { status });
      fetchOffers();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Error actualizando status" });
    }
  }, [apiCall, session, fetchOffers]);

  // Eliminar oferta
  const deleteOffer = useCallback(async (id) => {
    if (!session?.token) return;

    try {
      await apiCall("DELETE", `/job_board/${id}`);
      fetchOffers();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Error eliminando oferta" });
    }
  }, [apiCall, session, fetchOffers]);

  // Obtener objetos perdidos
  const fetchLostItems = useCallback(async () => {
    try {
      const response = await apiCall("GET", "/lost_items");
      setLostReports(response.data || []);
    } catch (error) {
      console.error("Error obteniendo objetos perdidos:", error);
    }
  }, [apiCall]);

  // Agregar objeto perdido
  const addLostObject = useCallback(async (e) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData(e.target);
    formData.append("taxiPlate", session.plate);
    formData.append("owner", session.name);
    formData.append("contact", session.phone);
    formData.append("created_by", "taxista");

    try {
      await apiCall("POST", "/lost_items", formData);
      e.target.reset();
      fetchLostItems();
      Swal.fire({ icon: "success", title: "Objeto publicado", timer: 2000 });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo publicar el objeto perdido" });
    }
  }, [apiCall, session, fetchLostItems]);

  // Obtener postulaciones
  const fetchJobApplications = useCallback(async () => {
    try {
      const response = await apiCall("GET", "/job_application");
      setAppsRequested(response.data || []);
    } catch (error) {
      console.error("Error obteniendo postulaciones:", error);
    }
  }, [apiCall]);

  // Obtener calificaciones
  const fetchDriverRatings = useCallback(async () => {
    if (!session) return;

    try {
      const response = await apiCall("GET", `/rate_driver/driver/${session.id}`);
      setRatings(response.data || []);
    } catch (error) {
      console.error("Error obteniendo calificaciones:", error);
    }
  }, [apiCall, session]);

  // Efecto para cargar datos cuando hay sesión
  useEffect(() => {
    if (session?.id && session?.token) {
      Promise.all([
        fetchOffers(),
        fetchLostItems(),
        fetchJobApplications(),
        fetchDriverRatings(),
        fetchRelatives(session.id, session.token),
        fetchDriverData(session.id, session.token)
      ]);
    }
  }, [session, fetchOffers, fetchLostItems, fetchJobApplications, fetchDriverRatings, fetchRelatives, fetchDriverData]);

  // Render login/register
  if (!session) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5">
        <h2 className="mb-4">Portal del Taxista</h2>
        <div className="shadow p-4 bg-white rounded" style={{ width: "100%", maxWidth: "400px" }}>
          {showRegister ? (
            <RegisterForm onSubmit={onRegister} onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSubmit={onLogin} onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  // Render principal con sesión
  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5">
      <h2 className="mb-4">Portal del Taxista</h2>
      
      <div className="row g-4 w-100 px-3">
        <ProfileSection session={session} onUpdateProfile={updateProfile} onLogout={logout} />
        
        <FamilySection 
          relatives={relatives} 
          onAddRelative={addRelative} 
          onRemoveRelative={removeRelative} 
          sessionToken={session.token}
        />
        
        {/* Ofertas de empleo */}
        <div className="col-12">
          <Accordion 
            title="Propietario de taxi que busca trabajador taxista"
            subtitle="Publica una oferta para tus contactos"
            isOpen={accordionStates.offers}
            onToggle={() => toggleAccordion("offers")}
          >
            <JobOffersSection 
              offers={offers}
              onAddOffer={addOffer}
              onUpdateStatus={updateStatus}
              onDeleteOffer={deleteOffer}
              sessionName={session.name}
            />
          </Accordion>
        </div>
        
        {/* Objetos perdidos */}
        <div className="col-12">
          <Accordion 
            title="Encontré objeto perdido"
            subtitle="Publica si encontraste un objeto extraviado"
            isOpen={accordionStates.lostItems}
            onToggle={() => toggleAccordion("lostItems")}
          >
            <LostItemsSection 
              lostReports={lostReports}
              onAddLostObject={addLostObject}
            />
          </Accordion>
        </div>
        
        {/* Solicitudes de empleo */}
        <div className="col-12">
          <Accordion 
            title="Personas que buscan empleo"
            subtitle="Visualiza las personas interesadas en trabajar contigo"
            isOpen={accordionStates.jobApplications}
            onToggle={() => toggleAccordion("jobApplications")}
          >
            <JobApplicationsSection appsRequested={appsRequested} />
          </Accordion>
        </div>
        
        {/* Calificaciones */}
        <div className="col-12">
          <Accordion 
            title="Calificaciones recibidas"
            subtitle="Visualiza las opiniones de tus pasajeros"
            isOpen={accordionStates.ratings}
            onToggle={() => toggleAccordion("ratings")}
          >
            <RatingsSection ratings={ratings} />
          </Accordion>
        </div>
      </div>
    </div>
  );
}

// Componentes adicionales para las secciones

const JobOffersSection = memo(({ offers, onAddOffer, onUpdateStatus, onDeleteOffer, sessionName }) => (
  <>
    <form onSubmit={onAddOffer} className="row g-2">
      <div className="col-md-6">
        <input name="contact" className="form-control bg-light border-0 shadow-sm" placeholder="Teléfono o correo" />
      </div>
      <div className="col-md-6">
        <input name="location" className="form-control bg-light border-0 shadow-sm" placeholder="Ubicación" />
      </div>
      <div className="col-md-12">
        <textarea name="description" className="form-control bg-light border-0 shadow-sm" placeholder="Descripción del empleo" rows="3" />
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-warning fw-bold w-100">Publicar oferta</button>
      </div>
    </form>
    
    {offers.length > 0 && (
      <ul className="list-group list-group-flush mt-3">
        {offers.map((o) => (
          <li key={o.id} className="list-group-item bg-light rounded mb-2 shadow-sm border-0 d-flex justify-content-between align-items-center">
            <div>
              <strong>{sessionName}</strong> — {o.description}
              <br />
              📍 {o.location} | 📞 {o.contact}
            </div>
            <div className="btn-group">
              {o.status === "1" ? (
                <button className="btn btn-sm btn-warning" onClick={() => onUpdateStatus(o.id, "2")}>Deshabilitar</button>
              ) : (
                <button className="btn btn-sm btn-success" onClick={() => onUpdateStatus(o.id, "1")}>Habilitar</button>
              )}
              <button className="btn btn-sm btn-danger" onClick={() => onDeleteOffer(o.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </>
));

const LostItemsSection = memo(({ lostReports, onAddLostObject }) => (
  <>
    <form onSubmit={onAddLostObject} className="row g-2">
      <div className="col-md-12">
        <textarea name="description" className="form-control bg-light border-0 shadow-sm" placeholder="Descripción del objeto encontrado" rows="3" required />
      </div>
      <div className="col-md-6">
        <input type="date" name="date_travel" className="form-control bg-light border-0 shadow-sm" required />
      </div>
      <div className="col-md-6">
        <input type="file" name="photo" accept="image/*" className="form-control bg-light border-0 shadow-sm" required />
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-warning fw-bold w-100">Publicar objeto perdido</button>
      </div>
    </form>
    
    {lostReports.length > 0 && (
      <div className="mt-4">
        <h6 className="fw-bold mb-2">Objetos reportados</h6>
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Foto</th>
                <th>Descripción</th>
                <th>Taxista</th>
                <th>Placa</th>
                <th>Contacto</th>
                <th>Fecha viaje</th>
              </tr>
            </thead>
            <tbody>
              {lostReports.map((item, i) => (
                <tr key={i}>
                  <td style={{ width: "80px" }}>
                    {item.photo ? (
                      <img src={item.photo} alt="objeto" className="img-fluid rounded" />
                    ) : (
                      <span className="text-muted small">Sin foto</span>
                    )}
                  </td>
                  <td>{item.description}</td>
                  <td>{item.owner}</td>
                  <td>{item.taxiPlate}</td>
                  <td>{item.contact}</td>
                  <td>{item.date_travel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
));

const JobApplicationsSection = memo(({ appsRequested }) => (
  appsRequested.length > 0 ? (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Teléfono</th>
            <th>Sobre él</th>
            <th>Fecha de postulación</th>
          </tr>
        </thead>
        <tbody>
          {appsRequested.map((app, i) => (
            <tr key={i}>
              <td>{app.nameDriver}</td>
              <td>{app.dni}</td>
              <td>{app.contact}</td>
              <td>{app.description || "No especificada"}</td>
              <td>{app.createdAt || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-center text-muted small mt-3">No hay personas que hayan solicitado empleo aún.</p>
  )
));

const RatingsSection = memo(({ ratings }) => (
  ratings.length > 0 ? (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Observación</th>
            <th>Calificación</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((r, i) => (
            <tr key={i}>
              <td>{r.name || "Cliente Anónimo"}</td>
              <td>{r.observation || "Sin comentarios"}</td>
              <td className="text-warning fw-bold">⭐ {r.rate || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-center text-muted small mt-3">No tienes calificaciones aún.</p>
  )
));