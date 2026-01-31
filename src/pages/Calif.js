// Calif.jsx - Versión optimizada
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Configuración de Axios para evitar CORS
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3050";
axios.defaults.baseURL = `${API_BASE}/api/v1`;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Componentes memoizados
const RatingInput = memo(({ value, onChange, readOnly = false }) => {
  const stars = useMemo(() => Array.from({ length: 5 }), []);
  
  return (
    <div className="d-flex align-items-center gap-1" role="radiogroup" aria-label="Selecciona calificación">
      {stars.map((_, i) => {
        const n = i + 1;
        const active = value >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={readOnly ? undefined : () => onChange(n)}
            className={`btn p-0 border-0 ${readOnly ? "" : "bg-transparent"}`}
            style={{ cursor: readOnly ? "default" : "pointer" }}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            disabled={readOnly}
          >
            <i
              className={`bi ${active ? "bi-star-fill text-warning" : "bi-star text-secondary"}`}
              style={{ fontSize: "1.5rem" }}
            />
          </button>
        );
      })}
      {!readOnly && <span className="ms-2 small text-muted">{value ? `${value}/5` : ""}</span>}
    </div>
  );
});

RatingInput.displayName = "RatingInput";

const DriverCard = memo(({ driver, onSelect, isSelected }) => {
  const initials = useMemo(() => 
    driver.name.split(" ").map(s => s[0]).join(""), 
    [driver.name]
  );

  const imageUrl = useMemo(() => {
    if (!driver.photo) return null;
    const base = process.env.REACT_APP_API_URL_SOCKET || "";
    return driver.photo.startsWith(base) ? driver.photo : `${base}${driver.photo}`;
  }, [driver.photo]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    const fallback = e.target.parentNode.querySelector('.fallback') || 
      (() => {
        const div = document.createElement('div');
        div.className = 'fallback w-100 h-100 bg-warning d-flex align-items-center justify-content-center fw-bold';
        return div;
      })();
    fallback.textContent = initials;
    e.target.parentNode.appendChild(fallback);
  }, [initials]);

  return (
    <div className="card text-center p-3" style={{ minWidth: "160px" }}>
      <div className="rounded-circle mx-auto overflow-hidden" style={{ width: "70px", height: "70px" }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={driver.name}
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-100 h-100 bg-warning d-flex align-items-center justify-content-center fw-bold">
            {initials}
          </div>
        )}
      </div>
      
      <div className="mt-2 fw-semibold">{driver.name}</div>
      <div className="text-muted small">Placa {driver.taxiPlate}</div>
      <div className="mt-1">
        <RatingInput
          value={Math.round(driver.averageRate)}
          readOnly
        />
      </div>
      {onSelect && (
        <button
          type="button"
          className={`btn btn-sm mt-2 ${isSelected ? "btn-secondary" : "btn-outline-warning"}`}
          onClick={() => onSelect(driver.id)}
        >
          {isSelected ? "Seleccionado" : "Seleccionar"}
        </button>
      )}
    </div>
  );
});

DriverCard.displayName = "DriverCard";

const SearchForm = memo(({ plate, onPlateChange, onSearch }) => {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSearch();
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2">
      <input
        type="text"
        className="form-control text-uppercase"
        placeholder="Ej.: ABC123"
        value={plate}
        onChange={(e) => onPlateChange(e.target.value)}
      />
      <button type="submit" className="btn btn-warning">
        Buscar
      </button>
    </form>
  );
});

SearchForm.displayName = "SearchForm";

const OpinionForm = memo(({ 
  driver, 
  rating, 
  comment, 
  nameOpt, 
  emailOpt, 
  phoneOpt,
  onRatingChange,
  onCommentChange,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onSubmit 
}) => {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="mb-3">
        <label className="form-label">Tu calificación</label>
        <RatingInput value={rating} onChange={onRatingChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Tu comentario</label>
        <textarea
          className="form-control"
          rows="3"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          required
        />
      </div>
      <div className="row g-2">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre (opcional)"
            value={nameOpt}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="email"
            className="form-control"
            placeholder="Correo (opcional)"
            value={emailOpt}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Teléfono (opcional)"
            value={phoneOpt}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-3">
        <button type="submit" className="btn btn-success">
          Enviar comentario
        </button>
      </div>
    </form>
  );
});

OpinionForm.displayName = "OpinionForm";

