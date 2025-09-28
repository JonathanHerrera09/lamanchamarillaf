import { useState } from "react";
import axios from "axios";

export default function Objet() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    // Validación rápida
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

      const res = await axios.post(
        "http://localhost:3050/api/v1/lost_items",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Reporte enviado correctamente ✅");
      console.log("Respuesta API:", res.data);
      e.target.reset();
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
          Ingresa los datos del viaje y los objetos perdidos para poder ayudarte.
        </p>
      </div>

      <div className="shadow rounded p-4 bg-white">
        <h5 className="mb-3">Nuevo reporte</h5>
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="taxiPlate" className="form-label">Placa del taxi</label>
              <input id="taxiPlate" name="taxiPlate" type="text" className="form-control" placeholder="ABC123" />
            </div>

            <div className="col-md-4">
              <label htmlFor="date_travel" className="form-label">Fecha del viaje</label>
              <input id="date_travel" name="date_travel" type="date" className="form-control" placeholder="25-08-2025" />
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
              <label htmlFor="owner" className="form-label">Propietario</label>
              <input id="owner" name="owner" type="text" className="form-control" />
            </div>
            <div className="col-md-6">
              <label htmlFor="contact" className="form-label">Contacto</label>
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
  );
}
