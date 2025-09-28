// src/pages/Drivep.js
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import Swal from "sweetalert2";

const SESSION_KEY = "driver_session_v1";
const TOKEN_KEY = "driver_token_v1";
const API_BASE = "http://localhost:3050/api/v1";

export default function Drivep() {
  const [session, setSession] = useState(null);
  const [relatives, setRelatives] = useState([]);
  const [rating, setRating] = useState(0);
  const [offers, setOffers] = useState([]);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed.driver);
        setRelatives(parsed.relatives || []);
        setRating(parsed.driver?.rating || 0);
      } catch {}
    }

    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ driver: { ...session, rating }, relatives })
      );
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session, relatives, rating]);

  // -------------------------
  // login real usando el API
  // -------------------------
  const onLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") || "").toString().trim();
    const password = (fd.get("password") || "").toString().trim();

    // validaciones básicas cliente
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Datos inválidos",
        text: "Introduce un correo válido y una contraseña de al menos 6 caracteres",
        confirmButtonColor: "#f1c40f",
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/user/login`, { email, password });

      // estructura esperada según tu ejemplo: res.data.data.user + token
      const user = res.data?.data?.user;
      const token = res.data?.data?.token;

      if (!user || !token) {
        throw new Error("Respuesta inválida del servidor");
      }

      // guardar token de forma menos persistente (sessionStorage)
      sessionStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // establecer sesión en la UI (ojo: aquí guardamos sólo datos no sensibles)
      const driver = {
        id: user.id,
        email: user.email,
        name: user.name || user.username || "Conductor",
        token: token,
        // si tu API tiene más campos, agrégalos aquí
        // license/plate/phone no vienen en /user/login => puedes obtenerlos con otro endpoint autorizado
      };

      setSession(driver);
      setRating(driver.rating || 0);
      fetchRelatives(user.id, token);
      fetchOffers();
      setmydata(user.id, token);
      Swal.fire({
        icon: "success",
        title: "Login exitoso",
        text: `Bienvenido ${driver.name}`,
        confirmButtonColor: "#28a745",
      });
    } catch (err) {
      console.error("Error en login:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error al iniciar sesión";
      Swal.fire({
        icon: "error",
        title: "Login fallido",
        text: msg,
        confirmButtonColor: "#dc3545",
      });
    }
  };

  // logout: quitar token y sesión
  const onLogout = () => {
    setSession(null);
    setRelatives([]);
    setRating(0);
    sessionStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    Swal.fire({
      icon: "info",
      title: "Sesión cerrada",
      showConfirmButton: false,
      timer: 900,
    });
  };
  // registro básico
  const onRegister = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (
      !fd.get("name") ||
      !fd.get("lastName") ||
      !fd.get("dni") ||
      !fd.get("email") ||
      !fd.get("phone") ||
      !fd.get("taxiPlate") ||
      !fd.get("photo")
    ) {
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

      console.log("Respuesta API:", res.data);

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "El conductor fue creado correctamente",
        confirmButtonColor: "#28a745",
      });

      e.target.reset();
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

  // updateProfile, addRelative, removeRelative, renderStars y JSX (no cambian)
  const updateProfile = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);

  try {
    const res = await axios.put(
      `http://localhost:3050/api/v1/driver/${session.id}`, 
      fd, 
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (res.data?.code === 1) {
      const updated = res.data.data;
      // Actualiza la sesión local con los datos que devuelve el backend
      setSession((s) => 
        s ? { 
          ...s, 
          id: updated.user.id,
          name: updated.driver.name,
          lastName: updated.driver.lastName,
          dni: updated.driver.dni,
          phone: updated.driver.phone,
          plate: updated.driver.taxiPlate,
          photo: updated.driver.photo,   // 👈 la foto nueva
        } : s
      );

      alert("Perfil actualizado con éxito ✅");
    }
  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    alert("No se pudo actualizar el perfil");
  }
};
  const addRelative = async (e) => {
    e.preventDefault();
    if (!session?.token) {
      alert("No hay sesión activa");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const name = fd.get("firstName").trim();
    const lastName = fd.get("lastName").trim();
    const dni = fd.get("dni").trim();
    const relationship = fd.get("relation").trim();
    const phone = fd.get("phone").trim();

    if (!name || !lastName || !dni || !relationship || !phone) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const payload = {
        driverId: session.id,
        name,
        lastName,
        dni,
        relationship,
        phone,
      };

      console.log("📤 Enviando familiar:", payload);

      const res = await axios.post(`${API_BASE}/driver_family`, payload, {
        headers: { Authorization: `Bearer ${session.token}` },
      });

      console.log("✅ Respuesta backend:", res.data);

      if (res.data?.code === 1) {
        fetchRelatives(session.id, session.token);
        e.target.reset();
        alert("Familiar agregado con éxito");
      } else {
        alert(res.data.message || "Error al guardar familiar");
      }
    } catch (err) {
      console.error("❌ Error guardando familiar:", err);
      alert("No se pudo guardar el familiar");
    }
  };
