// Home.js - Versión optimizada
import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import "../styles/Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

// Configuración de Axios para evitar CORS
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3050";
axios.defaults.baseURL = `${API_BASE}/api/v1`;
axios.defaults.headers.common["Content-Type"] = "application/json";


// Datos estáticos
const SERVICES_DATA = [
  {
    img: "img/servicio1.png",
    title: "Califique al Taxista",
    text: "Espacio donde los usuarios pueden evaluar el servicio de los taxistas.",
    link: "/calf"
  },
  {
    img: "img/servicio-2.png",
    title: "Reportar objetos olvidados",
    text: "Formulario donde los usuarios puedan reportar objetos olvidados en taxis.",
    link: "/obj"
  },
  {
    img: "img/servicio-3.png",
    title: "Bolsa de Empleo",
    text: "Espacio para conectar a propietarios de taxis con conductores en busca de oportunidades laborales.",
    link: "/job"
  },
  {
    img: "img/servicio-4.png",
    title: "Club Familiar",
    text: "Para consolidar la integración gremial y familiar, realizamos eventos con este objetivo y lo haremos con más frecuencia.",
    link: "/drivep"
  }
];

const EMPRESAS_DATA = [
  [
    { img: "img/valcali.webp", name: "Valcali", url:"https://sindiunion.com/"},
    { img: "img/toro-autos.webp", name: "Toro Autos", url:"https://toroautos.com/" },
    { img: "img/taxis-y-autos-cali.webp", name: "Taxis y Autos Cali", url:"https://cali.taxexpress.com.co/" },
    { img: "img/Logo-Tx-plus.webp", name: "TX Plus", url:"https://app.txplus.com.co/  " }
  ],
  [
    { img: "img/asotaba.webp", name: "Asotaba", url:"https://asotaba.com/" },
    { img: "img/servitaxis.webp", name: "ServiTaxis", url:"https://servitaxis.co/" },
    { img: "img/radio-taxi-california.webp", name: "Radio Taxi California", url:"" },
    { img: "img/logo-taxis-libres.webp", name: "Taxi Libres", url:"https://www.taxislibres.com.co/taxis-cali" }
  ]
];

const QUIENES_SOMOS_DATA = [
  {
    id: "qs-s1",
    img: "img/mision-1.png",
    title: "Misión",
    text: "Ser una plataforma pedagógica y sostenible, diseñada para dignificar el transporte individual tipo taxi, promoviendo un servicio eficiente, seguro y amable. Nuestro enfoque social y cívico busca impactar positivamente en la calidad de vida de conductores y usuarios, contribuyendo al desarrollo social y económico de la región."
  },
  {
    id: "qs-s2",
    img: "img/vision-1.png",
    title: "Visión",
    text: "Posicionarnos como la principal plataforma tecnológica cívico-social en el sector de transporte público individual en Colombia. Aspiramos a liderar la transformación del servicio de taxi, garantizando excelencia, seguridad y satisfacción para conductores y usuarios, siendo reconocidos como un modelo de innovación y calidad a nivel nacional."
  },
  {
    id: "qs-s3",
    img: "img/valores-1.png",
    title: "Valores",
    text: "<strong>Compromiso:</strong> Trabajamos con dedicación para brindar un servicio confiable y eficiente.<br /><br /><strong>Innovación:</strong> Incorporamos herramientas tecnológicas que mejoran la experiencia del usuario y del conductor.<br /><br /><strong>Responsabilidad social:</strong> Fomentamos el respeto y el buen trato entre la comunidad y los conductores.<br /><br /><strong>Calidad:</strong> Nos enfocamos en garantizar altos estándares en todos los aspectos del servicio.<br /><br /><strong>Seguridad:</strong> Priorizamos la tranquilidad de los usuarios y conductores en cada interacción."
  }
];

const FALLBACK_TESTIMONIOS = [
  {
    id: 9,
    driverId: 1,
    taxiPlate: "ABC123",
    name: "Jonathan",
    email: "jonathan@jonathan.com",
    contact: "312688773",
    observation: "Buen conductor mal carril",
    rate: "4",
    createdAt: "2025-10-08T01:55:38.000Z",
    updatedAt: "2025-10-08T01:55:38.000Z",
    deletedAt: null
  },
  {
    id: 10,
    driverId: 2,
    taxiPlate: "XYZ987",
    name: "María",
    email: "maria@maria.com",
    contact: "310555999",
    observation: "Servicio puntual, buena vibra",
    rate: "5",
    createdAt: "2025-10-09T11:22:10.000Z",
    updatedAt: "2025-10-09T11:22:10.000Z",
    deletedAt: null
  },
  {
    id: 11,
    driverId: 3,
    taxiPlate: "JKL456",
    name: "Carlos",
    email: "carlos@carlos.com",
    contact: "300112233",
    observation: "Conductor amable, taxi limpio",
    rate: "5",
    createdAt: "2025-10-10T07:40:55.000Z",
    updatedAt: "2025-10-10T07:40:55.000Z",
    deletedAt: null
  }
];

