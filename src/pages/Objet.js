import { useState, useEffect } from "react";
import axios from "axios";

export default function Objet() {
  const [loading, setLoading] = useState(false);
  const [lostItems, setLostItems] = useState([]);

  // 🔹 Cargar los reportes de objetos perdidos
  const fetchLostItems = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/lost_items`);
      const filtered = (res.data?.data || []);

      setLostItems(filtered);
    } catch (err) {
      console.error("Error al obtener los reportes:", err);
      setLostItems([]);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  // 🔹 Envío del formulario
  const onSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    if (
      !form.get("taxiPlate") ||
      !form.get("description") ||
      !form.get("owner") ||
      !form.get("date_travel") ||
      !form.get("contact")
    ) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/lost_items`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Reporte enviado correctamente ✅");
      console.log("Respuesta API:", res.data);
      e.target.reset();
      fetchLostItems(); // 🔄 recargar lista
    } catch (err) {
      console.error("Error al enviar:", err);
      alert("Hubo un error al enviar el reporte ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h3 fw-bold">Objetos perdidos</h1>
        <p className="text-muted">
          Ingresa los datos del taxi que te prestó el servicio y una descripción del objeto olvidado o perdido.
        </p>
      </div>

      {/* 🔸 ACORDEÓN PRINCIPAL */}
      <div className="accordion" id="mainAccordion">
        
        {/* PANEL 2: LISTA DE OBJETOS PERDIDOS (EN CARDS) */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingReports">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseReports"
              aria-expanded="false"
              aria-controls="collapseReports"
            >
              📋 Reportes recientes
            </button>
          </h2>
          <div
            id="collapseReports"
            className="accordion-collapse collapse"
            aria-labelledby="headingReports"
            data-bs-parent="#mainAccordion"
          >
            <div className="accordion-body">
              {lostItems.length === 0 ? (
                <p className="text-muted">No hay reportes aún.</p>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {lostItems.map((item, i) => (
                    <div key={i} className="col">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title">
                            🚖 {item.taxiPlate} — <small>{item.owner}</small>
                          </h6>
                          <p className="card-text">
                            <strong>Descripción:</strong> {item.description}
                          </p>
                          <p className="card-text">
                            <strong>Fecha del viaje:</strong> {item.date_travel}
                          </p>
                          <p className="card-text">
                            <strong>Teléfono:</strong> {item.contact}
                          </p>
                          {item.photo && (
                            <div className="mt-2">
                              <img
                                src={item.photo}
                                alt="Objeto perdido"
                                className="img-fluid"
                                style={{ maxHeight: "150px", objectFit: "contain" }}
                              />
                            </div>
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
        {/* PANEL 1: FORMULARIO */}
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
              📝 No encuentras tu objeto, reportalo
            </button>
          </h2>
          <div
            id="collapseForm"
            className="accordion-collapse collapse"
            aria-labelledby="headingForm"
            data-bs-parent="#mainAccordion"
          >
            <div className="accordion-body">
              <div className="shadow rounded p-4 bg-white">
                <form onSubmit={onSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="taxiPlate" className="form-label">Placa del taxi</label>
                      <input id="taxiPlate" name="taxiPlate" type="text" className="form-control" placeholder="ABC123" />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="date_travel" className="form-label">Fecha del viaje</label>
                      <input id="date_travel" name="date_travel" type="date" className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="photo" className="form-label">Foto del objeto</label>
                      <input id="photo" name="photo" type="file" className="form-control" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label htmlFor="description" className="form-label">Descripción</label>
                    <textarea id="description" name="description" className="form-control" rows="3"></textarea>
                  </div>

                  <div className="row g-3 mt-3">
                    <div className="col-md-6">
                      <label htmlFor="owner" className="form-label">Nombre y apellido</label>
                      <input id="owner" name="owner" type="text" className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="contact" className="form-label">Teléfono</label>
                      <input id="contact" name="contact" type="text" className="form-control" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                      {loading ? "Enviando..." : "Enviar reporte"}
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