const fetchRelatives = async (driverId, token) => {
  try {
    const res = await axios.get(`${API_BASE}/driver_family/driver/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.code === 1) {
      setRelatives(res.data.data);
    }
  } catch (err) {
    console.error("❌ Error obteniendo familiares:", err);
  }
};
const setmydata = async (driverId, token) => {
  try {
    const res = await axios.get(`${API_BASE}/driver/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data?.code === 1) {
      const user = res.data.data;
      setSession((s) => (s ? { ...s, plate: user.taxiPlate, phone: user.phone, dni: user.dni, photo: user.photo, averageRate:user.averageRate } : s));
    }
  } catch (err) {
    console.error("❌ Error obteniendo datos del conductor:", err);
  }
};
const removeRelative = async (id) => {
  try {
    await axios.delete(`http://localhost:3050/api/v1/driver_family/${id}`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    fetchRelatives(session.id, session.token);
  } catch (error) {
    console.error("Error eliminando familiar:", error);
    alert("No se pudo eliminar el familiar, intenta nuevamente.");
  }
};
  const addOffer = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const owner = session.id;
    const description = fd.get("description").trim();
    const contact = fd.get("contact").trim();
    const location = fd.get("location").trim();

    if (!owner || !description || !contact || !location) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3050/api/v1/job_board",
        {
          owner,
          description,
          contact,
          location,
          status: "1",
        },
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      e.target.reset();
      fetchOffers(session); // refrescar lista
    } catch (error) {
      console.error("Error creando oferta:", error);
      alert("No se pudo publicar la oferta");
    }
  };
  useEffect(() => {
  if (session?.id && session?.token) {
    fetchOffers(session);
    // setmydata(session.id, session.token);
  }
}, [session]);