// Componentes memoizados
const ServiceCard = memo(({ img, title, text, link }) => (
  <a href={link} className="text-decoration-none text-dark" style={{ transition: "transform 0.3s" }}>
    <div className="card servicio-card h-100 shadow-sm hover-shadow">
      <img src={img} className="card-img-top" alt={title} loading="lazy" />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{text}</p>
      </div>
    </div>
  </a>
));

ServiceCard.displayName = "ServiceCard";

const EmpresaCard = memo(({ img, name, url }) => {
  const safeUrl = url && String(url).trim() ? String(url).trim() : null;
  const content = (
    <div className="empresa-card">
      <img src={img} alt={name} loading="lazy" />
      <p>{name}</p>
    </div>
  );

  if (safeUrl) {
    return (
      <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="empresa-link">
        {content}
      </a>
    );
  }

  return content;
});

EmpresaCard.displayName = "EmpresaCard";

const QuienesSlide = memo(({ id, img, title, text, nextId }) => (
  <article className={`slide ${id.replace("qs-", "")}`}>
    <div className="left">
      <img src={img} alt={`${title} — La Mancha Amarilla`} loading="lazy" />
      <label className="click-area" htmlFor={nextId}></label>
    </div>
    <div className="right">
      <h2>{title}</h2>
      <p dangerouslySetInnerHTML={{ __html: text }} />
      <label className="click-area-text" htmlFor={nextId}></label>
    </div>
  </article>
));

QuienesSlide.displayName = "QuienesSlide";

const TestimonialCard = memo(({ observation, rate }) => (
  <div className="testimonial-card">
    <div className="quote">"</div>
    <p>{observation}</p>
    <div className="stars">{"★".repeat(Number(rate))}</div>
  </div>
));

TestimonialCard.displayName = "TestimonialCard";

const RadioBar = memo(({ isPlaying, isMuted, onTogglePlay, onToggleMute }) => (
  <div className="radio-bar">
    <div className="radio-content">
      <span className="radio-title">🎙️ Emisora virtual <strong>LaManchaAmarilla.com</strong></span>
      <div className="radio-center">
        <button className="radio-btn" onClick={onTogglePlay}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <div className="wave-animation">
          {[...Array(10)].map((_, i) => <span key={i}></span>)}
        </div>
        <button className="radio-btn" onClick={onToggleMute}>
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>
    </div>
  </div>
));

RadioBar.displayName = "RadioBar";

