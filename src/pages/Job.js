import { useRef, useState } from "react";
import axios from "axios";

export default function Job() {
  const [submitting, setSubmitting] = useState(false);
  const [cv, setCv] = useState(null);
  const formRef = useRef(null);

  const handleFile = (f) => {
    if (!f) {
      setCv(null);
      return;
    }
    if (f.type !== "application/pdf") {
      alert("El CV debe ser un archivo PDF.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 5MB.");
      return;
    }
    setCv(f);
  };

  const onSubmit = async (e) => {
  e.preventDefault();

  const nameDriver = e.currentTarget.nameDriver.value.trim();
  const dni = e.currentTarget.dni.value.trim();
  const contact = e.currentTarget.contact.value.trim();
  const about = e.currentTarget.about.value.trim();

  if (!nameDriver || !contact) {
    alert("Completa todos los campos y adjunta tu CV en PDF.");
    return;
  }

  const fd = new FormData();
  fd.append("nameDriver", nameDriver);
  fd.append("dni", dni);
  fd.append("contact", contact);
  fd.append("description", about);
  fd.append("cv", cv);

  try {
    setSubmitting(true);
    const res = await axios.post(
      "http://localhost:3050/api/v1/job_application",
      fd,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(`¡Gracias ${nameDriver}! Hemos recibido tu postulación.`);
    console.log("Respuesta del servidor:", res.data);

    setCv(null);
    formRef.current?.reset();
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
        <h1 className="h3 fw-bold">Taxista que busca trabajo.</h1>
        <p className="text-muted">
          Completa tu información. <br></br>
          No somos responsables laborales, somos el puente entre conductor y propietario del taxi.
        </p>
      </div>

      <div className="shadow rounded p-4 bg-white">
        <h5 className="mb-3">Postulación</h5>
        <p className="text-muted small">Todos los campos son obligatorios</p>

        <form ref={formRef} onSubmit={onSubmit} className="mt-3">
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
                Cedula
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                className="form-control"
                placeholder="Eje: 1234567890"
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
            <button type="submit" className="btn btn-warning" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar postulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
