import { useState, useEffect } from "react";
import axios from "axios";

export default function Objet() {
  const [loading, setLoading] = useState(false);
  const [lostItems, setLostItems] = useState([]);

  // 🔹 Cargar los reportes de objetos perdidos
  const fetchLostItems = async () => {
    try {
      const res = await axios.get("http://localhost:3050/api/v1/lost_items");
      const filtered = (res.data?.data || []).filter(
        (item) => item.created_by === "taxista"
      );

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
      const res = await axios.post("http://localhost:3050/api/v1/lost_items", form, {
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

      {/* 🔸 FORMULARIO */}
      <div className="shadow rounded p-4 bg-white mb-5">
        <h5 className="mb-3">Nuevo reporte</h5>
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

      {/* 🔸 LISTA DE REPORTES (ACORDEÓN) */}
      <div className="accordion" id="lostItemsAccordion">
        <h4 className="mb-3">Reportes recientes</h4>
        {lostItems.length === 0 ? (
          <p className="text-muted">No hay reportes aún.</p>
        ) : (
          lostItems.map((item, i) => (
            <div key={i} className="accordion-item mb-2">
              <h2 className="accordion-header" id={`heading${i}`}>
                <button
                  className="accordion-button collapsed bg-dark text-white"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${i}`}
                  aria-expanded="false"
                  aria-controls={`collapse${i}`}
                >
                  🚖 {item.taxiPlate} — {item.owner}
                </button>
              </h2>
              <div
                id={`collapse${i}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${i}`}
                data-bs-parent="#lostItemsAccordion"
              >
                <div className="accordion-body">
                  <p><strong>Descripción:</strong> {item.description}</p>
                  <p><strong>Fecha del viaje:</strong> {item.date_travel}</p>
                  <p><strong>Teléfono:</strong> {item.contact}</p>
                  {item.photo && (
                    <div className="mt-2">
                      <strong>Foto:</strong><br />
                      <img
                        src={item.photo}
                        alt="Objeto perdido"
                        style={{ maxWidth: "200px", borderRadius: "8px" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