const ImagePopup = memo(({ show, image, onClose }) => (
  <Modal show={show} onHide={onClose} centered size="xl" backdrop>
    <Modal.Body className="p-0" style={{ background: "transparent" }}>
      {image ? (
        <div style={{ position: "relative" }}>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.45)",
              border: "none",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "20px",
              zIndex: 20,
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <img
            src={image.url}
            alt={image.filename}
            className="w-100"
            style={{ display: "block", maxHeight: "80vh", width: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div className="p-3 text-center">Cargando imagen...</div>
      )}
    </Modal.Body>
  </Modal>
));

ImagePopup.displayName = "ImagePopup";

// Hook personalizado para API
const useApi = () => {
  const apiCall = useCallback(async (method, endpoint, data = null) => {
    try {
      const config = { 
        method, 
        url: endpoint,
        headers: { 
          // "Cache-Control": "no-cache",
          // "Pragma": "no-cache"
        }
      };
      
      if (data) config.data = data;
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Error ${method} ${endpoint}:`, error);
      throw error;
    }
  }, []);

  return { apiCall };
};

// Componente principal
export default function Home() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rates, setRates] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState(null);
  const [loading, setLoading] = useState({ rates: true, image: true });
  const { apiCall } = useApi();

  // Control de audio
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error al reproducir audio:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error de audio',
          text: 'No se pudo reproducir la emisora. Por favor, intenta nuevamente.',
          confirmButtonColor: '#3085d6'
        });
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Obtener datos
  const getPopupImage = useCallback(async () => {
    try {
      const res = await apiCall("GET", "/images");
      if (res?.code === 1 && res.data) {
        setPopupImage(res.data);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Error fetching popup image:", err);
      Swal.fire({
        icon: 'warning',
        title: 'Imagen no disponible',
        text: 'No se pudo cargar la imagen del popup.',
        confirmButtonColor: '#f0ad4e'
      });
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  }, [apiCall]);

  const getRates = useCallback(async () => {
    try {
      const res = await apiCall("GET", "/rate_driver/top");
      if (res?.code === 1) {
        setRates(res.data);
      } else {
        setRates(FALLBACK_TESTIMONIOS);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
      setRates(FALLBACK_TESTIMONIOS);
      // Swal.fire({
      //   icon: 'warning',
      //   title: 'Testimonios temporales',
      //   text: 'Mostrando testimonios de ejemplo mientras se restablece la conexión.',
      //   confirmButtonColor: '#f0ad4e',
      //   timer: 3000
      // });
    } finally {
      setLoading(prev => ({ ...prev, rates: false }));
    }
  }, [apiCall]);

  // Inicialización
  useEffect(() => {
    const init = async () => {
      await Promise.all([getRates(), getPopupImage()]);
    };
    init();
    
    // Auto-ocultar popup después de 10 segundos
    const timer = setTimeout(() => {
      if (showPopup) setShowPopup(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [getRates, getPopupImage]);

  // Testimonios para mostrar (memoizado)
  const displayedTestimonios = useMemo(() => 
    rates.slice(0, 3), 
    [rates]
  );

  // Renderizado condicional de wave animation
  const waveAnimation = useMemo(() => 
    isPlaying ? "wave-animation playing" : "wave-animation",
    [isPlaying]
  );

  return (
    <>
      {/* HERO */}
      <section id="Hero" className="hero position-relative">
        <video autoPlay muted loop playsInline className="hero-video" preload="metadata">
          <source src="play/hero-2.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        <div className="hero-overlay d-flex flex-column justify-content-center align-items-center text-center">
          <h1>Bienvenido a La Mancha Amarilla</h1>
          <p>Transformando el transporte individual con innovación, seguridad y compromiso social.</p>
          <a href="/drivep" className="btn-hero mt-3">Registrarse</a>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-5">
        <div className="container text-center">
          <h2 className="section-title mb-5">Nuestros Servicios</h2>
          <div className="row g-4">
            {SERVICES_DATA.map((servicio, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                <ServiceCard {...servicio} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMPRESAS */}
      <section id="empresas" className="py-5">
        <div className="container text-center">
          <h2 className="section-title mb-5">EMPRESAS QUE TRABAJAN CON NOSOTROS</h2>
          <div id="empresasCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="6000">
            <div className="carousel-inner">
              {EMPRESAS_DATA.map((grupo, idx) => (
                <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                  <div className="row g-4 justify-content-center">
                    {grupo.map((empresa, i) => (
                      <div key={i} className="col-6 col-md-3">
                        <EmpresaCard {...empresa} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#empresasCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#empresasCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>

      {/* QUIENES SOMOS */}
      <section id="Sobre-Nosotros" className="quienes-section" aria-label="Quienes somos - Misión, Visión, Valores">
        <div className="quienes-slider">
          {QUIENES_SOMOS_DATA.map((item, idx) => (
            <input key={item.id} type="radio" name="qs-slide" id={item.id} defaultChecked={idx === 0} />
          ))}
          
          <div className="slides">
            {QUIENES_SOMOS_DATA.map((item, idx) => (
              <QuienesSlide
                key={item.id}
                {...item}
                nextId={QUIENES_SOMOS_DATA[(idx + 1) % QUIENES_SOMOS_DATA.length].id}
              />
            ))}
          </div>
          
          <div className="qs-dots" role="tablist" aria-label="Navegación Quiénes somos">
            {QUIENES_SOMOS_DATA.map((item) => (
              <label key={item.id} htmlFor={item.id} className="dot" aria-label={item.title} role="tab"></label>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros usuarios</h2>
          <p className="section-subtitle">Conoce la experiencia de quienes usan nuestros servicios de taxi</p>
          
          {loading.rates ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando testimonios...</span>
              </div>
            </div>
          ) : (
            <div className="testimonials-grid">
              {displayedTestimonios.map((t) => (
                <TestimonialCard key={t.id} observation={t.observation} rate={t.rate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ÚNETE */}
      <section id="contacto" className="unete-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-3">Únete a La Mancha Amarilla</h2>
              <p>Si eres taxista, regístrate en nuestro parche en lamanchaamarilla.com y sé parte del cambio.</p>
              <p>Nuestro programa es transmitido desde Cali de lunes a viernes de 6 a 8 pm.</p>
              <p>Invitamos a gremios de otras ciudades para transmitir en la emisora, contáctanos para más detalles.</p>
              <a href="/drivep" className="btn btn-warning fw-bold">Registrarse</a>
            </div>
            <div className="col-lg-6 text-center">
              <img src="img/unete.png" alt="Taxis La Mancha Amarilla" className="img-fluid rounded shadow" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* EMISORA */}
      <RadioBar 
        isPlaying={isPlaying} 
        isMuted={isMuted} 
        onTogglePlay={togglePlay} 
        onToggleMute={toggleMute} 
      />
      
      <audio
        ref={audioRef}
        src="https://stream.integracionvirtual.com/proxy/lamanchaamarilla?mp=/stream"
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar a la emisora. Por favor, intenta nuevamente.',
            confirmButtonColor: '#3085d6'
          });
        }}
      />

      {/* POPUP */}
      <ImagePopup 
        show={showPopup} 
        image={popupImage} 
        onClose={() => setShowPopup(false)} 
      />
    </>
  );
}