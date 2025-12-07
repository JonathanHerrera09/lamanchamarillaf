import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Job() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // const [cv, setCv] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const formRef = useRef(null);

  // 🔹 Cargar postulaciones existentes
  const fetchJobApplications = async () => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/job_board/all`,
      { 
       headers: {
        authorization: `${process.env.REACT_APP_TOKEN_PUBLIC}`,
      },
      }
    );
    
    // Verificar la estructura real de la respuesta de tu API
    const data = res.data?.data || res.data || [];
    const filteredData = data.filter(item => item.status === "1");
    setJobApplications(filteredData);
    
  } catch (err) {
    console.error("Error al obtener postulaciones:", err);
    setJobApplications([]);
  }
};

  useEffect(() => {
    fetchJobApplications();
  }, []);

  // 🔹 Envío del formulario
  const onSubmit = async (e) => {
    e.preventDefault();

    const nameDriver = e.currentTarget.nameDriver.value.trim();
    const dni = e.currentTarget.dni.value.trim();
    const contact = e.currentTarget.contact.value.trim();
    const about = e.currentTarget.about.value.trim();

    if (!nameDriver || !contact ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    const fd = new FormData();
    fd.append("nameDriver", nameDriver);
    fd.append("dni", dni);
    fd.append("contact", contact);
    fd.append("description", about);
    // fd.append("cv", cv);

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/job_application`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(`¡Gracias ${nameDriver}! Hemos recibido tu postulación.`);
      console.log("Respuesta del servidor:", res.data);

      // setCv(null);
      formRef.current?.reset();
      fetchJobApplications(); // 🔄 Recargar lista
    } catch (error) {
      console.error("Error al enviar postulación:", error);
      alert("Hubo un error al enviar tu postulación. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h3 fw-bold">Taxista que busca trabajo</h1>
        <p className="text-muted">
          Completa tu información.<br />
          No somos responsables laborales, somos el puente entre conductor y propietario del taxi.
        </p>
      </div>

      {/* 🔸 ACORDEÓN PRINCIPAL */}
      <div className="accordion" id="jobAccordion">
        {/* PANEL 1: LISTA DE POSTULACIONES (EN CARDS) */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingApplications">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseApplications"
              aria-expanded="false"
              aria-controls="collapseApplications"
            >
              📋 Empleos promocionados
            </button>
          </h2>
          <div
            id="collapseApplications"
            className="accordion-collapse collapse"
            aria-labelledby="headingApplications"
            data-bs-parent="#jobAccordion"
          >
            <div className="accordion-body">
              {jobApplications.length === 0 ? (
                <p className="text-muted">No hay postulaciones aún.</p>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {jobApplications.map((app, i) => (
                    <div key={i} className="col">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title">
                            👤 {app.nameDriver} {app.dni && `— ${app.dni}`}
                          </h6>
                          <p className="card-text">
                            <strong>Teléfono:</strong> {app.contact}
                          </p>
                          <p className="card-text">
                            <strong>Sobre ti:</strong> {app.description || "Sin descripción"}
                          </p>
                          {app.cv_url && (
                            <a
                              href={app.cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary mt-2"
                            >
                              Ver CV
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: FORMULARIO DE POSTULACIÓN */}
        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="headingForm">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseForm"
              aria-expanded="false"
              aria-controls="collapseForm"
            >
              📝 ¿Eres taxista? ¡Postúlate aquí!
            </button>
          </h2>
          <div
            id="collapseForm"
            className="accordion-collapse collapse"
            aria-labelledby="headingForm"
            data-bs-parent="#jobAccordion"
          >
            <div className="accordion-body">
              <div className="shadow rounded p-4 bg-white">
                <form ref={formRef} onSubmit={onSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="nameDriver">
                        Nombre y apellido
                      </label>
                      <input
                        id="nameDriver"
                        name="nameDriver"
                        type="text"
                        className="form-control"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="dni">
                        Cédula
                      </label>
                      <input
                        id="dni"
                        name="dni"
                        type="text"
                        className="form-control"
                        placeholder="Ej: 1234567890"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="contact">
                        Teléfono
                      </label>
                      <input
                        id="contact"
                        name="contact"
                        type="text"
                        className="form-control"
                        placeholder="Ej.: +57 300 000 0000"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label" htmlFor="about">
                      Sobre ti
                    </label>
                    <textarea
                      id="about"
                      name="about"
                      className="form-control"
                      rows="5"
                      placeholder="Cuéntanos tu experiencia"
                    ></textarea>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={submitting}
                    >
                      {submitting ? "Enviando..." : "Enviar postulación"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}