const fetchOffers = async (session) => {
  try {
    const { data } = await axios.get("http://localhost:3050/api/v1/job_board/all", {
      headers: {
        // Authorization: `Bearer ${session.token}`, // si tu API requiere token
        authorization: `${process.env.REACT_APP_TOKEN_PUBLIC}`,
      },
    });
     const filtered = (data.data || []).filter(
      (o) => String(o.owner) === String(session.id)
    );

    setOffers(filtered);
  } catch (error) {
    console.error("Error consultando ofertas:", error);
  }
};
const updateStatus = async (id, status) => {
  try {
    await axios.patch(
      `http://localhost:3050/api/v1/job_board/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      }
    );
    fetchOffers(session); // recarga las ofertas después de actualizar
  } catch (error) {
    console.error("Error actualizando status:", error);
  }
};

const deleteOffer = async (id) => {
  try {
    await axios.delete(`http://localhost:3050/api/v1/job_board/${id}`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    fetchOffers(session); // recarga las ofertas después de eliminar
  } catch (error) {
    console.error("Error eliminando oferta:", error);
  }
};

  const renderStars = (rating) => (
  <div>
    {[1, 2, 3, 4, 5].map((num) => (
      <i
        key={num}
        className={`bi ${
          num <= rating ? "bi-star-fill text-warning" : "bi-star text-muted"
        } mx-1 fs-4`}
      ></i>
    ))}
  </div>
);
  // JSX: (se mantiene igual que el original, sólo que onLogin y onRegister referencian las funciones nuevas)
  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <h2 className="mb-4">Portal del Taxista</h2>

      {!session ? (
        <div className="shadow p-4 bg-white rounded" style={{ width: "100%", maxWidth: "400px" }}>
          {showRegister ? (
            <>
              <h4 className="mb-3">Registrarme</h4>
              <form onSubmit={onRegister}>
                {/* ... campos (igual que antes) */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input name="name" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellido</label>
                    <input name="lastName" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cédula</label>
                    <input name="dni" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Correo</label>
                    <input type="email" name="email" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input name="phone" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Placa</label>
                    <input name="taxiPlate" className="form-control text-uppercase" />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Foto</label>
                    <input type="file" name="photo" className="form-control" />
                  </div>
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-warning w-100 fw-bold">
                    Registrarme
                  </button>
                </div>
              </form>

              <p className="text-center mt-3">
                ¿Ya tienes cuenta?{" "}
                <button className="btn btn-link p-0" onClick={() => setShowRegister(false)}>
                  Inicia sesión
                </button>
              </p>
            </>
          ) : (
            <>
              <h4 className="mb-3">Iniciar sesión</h4>
              <form onSubmit={onLogin}>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input type="email" name="email" className="form-control bg-light border-0 shadow-sm" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input type="password" name="password" className="form-control bg-light border-0 shadow-sm" />
                </div>
                <button type="submit" className="btn btn-warning w-100 shadow-sm">
                  Ingresar
                </button>
              </form>
              <p className="text-center mt-3">
                ¿No tienes cuenta?{" "}
                <button className="btn btn-link p-0" onClick={() => setShowRegister(true)}>
                  Regístrate aquí
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        // ... resto de la UI cuando hay sesión (igual que antes)
        <div className="row g-4 w-100 px-3">
          {/* perfil */}
          <div className="col-lg-6">
            <div className="shadow p-4 bg-white rounded">
              <h5 className="fw-bold">Mi información</h5>
              <p className="text-muted small">Perfil del conductor</p>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={"http://localhost:3050/" + (session.photo || "uploads/default.png")}
                  alt="Foto del conductor"
                  className="rounded-circle me-3 border border-warning shadow"
                  style={{ width: "64px", height: "64px", objectFit: "cover" }}
                />
                <div>
                  <h6 className="mb-0">{session.name}</h6>
                  <small className="text-muted">Placa {session.plate}</small>
                  <div className="mt-1">{renderStars(session.averageRate)}</div>
                </div>
              </div>

              <form onSubmit={updateProfile}>
                <div className="mb-2">
                  <label className="form-label">Nombre</label>
                  <input name="name" className="form-control bg-light border-0 shadow-sm" defaultValue={session.name} />
                </div>

                <div className="row">
                  <div className="col-md-4 mb-2">
                    <label className="form-label">Cedula</label>
                    <input name="dni" className="form-control bg-light border-0 shadow-sm" defaultValue={session.dni} />
                  </div>
                  <div className="col-md-4 mb-2">
                    <label className="form-label">Teléfono</label>
                    <input name="phone" className="form-control bg-light border-0 shadow-sm" defaultValue={session.phone} />
                  </div>
                  <div className="col-md-4 mb-2">
                    <label className="form-label">Placa</label>
                    <input name="plate" className="form-control bg-light border-0 shadow-sm text-uppercase" defaultValue={session.plate} />
                  </div>
                </div>

                {/* campo de foto */}
                <div className="mb-2">
                  <label className="form-label">Foto</label>
                  <input type="file" name="photo" className="form-control bg-light border-0 shadow-sm" accept="image/*" />
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-warning fw-bold">
                    Guardar
                  </button>
                  <button type="button" onClick={onLogout} className="btn btn-light">
                    Cerrar sesión
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* familiares */}
          <div className="col-lg-6">
            <div className="shadow p-4 bg-white rounded">
              <h5 className="fw-bold">Familia</h5>
              <p className="text-muted small">Inscribe a tus familiares</p>

              <form onSubmit={addRelative} className="row g-2">
                <div className="col-md-6">
                  <input name="firstName" className="form-control bg-light border-0 shadow-sm" placeholder="Nombre" />
                </div>
                <div className="col-md-6">
                  <input name="lastName" className="form-control bg-light border-0 shadow-sm" placeholder="Apellido" />
                </div>
                <div className="col-md-6">
                  <input name="relation" className="form-control bg-light border-0 shadow-sm" placeholder="Parentesco" />
                </div>
                <div className="col-md-6">
                  <input type="text" name="dni" placeholder="Documento" className="form-control bg-light border-0 shadow-sm" required />
                </div>
                <div className="col-md-6">
                  <input type="text" name="phone" placeholder="Teléfono" className="form-control bg-light border-0 shadow-sm" required />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-warning fw-bold w-100">
                    Agregar integrante
                  </button>
                </div>
              </form>

              {relatives.length > 0 && (
                <ul className="list-group list-group-flush mt-3">
                  {relatives.map((r, i) => (
                    <li key={i} className="list-group-item bg-light d-flex justify-content-between align-items-center rounded mb-2 shadow-sm border-0">
                      {r.name} {r.lastName} — {r.relationship} — {r.phone} — {r.dni}
                      <button onClick={() => removeRelative(r.id)} className="btn btn-link text-danger p-0">
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ofertas laborales */}
          <div className="col-12">
            <div className="shadow p-4 bg-white rounded">
              <h5 className="fw-bold">Ofertas laborales</h5>
              <p className="text-muted small">Publica una oferta para tus contactos</p>

              <form onSubmit={addOffer} className="row g-2">
                <div className="col-md-6">
                  <input name="contact" className="form-control bg-light border-0 shadow-sm" placeholder="Teléfono o correo" />
                </div>
                <div className="col-md-6">
                  <input name="location" className="form-control bg-light border-0 shadow-sm" placeholder="Ubicación" />
                </div>
                <div className="col-md-12">
                  <textarea name="description" className="form-control bg-light border-0 shadow-sm" placeholder="Descripción del empleo" rows="3"></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-warning fw-bold w-100">
                    Publicar oferta
                  </button>
                </div>
              </form>

              {offers.length > 0 && (
                <ul className="list-group list-group-flush mt-3">
                  {offers.map((o) => (
                    <li
                      key={o.id}
                      className="list-group-item bg-light rounded mb-2 shadow-sm border-0 d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{session.name}</strong> — {o.description}
                        <br />
                        📍 {o.location} | 📞 {o.contact}
                      </div>
                      <div className="btn-group">
                        {o.status === "1" ? (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => updateStatus(o.id, "2")}
                          >
                            Deshabilitar
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(o.id, "1")}
                          >
                            Habilitar
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteOffer(o.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
