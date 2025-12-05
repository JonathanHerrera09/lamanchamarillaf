import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
// import "../index.css";

// ⭐ Componente de Estrellas (seleccionables)
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
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
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
      <span className="ms-2 small text-muted">
        {value ? `${value}/5` : ""}
      </span>
    </div>
  );
}

export default function Calif() {
  const [plate, setPlate] = useState("");
  const [drivers, setDrivers] = useState([]); // 👉 del endpoint
  const [found, setFound] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [comment, setComment] = useState("");
  const [nameOpt, setNameOpt] = useState("");
  const [emailOpt, setEmailOpt] = useState("");
  const [phoneOpt, setPhoneOpt] = useState("");
  const [rating, setRating] = useState(0);

  // 🔹 Cargar conductores destacados
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/driver/random/ten`)
      .then((res) => {
        if (res.data.code === 1 && Array.isArray(res.data.data)) {
          // console.log("Drivers cargados:", res.data.data);
          setDrivers(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error cargando drivers:", err);
      });
  }, []);

  // 🔹 Buscar por placa en /driver/{plate}
  const onSearch = async (e) => {
  e.preventDefault();
  const p = plate.trim().toUpperCase();
  if (!p) return;

  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/driver/taxiplate/${p}`);
    if (res.data.code === 1 && res.data.data && res.data.data.length > 0) {
      setFound(res.data.data[0]); // 👈 solo guardamos el primer objeto
      setSelectedId(null);
      setComment("");
      setNameOpt("");
      setEmailOpt("");
      setPhoneOpt("");
      setRating(0);
    } else {
      setFound(null);
      alert("No se encontró un taxista con esa placa.");
    }
  } catch (err) {
    console.error("Error buscando driver:", err);
    alert("Error al consultar el servidor.");
  }
};


  const submitOpinion = async (e) => {
  e.preventDefault();
  if (!found || selectedId !== found.id) return;
  if (!rating) {
    alert("Selecciona estrellas (1 a 5).");
    return;
  }
  if (!comment.trim()) {
    alert("Escribe tu comentario.");
    return;
  }

  const payload = {
    driverId: found.id,
    taxiPlate: found.taxiPlate,
    rate: rating.toString(), // 👈 el backend espera string
    observation: comment.trim(),
    name: nameOpt.trim() || undefined,
    email: emailOpt.trim() || undefined,
    contact: phoneOpt.trim() || undefined, // 👈 backend lo llama "contact"
  };

  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/rate_driver`, payload);

    if (res.data.code === 1) {
      alert(
        `Gracias por tu calificación a ${found.name} (${found.taxiPlate}) • ${rating}/5`
      );
      // limpiar formulario
      setComment("");
      setNameOpt("");
      setEmailOpt("");
      setPhoneOpt("");
      setRating(0);
    } else {
      alert("Hubo un problema al guardar tu calificación.");
    }
  } catch (err) {
    console.error("Error enviando calificación:", err);
    alert("Error al enviar la calificación.");
  }
};


  return (
    <div className="bg-light min-vh-100 py-5">
      <section className="container">
        <div className="text-center mb-4">
          <h1 className="fw-bold">Calificaciones de taxistas</h1>
          <p className="text-muted">
            Revisa la reputación de nuestros conductores y califica tu
            experiencia.
          </p>
        </div>

        {/* Conductores destacados */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">Conductores destacados</h5>
            <small className="text-muted">
              Fotos redondeadas y calificación visible
            </small>
          </div>
          <div className="card-body d-flex overflow-auto gap-3">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="card text-center p-3"
                style={{ minWidth: "160px" }}
              >
                <div className="rounded-circle mx-auto overflow-hidden" style={{ width: "70px", height: "70px" }}>
                  {d.photo ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL_SOCKET}${d.photo.replace(process.env.REACT_APP_API_URL_SOCKET, '')}`} 
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
                
                <div className="mt-2 fw-semibold">{d.name}</div>
                <div className="text-muted small">Placa {d.taxiPlate}</div>
                <div className="mt-1">
                  <RatingInput
                    value={Math.round(d.averageRate)}
                    onChange={() => {}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Buscar por placa</h5>
              </div>
              <div className="card-body">
                <form onSubmit={onSearch} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="Ej.: ABC123"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                  />
                  <button type="submit" className="btn btn-warning">
                    Buscar
                  </button>
                </form>

                {found && (
                  <div
                    className={`mt-4 rounded p-3 shadow ${
                      selectedId === found.id ? "shadow-lg" : "shadow-sm"
                    }`}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                          style={{ 
                            width: "60px", 
                            height: "60px", 
                            fontWeight: "bold",
                            backgroundColor: found.photo ? 'transparent' : '#ffc107' // amarillo solo si no hay foto
                          }}
                        >
                          {found.photo ? (
                            <img 
                              src={`${process.env.REACT_APP_API_URL_SOCKET}${found.photo.replace(process.env.REACT_APP_API_URL_SOCKET, '')}`} 
                              alt={found.name}
                              className="w-100 h-100 object-fit-cover"
                              onError={(e) => {
                                // Si la imagen falla, mostrar iniciales
                                e.target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = 'w-100 h-100 bg-warning d-flex align-items-center justify-content-center';
                                fallback.textContent = found.name.split(" ").map((s) => s[0]).join("");
                                e.target.parentNode.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div className="w-100 h-100 bg-warning d-flex align-items-center justify-content-center">
                              {found.name.split(" ").map((s) => s[0]).join("")}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="fw-semibold">{found.name}</div>
                          <div className="text-muted small">Placa {found.taxiPlate}</div>
                          <RatingInput
                            value={Math.round(found.averageRate)}
                            onChange={() => {}}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn ${
                          selectedId === found.id ? "btn-secondary" : "btn-warning"
                        }`}
                        onClick={() => setSelectedId(found.id)}
                      >
                        {selectedId === found.id ? "Seleccionado" : "Seleccionar"}
                      </button>
                    </div>

                    {selectedId === found.id && (
                      <form onSubmit={submitOpinion} className="mt-3">
                        <div className="mb-3">
                          <label className="form-label">Tu calificación</label>
                          <RatingInput value={rating} onChange={setRating} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Tu comentario</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                        </div>
                        <div className="row g-2">
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nombre (opcional)"
                              value={nameOpt}
                              onChange={(e) => setNameOpt(e.target.value)}
                            />
                          </div>
                          <div className="col-md-4">
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Correo (opcional)"
                              value={emailOpt}
                              onChange={(e) => setEmailOpt(e.target.value)}
                            />
                          </div>
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Teléfono (opcional)"
                              value={phoneOpt}
                              onChange={(e) => setPhoneOpt(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <button type="submit" className="btn btn-success">
                            Enviar comentario
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guía */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">¿Cómo califico?</h5>
              </div>
              <div className="card-body text-muted small">
                Busca la placa, selecciona el conductor, elige de 1 a 5 estrellas y
                escribe tu comentario. Los datos personales son opcionales.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
