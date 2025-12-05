import React, { useRef, useState, useEffect } from "react";
import "../styles/Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import axios from "axios";

export default function Home() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rates, setRates] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const getPopupImage = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/images`);
      if (res.data && res.data.code === 1 && res.data.data) {
        setPopupImage(res.data.data);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Error fetching popup image:", err);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  const getRates = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/rate_driver/top`);
      if (res.data.code === 1) setRates(res.data.data);
    } catch (error) {
      console.error("Error fetching rates:", error);
      const testimonios = [
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
];      setRates(testimonios);
    }
  };

  useEffect(() => {
    getRates();
    getPopupImage();
  }, []);

  return (
    <>

      {/* HERO */}
      <section id="Hero" className="hero position-relative">
        <video autoPlay muted loop playsInline className="hero-video">
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
            {[
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
            ].map((servicio, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                 <a
                  href={servicio.link}
                  className="text-decoration-none text-dark"
                  style={{ transition: "transform 0.3s" }}
                >
                  <div className="card servicio-card h-100 shadow-sm hover-shadow">
                    <img
                      src={servicio.img}
                      className="card-img-top"
                      alt={servicio.title}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{servicio.title}</h5>
                      <p className="card-text">{servicio.text}</p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================== EMPRESAS ================== */}
      <section id="empresas" className="py-5">
        <div className="container text-center">
          <h2 className="section-title mb-5">EMPRESAS QUE TRABAJAN CON NOSOTROS</h2>

          <div
            id="empresasCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="6000"
          >
            <div className="carousel-inner">
              {/* Grupo 1 */}
              <div className="carousel-item active">
                <div className="row g-4 justify-content-center">
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/valcali.webp" alt="Valcali" />
                      <p>Valcali</p>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/toro-autos.webp" alt="Toro Autos" />
                      <p>Toro Autos</p>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/taxis-y-autos-cali.webp" alt="Taxis y Autos Cali" />
                      <p>Taxis y Autos Cali</p>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/Logo-Tx-plus.webp" alt="TX Plus" />
                      <p>TX Plus</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grupo 2 */}
              <div className="carousel-item">
                <div className="row g-4 justify-content-center">
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/asotaba.webp" alt="Asotaba" />
                      <p>Asotaba</p>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/servitaxis.webp" alt="ServiTaxis" />
                      <p>ServiTaxis</p>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img
                        src="img/radio-taxi-california.webp"
                        alt="Radio Taxi California"
                      />
                      <p>Radio Taxi California</p>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="empresa-card">
                      <img src="img/logo-taxis-libres.webp" alt="Taxis Libres" />
                      <p>Taxis Libres</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles opcionales */}
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#empresasCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#empresasCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>
      <section id="Sobre-Nosotros" className="quienes-section" aria-label="Quienes somos - Misión, Visión, Valores">
        <div className="quienes-slider">

          {/* radios (controlan qué slide se muestra) */}
          <input type="radio" name="qs-slide" id="qs-s1" defaultChecked />
          <input type="radio" name="qs-slide" id="qs-s2" />
          <input type="radio" name="qs-slide" id="qs-s3" />

          {/* contenedor de slides */}
          <div className="slides">

            {/* SLIDE 1 - MISIÓN */}
            <article className="slide s1">
              <div className="left">
                <img src="img/mision-1.png" alt="Misión — La Mancha Amarilla" loading="lazy" />
                <label className="click-area" htmlFor="qs-s2"></label>
              </div>
              <div className="right">
                <h2>Misión</h2>
                <p>
                  Ser una plataforma pedagógica y sostenible, diseñada para dignificar el transporte individual tipo taxi,
                  promoviendo un servicio eficiente, seguro y amable. Nuestro enfoque social y cívico busca impactar
                  positivamente en la calidad de vida de conductores y usuarios, contribuyendo al desarrollo social y
                  económico de la región.
                </p>
                <label className="click-area-text" htmlFor="qs-s2"></label>
              </div>
            </article>

            {/* SLIDE 2 - VISIÓN */}
            <article className="slide s2">
              <div className="left">
                <img src="img/vision-1.png" alt="Visión — La Mancha Amarilla" loading="lazy" />
                <label className="click-area" htmlFor="qs-s3"></label>
              </div>
              <div className="right">
                <h2>Visión</h2>
                <p>
                  Posicionarnos como la principal plataforma tecnológica cívico-social en el sector de transporte público
                  individual en Colombia. Aspiramos a liderar la transformación del servicio de taxi, garantizando excelencia,
                  seguridad y satisfacción para conductores y usuarios, siendo reconocidos como un modelo de innovación y
                  calidad a nivel nacional.
                </p>
                <label className="click-area-text" htmlFor="qs-s3"></label>
              </div>
            </article>

            {/* SLIDE 3 - VALORES */}
            <article className="slide s3">
              <div className="left">
                <img src="img/valores-1.png" alt="Valores — La Mancha Amarilla" loading="lazy" />
                <label className="click-area" htmlFor="qs-s1"></label>
              </div>
              <div className="right">
                <h2>Valores</h2>
                <p>
                  <strong>Compromiso:</strong> Trabajamos con dedicación para brindar un servicio confiable y eficiente.
                  <br /><br />
                  <strong>Innovación:</strong> Incorporamos herramientas tecnológicas que mejoran la experiencia del usuario y del conductor.
                  <br /><br />
                  <strong>Responsabilidad social:</strong> Fomentamos el respeto y el buen trato entre la comunidad y los conductores.
                  <br /><br />
                  <strong>Calidad:</strong> Nos enfocamos en garantizar altos estándares en todos los aspectos del servicio.
                  <br /><br />
                  <strong>Seguridad:</strong> Priorizamos la tranquilidad de los usuarios y conductores en cada interacción.
                </p>
                <label className="click-area-text" htmlFor="qs-s1"></label>
              </div>
            </article>

          </div>

          {/* dots (indicadores manuales) */}
          <div className="qs-dots" role="tablist" aria-label="Navegación Quiénes somos">
            <label htmlFor="qs-s1" className="dot" aria-label="Misión" role="tab"></label>
            <label htmlFor="qs-s2" className="dot" aria-label="Visión" role="tab"></label>
            <label htmlFor="qs-s3" className="dot" aria-label="Valores" role="tab"></label>
          </div>

        </div>
      </section>
      {/* ================= TESTIMONIOS ================= */}
      <section className="testimonials">
  <div className="container">
    <h2 className="section-title">Lo que dicen nuestros usuarios</h2>
    <p className="section-subtitle">Conoce la experiencia de quienes usan nuestros servicios de taxi</p>

    <div className="testimonials-grid">
      {rates.slice(0, 3).map((t) => (
        <div key={t.id} className="testimonial-card">
          <div className="quote">“</div>
          <p>{t.observation}</p>
          <div className="stars">{"★".repeat(Number(t.rate))}</div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ================= ÚNETE A LA MANCHA AMARILLA ================= */}
      <section id="contacto" className="unete-section py-5">
        <div className="container">
          <div className="row align-items-center">
            
            {/* Texto */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-3">Únete a La Mancha Amarilla</h2>
              <p>
                Si eres taxista, regístrate en nuestro parche en lamanchaamarilla.com 
                y sé parte del cambio.
              </p>
              <p>
                Nuestro programa es transmitido desde Cali de lunes a viernes de 6 a 8 pm.
              </p>
              <p>
                Invitamos a gremios de otras ciudades para transmitir en la emisora, contáctanos para más detalles.
              </p>
              {/* <button className="btn btn-warning fw-bold">Registrarse</button> */}
               <a href="/drivep" className="btn btn-warning fw-bold">Registrarse</a>
            </div>

            {/* Imagen */}
            <div className="col-lg-6 text-center">
              <img src="img/unete.png" alt="Taxis La Mancha Amarilla" className="img-fluid rounded shadow" />
            </div>

          </div>
        </div>
      </section>

      {/* EMISORA */}
      <div className="radio-bar">
        <div className="radio-content">
          <span className="radio-title">🎙️ Emisora virtual <strong>LaManchaAmarilla.com</strong></span>
        
        <div className="radio-center">
          <button id="playBtn" className="radio-btn" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <div className="wave-animation">
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <button id="muteBtn" className="radio-btn" onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>
        </div>
        {/* <div className="wave-background"></div> */}
        <audio
          ref={audioRef}
          src="https://stream.integracionvirtual.com/proxy/lamanchaamarilla?mp=/stream"
          preload="none"
        />
      </div>
    
      {/* Modal popup - imagen desde API */}
      <Modal show={showPopup} onHide={() => setShowPopup(false)} centered size="xl" backdrop={true}>
        <Modal.Body className="p-0" style={{ background: "transparent" }}>
          {popupImage ? (
            <div style={{ position: "relative" }}>
              <button
                aria-label="Cerrar"
                onClick={() => setShowPopup(false)}
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
                src={popupImage.url}
                alt={popupImage.filename}
                className="w-100"
                style={{ display: "block", maxHeight: "80vh", width: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="p-3">Cargando...</div>
          )}
        </Modal.Body>
      </Modal>

    </>
  );
}
