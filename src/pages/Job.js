import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Configuración centralizada de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `${process.env.REACT_APP_TOKEN_PUBLIC}`,
  },
});

// Configuración para SweetAlert
const showAlert = (title, text, icon = "success") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
  });
};

export default function Job() {
  const [submitting, setSubmitting] = useState(false);
  const [jobApplications, setJobApplications] = useState([]);
  const formRef = useRef(null);

  // 🔹 Cargar postulaciones existentes (memoizado)
  const fetchJobApplications = useCallback(async () => {
    try {
      const res = await api.get("/job_board/all");
      const data = res.data?.data || res.data || [];
      setJobApplications(data.filter((item) => item.status === "1"));
    } catch (err) {
      console.error("Error al obtener postulaciones:", err);
      setJobApplications([]);
      showAlert("Error", "No se pudieron cargar las postulaciones", "error");
    }
  }, []);

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  // 🔹 Envío del formulario (memoizado)
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      
      const formData = new FormData(form);
      const nameDriver = formData.get("nameDriver")?.toString().trim() || "";
      const contact = formData.get("contact")?.toString().trim() || "";

      if (!nameDriver || !contact) {
        showAlert("Campos requeridos", "Completa todos los campos obligatorios", "warning");
        return;
      }

      try {
        setSubmitting(true);
        await api.post("/job_application", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        showAlert("¡Éxito!", `Gracias ${nameDriver}. Hemos recibido tu postulación.`);
        form.reset();
        await fetchJobApplications();
      } catch (error) {
        console.error("Error al enviar postulación:", error);
        showAlert("Error", "Hubo un error al enviar tu postulación. Intenta nuevamente.", "error");
      } finally {
        setSubmitting(false);
      }
    },
    [fetchJobApplications]
  );

  // 🔹 Renderizado optimizado de postulaciones (memoizado)
  const renderJobApplications = useMemo(() => {
    if (jobApplications.length === 0) {
      return <p className="text-muted">No hay postulaciones aún.</p>;
    }

    return (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {jobApplications.map((app) => (
          <div key={`${app.id || app.dni}-${app.nameDriver}`} className="col">
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
    );
  }, [jobApplications]);

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
        {/* PANEL 1: LISTA DE POSTULACIONES */}
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
              {renderJobApplications}
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
                        Nombre y apellido *
                      </label>
                      <input
                        id="nameDriver"
                        name="nameDriver"
                        type="text"
                        className="form-control"
                        placeholder="Tu nombre completo"
                        required
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
                        Teléfono *
                      </label>
                      <input
                        id="contact"
                        name="contact"
                        type="tel"
                        className="form-control"
                        placeholder="Ej.: +57 300 000 0000"
                        required
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