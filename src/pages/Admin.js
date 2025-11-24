// Admin.jsx (reemplaza tu archivo actual)
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Importamos los componentes de modal de React Bootstrap
import Modal from "react-bootstrap/Modal";
import "../styles/Admin.css";

const API_BASE = "http://localhost:3050/api/v1";
const TOKEN_KEY = "auth_token";
const ADMIN_KEY = "admin_session";

/* Simple Stars component using Bootstrap icons */
function Stars({ value, size = 16 }) {
  return (
    <div className="d-flex align-items-center gap-1" aria-label={`Calificación: ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={`bi bi-star-fill ${i < Math.round(Number(value) || 0) ? "text-warning" : "text-secondary"}`}
          style={{ fontSize: size }}
        />
      ))}
    </div>
  );
}
function RatingInput({ value, onChange }) {
  return (
    <div
      className="d-flex align-items-center gap-1"
      role="radiogroup"
      aria-label="Selecciona calificación"
    >
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
              className={`bi ${
                active ? "bi-star-fill text-warning" : "bi-star text-secondary"
              }`}
              style={{ fontSize: "1.5rem" }}
            ></i>
          </button>
        );
      })}
    </div>
  );
}
export default function Admin() {
  const [session, setSession] = useState(null);
  const demoEmail = "admin@taxiseguro.com";
  const demoPassword = "123456";

  // Datos traídos desde la API
  const [ratings, setRatings] = useState([]);
  const [appsRequested, setAppsRequested] = useState([]); // job_application
  const [jobsPromoted, setJobsPromoted] = useState([]); // job_board
  const [lostReports, setLostReports] = useState([]); // lost_items
  const [drivers, setDrivers] = useState([]); // user filtered role === "2"

  // UI / navegación / búsquedas
  const [view, setView] = useState("search");
  const [qGlobal, setQGlobal] = useState("");
  const [qRatings, setQRatings] = useState("");
  const [qRequested, setQRequested] = useState("");
  const [qPromoted, setQPromoted] = useState("");
  const [qLost, setQLost] = useState("");
  const [qDrivers, setQDrivers] = useState("");
  const [driversAl, setDriversAl] = useState([]);
  // Selecciones / modales
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedRequested, setSelectedRequested] = useState(null);
  const [selectedPromoted, setSelectedPromoted] = useState(null);
  const [selectedLost, setSelectedLost] = useState(null);

  // Driver selection (puede venir de /user o crearse localmente)
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const selectedDriver = drivers.find((d) => String(d.id) === String(selectedDriverId)) || null;

  // --- session persistence ---
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
    // if token exists in sessionStorage, set axios header
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    if (session) {
      try {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
      } catch {
        localStorage.setItem(ADMIN_KEY, session);
      }
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
  }, [session]);
  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:3050/api/v1/driver/random/ten");
      setDriversAl(res.data?.data || []);
    } catch (err) {
      console.error("Error al obtener conductores:", err);
      setDriversAl([]);
    }
  };
  // --- FETCH FUNCTIONS ---
  const fetchRatings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rate_driver`);
      setRatings(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setRatings([]);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las calificaciones" });
    }
  };

  const fetchJobApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/job_application`);
      setAppsRequested(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching job applications:", err);
      setAppsRequested([]);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las postulaciones" });
    }
  };

  const fetchJobBoard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/job_board/all`, {
        headers: {
          authorization: `${process.env.REACT_APP_TOKEN_PUBLIC}`,
        },
      });
      setJobsPromoted(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching job board:", err);
      setJobsPromoted([]);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los empleos promocionados" });
    }
  };

  const fetchLostItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/lost_items`);
      setLostReports(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching lost items:", err);
      setLostReports([]);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los objetos perdidos" });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/driver`);
      const all = res.data?.data || [];
      setDrivers(all);
    } catch (err) {
      setDrivers([]);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los usuarios" });
    }
  };

  const fetchAll = async () => {
    // paralelizamos peticiones
    try {
      await Promise.all([fetchRatings(), fetchJobApplications(), fetchJobBoard(), fetchLostItems(), fetchUsers()]);
    } catch (err) {
      // ya manejado individualmente arriba
      console.error("fetchAll error:", err);
    }
  };

  // cargar todo inicialmente (y también después de login)
  useEffect(() => {
    // if (session) {
      fetchAll();
      fetchDrivers();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIN ---
  const onLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();

    try {
      const res = await axios.post(`${API_BASE}/user/login`, { email, password });

      const user = res.data?.data?.user;
      const token = res.data?.data?.token;
      if (!user || !token) throw new Error("Respuesta inválida del servidor");

      // Validación estrica de rol = 1 (admin)
      if (String(user.role) !== "1") {
        Swal.fire({ icon: "error", title: "Acceso denegado", text: "Este panel es solo para administradores.", confirmButtonColor: "#dc3545" });
        return;
      }

      // guardar token en sessionStorage y en axios header
      sessionStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const admin = { id: user.id, email: user.email, name: user.name || user.username || "Admin", role: user.role };
      setSession(admin);

      Swal.fire({ icon: "success", title: "Login exitoso", text: `Bienvenido ${admin.name}`, confirmButtonColor: "#28a745" });

      // refetch datos que puedan requerir token
      fetchAll();
    } catch (err) {
      console.error("Error en login:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Error al iniciar sesión";
      Swal.fire({ icon: "error", title: "Login fallido", text: msg, confirmButtonColor: "#dc3545" });
    }
  };
  // --- DELETE FUNCTIONS ---
  const deleteRating = async (id) => {
    try {
      await axios.delete(`${API_BASE}/rate_driver/${id}`);
      setRatings((prev) => prev.filter((r) => r.id !== id));
      Swal.fire({ icon: "success", title: "Eliminado", text: "Calificación eliminada", confirmButtonColor: "#28a745" });
    } catch (err) {
      console.error("Error al eliminar calificación:", err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar la calificación" });
    }
  };

  const deleteJobApplication = async (id) => {
    try {
      await axios.delete(`${API_BASE}/job_application/${id}`);
      setAppsRequested((prev) => prev.filter((a) => a.id !== id));
      Swal.fire({ icon: "success", title: "Eliminado", text: "Postulación eliminada", confirmButtonColor: "#28a745" });
    } catch (err) {
      console.error("Error al eliminar postulación:", err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar la postulación" });
    }
  };

  const deleteJobPromotion = async (id) => {
    try {
      await axios.delete(`${API_BASE}/job_board/${id}`);
      setJobsPromoted((prev) => prev.filter((j) => j.id !== id));
      Swal.fire({ icon: "success", title: "Eliminado", text: "Vacante eliminada", confirmButtonColor: "#28a745" });
    } catch (err) {
      console.error("Error al eliminar vacante:", err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar la vacante" });
    }
  };

  const deleteLostItem = async (id) => {
    try {
      await axios.delete(`${API_BASE}/lost_items/${id}`);
      setLostReports((prev) => prev.filter((r) => r.id !== id));
      Swal.fire({ icon: "success", title: "Eliminado", text: "Reporte de objeto perdido eliminado", confirmButtonColor: "#28a745" });
    } catch (err) {
      console.error("Error al eliminar objeto perdido:", err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el reporte" });
    }
  };

  const deleteDriver = async (id) => {
    try {
      await axios.delete(`${API_BASE}/driver/${id}`);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      if (selectedDriverId === id) setSelectedDriverId(null);
      Swal.fire({ icon: "success", title: "Eliminado", text: "Conductor eliminado", confirmButtonColor: "#28a745" });
    } catch (err) {
      console.error("Error al eliminar conductor:", err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar al conductor" });
    }
  };
  const onLogout = () => {
    setSession(null);
    sessionStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
  };

    // Crear nuevo taxista local (sigue funcionando como antes)
  const createDriver = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const plate = String(fd.get("taxiPlate") || "").trim().toUpperCase();

    // Validación
    if (!name || !email || !phone  || !plate) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos",
        text: "Completa todos los campos obligatorios",
        confirmButtonColor: "#f1c40f",
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/driver`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "El conductor fue creado correctamente",
        confirmButtonColor: "#28a745",
      });

      // resetear formulario
      e.target.reset();

      // opcional: actualizar estado local con la data devuelta
      const newDriver = {
        id: res.data?.id || `d${Date.now()}`, // usar el id real si lo devuelve el API
        name,
        username: email.split("@")[0],
        email,
        phone,
        plate,
        rating: 0,
        avatarUrl: undefined,
        family: [],
        createdAt: new Date().toISOString(),
        role: "2",
      };

      setDrivers((arr) => [newDriver, ...arr]);
      setSelectedDriverId(newDriver.id);

    } catch (err) {
      console.error("Error al registrar:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Hubo un problema al crear el conductor",
        confirmButtonColor: "#dc3545",
      });
    }
  };
  // Añadir familia local (como antes)
  const addFamily = (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const relation = String(fd.get("relation") || "").trim();
    const age = Number(fd.get("age") || 0);
    if (!firstName || !lastName || !relation || !age) return;
    setDrivers((arr) =>
      arr.map((d) =>
        String(d.id) === String(selectedDriver.id)
          ? { ...d, family: [...(d.family || []), { firstName, lastName, relation, age }] }
          : d
      )
    );
    e.target.reset();
  };

  // --- RENDER ---
  return (
    <div className="container py-5">
      {!session ? (
        <>
          <h1 className="mb-4">Administrador</h1>
          <div className="card shadow mb-4">
            <div className="card-header bg-warning text-white">Iniciar sesión</div>
            <div className="card-body">
              <form onSubmit={onLogin}>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input type="email" name="email" className="form-control" defaultValue={demoEmail} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input type="password" name="password" className="form-control" defaultValue={demoPassword} />
                </div>
                <button type="submit" className="btn btn-primary w-100">Ingresar</button>
              </form>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Panel administrador</h1>
            <div>
              <small className="me-2 text-muted">Hola, {session.name}</small>
              <button className="btn btn-outline-secondary" onClick={onLogout}>Cerrar sesión</button>
            </div>
          </div>
          {/* === TAXISTAS DESTACADOS (más pequeño) === */}
          <div className="card-body d-flex overflow-auto gap-2 py-2">
            {drivers.map((d) => (
              <div
                key={d.id}
                onClick={() => { setView("drivers"); setSelectedDriverId(d.id); }}
                className="card text-center p-2 shadow-sm border-0"
                style={{ minWidth: "150px", maxWidth: "150px" }}
              >
                <div
                  className="rounded-circle mx-auto overflow-hidden"
                  style={{ width: "50px", height: "50px" }}
                >
                  {d.photo ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL_SOCKET}${d.photo.replace('http://localhost:3050', '')}`}
                      alt={d.name}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-100 h-100 bg-warning d-flex align-items-center justify-content-center fw-bold';
                        fallback.textContent = d.name.split(" ").map((s) => s[0]).join("");
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div className="w-100 h-100 bg-warning d-flex align-items-center justify-content-center fw-bold">
                      {d.name.split(" ").map((s) => s[0]).join("")}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-1 fw-semibold" style={{ fontSize: "0.8rem" }}>{d.name}</div>
                <div className="text-muted small" style={{ fontSize: "0.7rem" }}>Placa {d.taxiPlate}</div>

                {/* Rating */}
                <div className="mt-1" style={{ transform: "scale(0.8)" }}>
                  <RatingInput value={Math.round(d.averageRate)} onChange={() => {}} />
                </div>
              </div>
            ))}
          </div>
          <div className="row">
            <aside className="col-lg-3 mb-3">
              <div className="card sticky-top" style={{ top: "1rem" }}>
                <div className="card-header">Secciones</div>
                <div className="list-group list-group-flush">
                  {[
                    { key: "search", label: "Buscador" },
                    { key: "ratings", label: "Calificaciones de taxistas" },
                    { key: "requested", label: "Busco trabajo" },
                    { key: "promoted", label: "Busco conductor" },
                    { key: "lost", label: "Objetos encontrados" },
                    { key: "drivers", label: "Taxistas vinculados" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      className={`list-group-item list-group-item-action ${view === item.key ? "active" : ""}`}
                      onClick={() => setView(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="col-lg-9">
              {/* SEARCH */}
              {view === "search" && (
                <div className="card shadow mb-3">
                  <div className="card-header">Búsqueda global</div>
                  <div className="card-body">
                    <div className="input-group mb-3">
                      <input type="text" className="form-control" placeholder="Buscar..." value={qGlobal} onChange={(e) => setQGlobal(e.target.value)} />
                      <span className="input-group-text"><i className="bi bi-search"></i></span>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <h6>Taxistas</h6>
                        {drivers
                          .filter((d) => ((d.name || "") + (d.username || "") + (d.email || "") + (d.plate || "")).toLowerCase().includes(qGlobal.toLowerCase()))
                          .map((d) => (
                            <div key={d.id} className="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
                              <div>
                                <strong>{d.name} {d.username ? `— ${d.username}` : ""} {d.plate ? `— ${d.plate}` : ""}</strong>
                                <div className="small text-muted">{d.email}</div>
                              </div>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => { setView("drivers"); setSelectedDriverId(d.id); }}>Ver</button>
                            </div>
                          ))}
                      </div>

                      <div className="col-md-6">
                        <h6>Empleos</h6>
                        {appsRequested
                          .filter((a) => ((a.nameDriver || "") + (a.dni || "") + (a.contact || "") + (a.cv || "")).toLowerCase().includes(qGlobal.toLowerCase()))
                          .map((a) => (
                            <div key={a.id} className="border rounded p-2 mb-2">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <strong>{a.nameDriver}</strong>
                                  <div className="text-muted small">{a.dni} — {a.contact}</div>
                                </div>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedRequested(a)}>Ver</button>
                              </div>
                              <div className="small mt-1">CV: {a.cv ? <a href={a.cv} target="_blank" rel="noreferrer">Ver</a> : "—"}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RATINGS */}
              {view === "ratings" && (
                <div className="card shadow mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Calificaciones de taxistas</span>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={fetchRatings}>Recargar</button>
                      <button className="btn btn-sm btn-outline-primary" onClick={fetchAll}>Recargar todo</button>
                    </div>
                  </div>
                  <div className="card-body">
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Buscar por autor, placa, comentario o email"
                      value={qRatings}
                      onChange={(e) => setQRatings(e.target.value)}
                    />
                    <div className="d-grid gap-2">
                      {ratings
                        .filter((r) =>
                          (
                            (r.name || "") +
                            (r.taxiPlate || "") +
                            (r.observation || "") +
                            (r.email || "")
                          )
                            .toLowerCase()
                            .includes(qRatings.toLowerCase())
                        )
                        .map((r) => (
                          <div key={r.id} className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>Placa: {r.taxiPlate}</strong>
                                <div className="small text-muted">Autor: {r.name || "Anónimo"} {r.email ? `— ${r.email}` : ""}</div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <Stars value={Number(r.rate)} />
                                <span className="small text-muted">{r.rate}/5</span>
                                <button
                                  className="btn btn-sm btn-outline-danger ms-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    Swal.fire({
                                      title: "¿Eliminar?",
                                      text: "Esta acción no se puede deshacer",
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#d33",
                                      cancelButtonColor: "#6c757d",
                                      confirmButtonText: "Sí, eliminar",
                                      cancelButtonText: "Cancelar"
                                    }).then((result) => {
                                      if (result.isConfirmed) deleteRating(r.id);
                                    });
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedRating(r)}>Ver</button>
                              </div>
                            </div>
                            <div className="mt-2">{r.observation}</div>
                            <div className="small text-muted mt-1">Fecha: {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</div>
                          </div>
                        ))}
                      {ratings.length === 0 && (
                        <div className="text-center p-3 text-muted">No hay calificaciones registradas.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REQUESTED (APPLICANTS) */}
              {view === "requested" && (
                <div className="card shadow mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Empleos pedidos</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={fetchJobApplications}>Recargar</button>
                  </div>
                  <div className="card-body">
                    <input type="text" className="form-control mb-3" placeholder="Buscar por nombre, cédula o contacto" value={qRequested} onChange={(e) => setQRequested(e.target.value)} />
                    <div className="d-grid gap-2">
                      {appsRequested
                        .filter((a) => ((a.nameDriver || "") + (a.dni || "") + (a.contact || "") + (a.cv || "")).toLowerCase().includes(qRequested.toLowerCase()))
                        .map((a) => (
                          <div key={a.id} className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{a.nameDriver}</strong>
                                <div className="small text-muted">{a.dni} — {a.contact}</div>
                              </div>
                              <div>
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  Swal.fire({
                                    title: "¿Eliminar postulación?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#6c757d",
                                    confirmButtonText: "Sí, eliminar",
                                    cancelButtonText: "Cancelar"
                                  }).then((result) => {
                                    if (result.isConfirmed) deleteJobApplication(a.id);
                                  });
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedRequested(a)}>Ver</button>
                              
                            </div>
                            </div>
                            <div className="mt-1 small text-muted">CV: {a.cv ? <a href={a.cv} target="_blank" rel="noreferrer">Ver</a> : "—"}</div>
                            <div className="small text-muted mt-1">Fecha: {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</div>
                          </div>
                        ))}
                      {appsRequested.length === 0 && <div className="text-muted p-2">No hay solicitudes de empleo.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* PROMOTED JOBS */}
              {view === "promoted" && (
                <div className="card shadow mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Empleos promocionados</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={fetchJobBoard}>Recargar</button>
                  </div>
                  <div className="card-body">
                    <input type="text" className="form-control mb-3" placeholder="Buscar por descripción, ubicación o contacto" value={qPromoted} onChange={(e) => setQPromoted(e.target.value)} />
                    <div className="d-grid gap-2">
                      {jobsPromoted
                        .filter((j) => ((j.description || "") + (j.location || "") + (j.contact || "") + (j.status || "")).toLowerCase().includes(qPromoted.toLowerCase()))
                        .map((j) => (
                          <div key={j.id} className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{j.description}</strong>
                                <div className="small text-muted">{j.location} — {j.contact}</div>
                              </div>
                              <div>
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  Swal.fire({
                                    title: "¿Eliminar vacante?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#6c757d",
                                    confirmButtonText: "Sí, eliminar",
                                    cancelButtonText: "Cancelar"
                                  }).then((result) => {
                                    if (result.isConfirmed) deleteJobPromotion(j.id);
                                  });
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedPromoted(j)}>Ver</button>
                            </div>
                            </div>
                          </div>
                        ))}
                      {jobsPromoted.length === 0 && <div className="text-muted p-2">No hay empleos promocionados.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* LOST REPORTS */}
              {view === "lost" && (
                <div className="card shadow mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Objetos perdidos</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={fetchLostItems}>Recargar</button>
                  </div>
                  <div className="card-body">
                    <input type="text" className="form-control mb-3" placeholder="Buscar por placa, descripción, dueño o contacto" value={qLost} onChange={(e) => setQLost(e.target.value)} />
                    <div className="d-grid gap-2">
                      {lostReports
                        .filter((r) => ((r.taxiPlate || "") + (r.description || "") + (r.owner || "") + (r.contact || "")).toLowerCase().includes(qLost.toLowerCase()))
                        .map((r) => (
                          <div key={r.id} className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>Placa {r.taxiPlate}</strong>
                                <div className="small text-muted">{r.description}</div>
                                <div className="small text-muted">Dueño: {r.owner} — {r.contact}</div>
                              </div>
                              <div>
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  Swal.fire({
                                    title: "¿Eliminar reporte?",
                                    text: "Se perderá toda la información del objeto",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#6c757d",
                                    confirmButtonText: "Sí, eliminar",
                                    cancelButtonText: "Cancelar"
                                  }).then((result) => {
                                    if (result.isConfirmed) deleteLostItem(r.id);
                                  });
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedLost(r)}>Ver</button>
                            </div>
                            </div>
                          </div>
                        ))}
                      {lostReports.length === 0 && <div className="text-muted p-2">No hay reportes de objetos perdidos.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* DRIVERS - create, list, details (incluye calificaciones filtradas por driverId o placa) */}
              {view === "drivers" && (
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <div className="card shadow">
                      <div className="card-header">Crear taxista</div>
                      <div className="card-body">
                        <form onSubmit={createDriver}>
                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <label className="form-label">Nombre</label>
                              <input id="name" name="name" className="form-control" placeholder="Nombre completo" />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label className="form-label">Apellido</label>
                              <input id="lastName" name="lastName" className="form-control" placeholder="Apellido completo" />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-4 mb-2">
                              <label className="form-label">CC</label>
                              <input id="dni" name="dni" className="form-control" placeholder="Número de documento" />
                            </div>
                            <div className="col-md-4 mb-2">
                              <label className="form-label">Teléfono</label>
                              <input id="phone" name="phone" className="form-control" placeholder="+57 300 000 0000" />
                            </div>
                            <div className="col-md-4 mb-2">
                              <label className="form-label">Correo</label>
                              <input id="email" name="email" type="email" className="form-control" placeholder="correo@ejemplo.com" />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <label className="form-label">Placa</label>
                              <input id="taxiPlate" name="taxiPlate" className="form-control text-uppercase" placeholder="ABC123" />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label className="form-label">Empresa</label>
                              <input id="companytaxi" name="companytaxi" className="form-control text-uppercase" placeholder="Taxis Cali" />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-12 mb-2">
                              <label className="form-label">Foto</label>
                              <input id="photo" name="photo" type="file" accept="image/*" className="form-control" />
                            </div>
                          </div>

                          <button type="submit" className="btn btn-primary mt-2">Crear taxista</button>
                        </form>

                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 mb-3">
                    <div className="card shadow">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Taxistas vinculados</span>
                        <button className="btn btn-sm btn-outline-secondary" onClick={fetchUsers}>
                          Recargar
                        </button>
                      </div>

                      <div className="card-body">
                        <input
                          type="text"
                          className="form-control mb-3"
                          placeholder="Buscar por nombre, usuario o email"
                          value={qDrivers}
                          onChange={(e) => setQDrivers(e.target.value)}
                        />

                        <div className="list-group">
                          {drivers
                            .filter((d) =>
                              ((d.name || "") + (d.username || "") + (d.email || "") + (d.plate || ""))
                                .toLowerCase()
                                .includes(qDrivers.toLowerCase())
                            )
                            .map((d) => (
                              <button
                                key={d.id}
                                className={`list-group-item list-group-item-action d-flex align-items-center ${
                                  String(selectedDriverId) === String(d.id) ? "active" : ""
                                }`}
                                onClick={() =>
                                  // Si se vuelve a hacer clic sobre el mismo taxista, se deselecciona
                                  setSelectedDriverId((prev) =>
                                    String(prev) === String(d.id) ? null : d.id
                                  )
                                }
                              >
                                <img
                                  src={`${process.env.REACT_APP_API_URL_SOCKET}${
                                    d.photo ? d.photo.replace("http://localhost:3050", "") : ""
                                  }`}
                                  alt={d.name}
                                  className="rounded-circle me-3"
                                  style={{ width: 64, height: 64, objectFit: "cover" }}
                                />
                                <div className="flex-grow-1 text-start">
                                  <div>
                                    <strong>
                                      {d.name} {d.username ? `— ${d.username}` : ""}
                                    </strong>
                                  </div>
                                  <div className="small text-muted">
                                    {d.email}
                                    {d.plate ? ` — ${d.plate}` : ""}
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* === DETALLE DEL TAXISTA SELECCIONADO === */}
                  {selectedDriver && (
                    <div className="col-12">
                      <div className="card shadow">
                        <div className="card-header">Detalle del taxista</div>
                        <div className="card-body">
                          {/* === Info general === */}
                          <div className="d-flex align-items-center mb-3">
                            <img
                              src={`${process.env.REACT_APP_API_URL_SOCKET}${
                                selectedDriver.photo
                                  ? selectedDriver.photo.replace("http://localhost:3050", "")
                                  : ""
                              }`}
                              alt={selectedDriver.name}
                              className="rounded-circle me-3"
                              style={{ width: 64, height: 64, objectFit: "cover" }}
                            />
                            <div>
                              <div className="h5 mb-0">{selectedDriver.name}</div>
                              <div className="small text-muted">
                                {selectedDriver.email}{" "}
                                {selectedDriver.phone ? `— ${selectedDriver.phone}` : ""}
                              </div>
                              <div className="small">
                                {selectedDriver.license
                                  ? `Licencia ${selectedDriver.license}`
                                  : ""}
                                {selectedDriver.plate
                                  ? ` — Placa ${selectedDriver.plate}`
                                  : ""}
                              </div>
                              <div className="mt-1">
                                <Stars value={selectedDriver.rating || 0} />
                              </div>
                            </div>
                          </div>

                          {/* === Calcular y mostrar conteo de estrellas (en línea) === */}
                          {(() => {
                            const starsCount = [1, 2, 3, 4, 5].reduce((acc, val) => {
                              acc[val] = ratings.filter(
                                (r) =>
                                  Number(r.rate) === val &&
                                  ((r.driverId && selectedDriver.id && String(r.driverId) === String(selectedDriver.id)) ||
                                    (r.taxiPlate &&
                                      selectedDriver.plate &&
                                      r.taxiPlate.toLowerCase() === String(selectedDriver.plate).toLowerCase()))
                              ).length;
                              return acc;
                            }, {});

                            const totalRatings = Object.values(starsCount).reduce((a, b) => a + b, 0);

                            return (
                              <div className="mb-3">
                                <h6>Distribución de calificaciones</h6>
                                {totalRatings === 0 ? (
                                  <div className="small text-muted">Aún no tiene calificaciones.</div>
                                ) : (
                                  <div className="d-flex justify-content-between align-items-center flex-wrap bg-light p-2 rounded">
                                    {[5, 4, 3, 2, 1].map((n) => (
                                      <div
                                        key={n}
                                        className="d-flex align-items-center mx-2 my-1 px-2 py-1 border rounded bg-white shadow-sm"
                                        style={{ minWidth: 80 }}
                                      >
                                        <span className="me-1 fw-semibold">{n}⭐</span>
                                        <span className="badge bg-warning text-dark">{starsCount[n] || 0}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}


                          {/* === Calificaciones === */}
                          <div>
                            <h6>Calificaciones recibidas</h6>
                            <input
                              className="form-control mb-2"
                              placeholder="Buscar en los comentarios"
                              value={qRatings}
                              onChange={(e) => setQRatings(e.target.value)}
                            />

                            <div className="d-grid gap-2">
                              {ratings
                                .filter((r) => {
                                  if (
                                    r.driverId &&
                                    selectedDriver.id &&
                                    String(r.driverId) === String(selectedDriver.id)
                                  )
                                    return true;
                                  if (
                                    r.taxiPlate &&
                                    selectedDriver.plate &&
                                    r.taxiPlate.toLowerCase() ===
                                      String(selectedDriver.plate).toLowerCase()
                                  )
                                    return true;
                                  return false;
                                })
                                .filter((r) =>
                                  ((r.observation || "") + (r.name || "") + (r.email || ""))
                                    .toLowerCase()
                                    .includes(qRatings.toLowerCase())
                                )
                                .map((r) => (
                                  <div key={r.id} className="border rounded p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <div className="small text-muted">
                                          Autor: {r.name || "Anónimo"}{" "}
                                          {r.email ? `— ${r.email}` : ""}
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <Stars value={Number(r.rate)} />
                                        <div className="small text-muted">
                                          Placa {r.taxiPlate}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-2">“{r.observation}”</div>
                                    <div className="small text-muted mt-1">
                                      Fecha:{" "}
                                      {r.createdAt
                                        ? new Date(r.createdAt).toLocaleString()
                                        : ""}
                                    </div>
                                  </div>
                                ))}

                              {/* Sin calificaciones */}
                              {ratings.filter((r) => {
                                if (
                                  r.driverId &&
                                  selectedDriver.id &&
                                  String(r.driverId) === String(selectedDriver.id)
                                )
                                  return true;
                                if (
                                  r.taxiPlate &&
                                  selectedDriver.plate &&
                                  r.taxiPlate.toLowerCase() ===
                                    String(selectedDriver.plate).toLowerCase()
                                )
                                  return true;
                                return false;
                              }).length === 0 && (
                                <div className="text-muted small p-2">
                                  No hay calificaciones para este conductor.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </section>
          </div>

          {/* Modals usando React Bootstrap */}
          <Modal show={!!selectedLost} onHide={() => setSelectedLost(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Objeto perdido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedLost && (
                <div>
                  <p><strong>Placa:</strong> {selectedLost.taxiPlate}</p>
                  <p><strong>Fecha del viaje:</strong> {selectedLost.date_travel}</p>
                  <p><strong>Detalles:</strong> {selectedLost.description}</p>
                  {selectedLost.photo && <div className="mb-2"><img src={selectedLost.photo} alt="objeto" style={{ maxWidth: "100%" }} /></div>}
                  <p className="small text-muted">Reportante: {selectedLost.owner || "Anónimo"} — {selectedLost.contact || "—"}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-secondary" onClick={() => setSelectedLost(null)}>Cerrar</button>
            </Modal.Footer>
          </Modal>

          <Modal show={!!selectedPromoted} onHide={() => setSelectedPromoted(null)}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedPromoted ? `Vacante` : "Vacante"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedPromoted && (
                <div>
                  <p><strong>Descripción:</strong> {selectedPromoted.description}</p>
                  <p><strong>Ciudad:</strong> {selectedPromoted.location}</p>
                  <p><strong>Contacto:</strong> {selectedPromoted.contact}</p>
                  <p className="small text-muted">Estado: {selectedPromoted.status}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-secondary" onClick={() => setSelectedPromoted(null)}>Cerrar</button>
            </Modal.Footer>
          </Modal>

          <Modal show={!!selectedRequested} onHide={() => setSelectedRequested(null)}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedRequested ? `Postulación: ${selectedRequested.nameDriver}` : "Postulación"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedRequested && (
                <div>
                  <p><strong>Nombre:</strong> {selectedRequested.nameDriver}</p>
                  <p><strong>Cédula:</strong> {selectedRequested.dni}</p>
                  <p><strong>Contacto:</strong> {selectedRequested.contact}</p>
                  <p><strong>CV:</strong> {selectedRequested.cv ? <a href={selectedRequested.cv} target="_blank" rel="noreferrer">Ver CV</a> : "—"}</p>
                  <p className="small text-muted">Fecha: {selectedRequested.createdAt ? new Date(selectedRequested.createdAt).toLocaleString() : ""}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-secondary" onClick={() => setSelectedRequested(null)}>Cerrar</button>
            </Modal.Footer>
          </Modal>

          <Modal show={!!selectedRating} onHide={() => setSelectedRating(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Calificación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedRating && (
                <div>
                  <p><strong>Placa:</strong> {selectedRating.taxiPlate || selectedRating.plate || "—"}</p>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Stars value={Number(selectedRating.rate || selectedRating.rating || 0)} />
                    <span>{selectedRating.rate || selectedRating.rating}/5</span>
                  </div>
                  <p><strong>Comentario:</strong> "{selectedRating.observation || selectedRating.comment || ""}"</p>
                  <p className="small text-muted">
                    Autor: {selectedRating.name || selectedRating.author?.name || "Anónimo"}
                    {selectedRating.email ? ` — ${selectedRating.email}` : ""}
                    {selectedRating.contact ? ` — ${selectedRating.contact}` : ""}
                  </p>
                  <p className="small text-muted">Fecha: {selectedRating.createdAt ? new Date(selectedRating.createdAt).toLocaleString() : ""}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-secondary" onClick={() => setSelectedRating(null)}>Cerrar</button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