// Hook personalizado para fetch de conductores
const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/driver/random/ten", {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });
      if (response.data.code === 1 && Array.isArray(response.data.data)) {
        setDrivers(response.data.data);
      }
    } catch (err) {
      console.error("Error cargando drivers:", err);
      setError("Error al cargar conductores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, loading, error, refetch: fetchDrivers };
};

// Hook personalizado para búsqueda
const useDriverSearch = () => {
  const [foundDriver, setFoundDriver] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const searchDriver = useCallback(async (plate) => {
    const p = plate.trim().toUpperCase();
    if (!p) {
      setSearchError("Ingresa una placa");
      return false;
    }

    setSearching(true);
    setSearchError(null);
    
    try {
      const response = await axios.get(`/driver/taxiplate/${p}`, {
        headers: { "Cache-Control": "max-age=300" } // Cache de 5 minutos
      });
      
      if (response.data.code === 1 && response.data.data?.length > 0) {
        setFoundDriver(response.data.data[0]);
        return true;
      } else {
        setSearchError("No se encontró un taxista con esa placa");
        setFoundDriver(null);
        return false;
      }
    } catch (err) {
      console.error("Error buscando driver:", err);
      setSearchError("Error al consultar el servidor");
      setFoundDriver(null);
      return false;
    } finally {
      setSearching(false);
    }
  }, []);

  return { foundDriver, searching, searchError, searchDriver };
};

// Hook personalizado para formulario de opinión
const useOpinionForm = () => {
  const [formData, setFormData] = useState({
    comment: "",
    nameOpt: "",
    emailOpt: "",
    phoneOpt: "",
    rating: 0
  });

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      comment: "",
      nameOpt: "",
      emailOpt: "",
      phoneOpt: "",
      rating: 0
    });
  }, []);

  const submitOpinion = useCallback(async (driver) => {
    if (!driver || !formData.rating) {
      return { success: false, message: "Selecciona estrellas (1 a 5)." };
    }

    if (!formData.comment.trim()) {
      return { success: false, message: "Escribe tu comentario." };
    }

    const payload = {
      driverId: driver.id,
      taxiPlate: driver.taxiPlate,
      rate: formData.rating.toString(),
      observation: formData.comment.trim(),
      name: formData.nameOpt.trim() || undefined,
      email: formData.emailOpt.trim() || undefined,
      contact: formData.phoneOpt.trim() || undefined
    };

    try {
      const response = await axios.post("/rate_driver", payload);
      
      if (response.data.code === 1) {
        resetForm();
        return { 
          success: true, 
          message: `Gracias por tu calificación a ${driver.name} (${driver.taxiPlate}) • ${formData.rating}/5`
        };
      } else {
        return { success: false, message: "Hubo un problema al guardar tu calificación." };
      }
    } catch (err) {
      console.error("Error enviando calificación:", err);
      return { success: false, message: "Error al enviar la calificación." };
    }
  }, [formData, resetForm]);

  return {
    formData,
    updateField,
    resetForm,
    submitOpinion
  };
};

// Componente principal
export default function Calif() {
  const [plate, setPlate] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  
  // Custom hooks
  const { drivers, loading: driversLoading } = useDrivers();
  const { foundDriver, searching, searchError, searchDriver } = useDriverSearch();
  const { 
    formData, 
    updateField, 
    resetForm, 
    submitOpinion 
  } = useOpinionForm();

  // Efecto para resetear formulario cuando se selecciona un conductor
  useEffect(() => {
    if (foundDriver && selectedId === foundDriver.id) {
      resetForm();
    }
  }, [foundDriver, selectedId, resetForm]);

  // Manejar búsqueda
  const handleSearch = useCallback(async () => {
    const success = await searchDriver(plate);
    if (success && foundDriver) {
      setSelectedId(foundDriver.id);
    } else {
      setSelectedId(null);
    }
  }, [plate, searchDriver, foundDriver]);

  // Manejar envío de opinión
  const handleSubmitOpinion = useCallback(async () => {
    if (!foundDriver || selectedId !== foundDriver.id) return;
    
    const result = await submitOpinion(foundDriver);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  }, [foundDriver, selectedId, submitOpinion]);

  // Calcular si el conductor encontrado está seleccionado
  const isFoundSelected = useMemo(() => 
    foundDriver && selectedId === foundDriver.id, 
    [foundDriver, selectedId]
  );

  // Driver destacados memoizados
  const featuredDrivers = useMemo(() => drivers.slice(0, 10), [drivers]);

  return (
    <div className="bg-light min-vh-100 py-5">
      <section className="container">
        <div className="text-center mb-4">
          <h1 className="fw-bold">Calificaciones de taxistas</h1>
          <p className="text-muted">
            Revisa la reputación de nuestros conductores y califica tu experiencia.
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
            {driversLoading ? (
              <div className="text-center w-100 py-3">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              featuredDrivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  isSelected={selectedId === driver.id}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </div>
        </div>

        {/* Buscador y formulario */}
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Buscar por placa</h5>
              </div>
              <div className="card-body">
                <SearchForm
                  plate={plate}
                  onPlateChange={setPlate}
                  onSearch={handleSearch}
                />

                {searching && (
                  <div className="text-center mt-3">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Buscando...</span>
                    </div>
                  </div>
                )}

                {searchError && !searching && (
                  <div className="alert alert-warning mt-3" role="alert">
                    {searchError}
                  </div>
                )}

                {foundDriver && (
                  <div className={`mt-4 rounded p-3 shadow ${isFoundSelected ? "shadow-lg" : "shadow-sm"}`}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                          style={{ 
                            width: "60px", 
                            height: "60px", 
                            fontWeight: "bold",
                            backgroundColor: foundDriver.photo ? 'transparent' : '#ffc107'
                          }}
                        >
                          <DriverCard 
                            driver={foundDriver} 
                            isSelected={isFoundSelected}
                            onSelect={setSelectedId}
                          />
                        </div>
                        <div>
                          <div className="fw-semibold">{foundDriver.name}</div>
                          <div className="text-muted small">Placa {foundDriver.taxiPlate}</div>
                          <RatingInput
                            value={Math.round(foundDriver.averageRate)}
                            readOnly
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn ${isFoundSelected ? "btn-secondary" : "btn-warning"}`}
                        onClick={() => setSelectedId(foundDriver.id)}
                      >
                        {isFoundSelected ? "Seleccionado" : "Seleccionar"}
                      </button>
                    </div>

                    {isFoundSelected && (
                      <OpinionForm
                        driver={foundDriver}
                        rating={formData.rating}
                        comment={formData.comment}
                        nameOpt={formData.nameOpt}
                        emailOpt={formData.emailOpt}
                        phoneOpt={formData.phoneOpt}
                        onRatingChange={(value) => updateField('rating', value)}
                        onCommentChange={(value) => updateField('comment', value)}
                        onNameChange={(value) => updateField('nameOpt', value)}
                        onEmailChange={(value) => updateField('emailOpt', value)}
                        onPhoneChange={(value) => updateField('phoneOpt', value)}
                        onSubmit={handleSubmitOpinion}
                      />
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