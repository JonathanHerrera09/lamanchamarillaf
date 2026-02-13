// Objet.js - Versión optimizada
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Configuración de Axios para evitar CORS
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3050";
axios.defaults.baseURL = `${API_BASE}/api/v1`;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Constantes
const REQUIRED_FIELDS = ["taxiPlate", "description", "owner", "date_travel", "contact"];

// Componentes memoizados
const AccordionItem = memo(({ id, title, children, defaultOpen = false }) => (
  <div className="accordion-item mb-3">
    <h2 className="accordion-header" id={`heading-${id}`}>
      <button
        className="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#collapse-${id}`}
        aria-expanded={defaultOpen}
        aria-controls={`collapse-${id}`}
      >
        {title}
      </button>
    </h2>
    <div
      id={`collapse-${id}`}
      className="accordion-collapse collapse"
      aria-labelledby={`heading-${id}`}
      data-bs-parent="#mainAccordion"
    >
      <div className="accordion-body">
        {children}
      </div>
    </div>
  </div>
));

AccordionItem.displayName = "AccordionItem";

const InputField = memo(({ 
  id, 
  name, 
  label, 
  type = "text", 
  placeholder, 
  className = "", 
  required = false,
  ...props 
}) => (
  <div className={className}>
    <label htmlFor={id} className="form-label">{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      className="form-control"
      placeholder={placeholder}
      required={required}
      {...props}
    />
  </div>
));

InputField.displayName = "InputField";

const TextAreaField = memo(({ id, name, label, rows = 3, required = false }) => (
  <div className="mt-3">
    <label htmlFor={id} className="form-label">{label}</label>
    <textarea
      id={id}
      name={name}
      className="form-control"
      rows={rows}
      required={required}
    />
  </div>
));

TextAreaField.displayName = "TextAreaField";

const LostItemCard = memo(({ item }) => (
  <div className="col">
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
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  </div>
));

LostItemCard.displayName = "LostItemCard";

const ReportsList = memo(({ lostItems }) => {
  if (lostItems.length === 0) {
    return <p className="text-muted">No hay reportes aún.</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {lostItems.map((item, i) => (
        <LostItemCard key={`${item.id}-${i}`} item={item} />
      ))}
    </div>
  );
});

ReportsList.displayName = "ReportsList";

const SubmitButton = memo(({ loading }) => (
  <div className="mt-4">
    <button type="submit" className="btn btn-warning" disabled={loading}>
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Enviando...
        </>
      ) : (
        "Enviar reporte"
      )}
    </button>
  </div>
));

SubmitButton.displayName = "SubmitButton";

// Hook personalizado para manejo de formulario
const useLostItemsForm = () => {
  const [loading, setLoading] = useState(false);
  const [lostItems, setLostItems] = useState([]);

  const fetchLostItems = useCallback(async () => {
    try {
      const response = await axios.get("/lost_items", {
        headers: { "Cache-Control": "max-age=300" } // Cache de 5 minutos
      });
      setLostItems(response.data?.data || []);
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
      setLostItems([]);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudieron cargar los reportes. Por favor, intenta nuevamente.',
        confirmButtonColor: '#d9534f'
      });
    }
  }, []);

  const validateForm = useCallback((formData) => {
    const missingFields = REQUIRED_FIELDS.filter(field => !formData.get(field)?.trim());

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios.',
        confirmButtonColor: '#f0ad4e'
      });
      return false;
    }

    return true;
  }, []);

  const submitForm = useCallback(async (formData) => {
    try {
      const response = await axios.post("/lost_items", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error al enviar:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Hubo un error al enviar el reporte" 
      };
    }
  }, []);

  return {
    loading,
    setLoading,
    lostItems,
    setLostItems,
    fetchLostItems,
    validateForm,
    submitForm
  };
};

// Hook personalizado para campos del formulario
const useFormFields = () => {
  const formFields = useMemo(() => [
    {
      id: "taxiPlate",
      name: "taxiPlate",
      label: "Placa del taxi",
      placeholder: "ABC123",
      className: "col-md-4",
      required: true
    },
    {
      id: "date_travel",
      name: "date_travel",
      label: "Fecha del viaje",
      type: "date",
      className: "col-md-4",
      required: true
    },
    {
      id: "photo",
      name: "photo",
      label: "Foto del objeto",
      type: "file",
      className: "col-md-4"
    },
    {
      id: "owner",
      name: "owner",
      label: "Nombre y apellido",
      className: "col-md-6",
      required: true
    },
    {
      id: "contact",
      name: "contact",
      label: "Teléfono",
      className: "col-md-6",
      required: true
    }
  ], []);

  return { formFields };
};

// Componente principal
const Objet = () => {
  const {
    loading,
    setLoading,
    lostItems,
    fetchLostItems,
    validateForm,
    submitForm
  } = useLostItemsForm();
  
  const { formFields } = useFormFields();

  // Cargar reportes inicialmente
  useEffect(() => {
    fetchLostItems();
  }, [fetchLostItems]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    if (!validateForm(formData)) return;

    setLoading(true);

    try {
      const result = await submitForm(formData);

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Reporte enviado ✅',
          text: 'Tu reporte ha sido enviado correctamente.',
          confirmButtonColor: '#28a745',
          timer: 3000
        });

        e.target.reset();
        fetchLostItems(); // Recargar lista
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar ❌',
        text: error.message,
        confirmButtonColor: '#d9534f'
      });
    } finally {
      setLoading(false);
    }
  }, [validateForm, submitForm, fetchLostItems, setLoading]);

  // Accordion items memoizados
  const accordionItems = useMemo(() => [
    {
      id: "reports",
      title: "📋 Reportes recientes",
      children: <ReportsList lostItems={lostItems} />,
      defaultOpen: false
    },
    {
      id: "form",
      title: "📝 No encuentras tu objeto, repórtalo",
      children: (
        <div className="shadow rounded p-4 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {formFields.slice(0, 3).map((field) => (
                <InputField key={field.id} {...field} />
              ))}
            </div>

            <TextAreaField
              id="description"
              name="description"
              label="Descripción"
              required={true}
            />

            <div className="row g-3 mt-3">
              {formFields.slice(3).map((field) => (
                <InputField key={field.id} {...field} />
              ))}
            </div>

            <SubmitButton loading={loading} />
          </form>
        </div>
      ),
      defaultOpen: true
    }
  ], [formFields, handleSubmit, loading, lostItems]);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h3 fw-bold">Objetos perdidos</h1>
        <p className="text-muted">
          Ingresa los datos del taxi que te prestó el servicio y una descripción del objeto olvidado o perdido.
        </p>
      </div>

      <div className="accordion" id="mainAccordion">
        {accordionItems.map((item) => (
          <AccordionItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default memo(Objet);