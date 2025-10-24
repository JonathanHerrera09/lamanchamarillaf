import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom"; // 👈 agrega useNavigate
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Calif from "./pages/Calif";
import Objet from "./pages/Objet";
import Job from "./pages/Job";
import Drivep from "./pages/Drivep";
import "./styles/index.css";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 👇 Función para ir a la home y luego hacer scroll a una sección
  const handleNavigateToSection = (sectionId) => {
    setMenuOpen(false);
    navigate("/"); // primero navega al inicio
    // Espera un momento a que cargue la Home antes de hacer scroll
    setTimeout(() => {
      const section = document.querySelector(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 500); // ajusta el tiempo si tu Home tarda más en renderizar
  };

  return (
    <>
      <header>
        {/* 🔸 Top Bar */}
        <div className="top-bar">
          <div className="apps">
            <a href="#">Android App</a> | <a href="#">iOS App</a>
          </div>
          <div className="social-icons">
            <a href="https://www.facebook.com/lamanchaamarilla/?locale=es_LA">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://x.com/">
              <i className="fab fa-x-twitter"></i>
            </a>
            <a href="https://www.instagram.com/lamanchaamarilla/">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.youtube.com/@lamanchaamarilla">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/@johnnyrangellma">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>

        {/* 🔸 Navbar principal */}
        <nav className="navbar">
          <div className="logo">
            <img src="img/MANCHAAMARILLA.COM.png" alt="Logo" />
          </div>

          <ul className={`nav-links ${menuOpen ? "active" : ""}`} id="nav-links">
            <li>
              <Link to="/" className="menu-link btn btn-link p-0 border-0 text-start" onClick={() => setMenuOpen(false)}>Inicio</Link>
            </li>
            <li>
              <button
                className="menu-link btn btn-link p-0 border-0 text-start"
                onClick={() => handleNavigateToSection("#servicios")}
              >
                Servicio
              </button>
            </li>
            <li>
              <button
                className="menu-link btn btn-link p-0 border-0 text-start"
                onClick={() => handleNavigateToSection("#Sobre-Nosotros")}
              >
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button
                className="menu-link btn btn-link p-0 border-0 text-start"
                onClick={() => handleNavigateToSection("#contacto")}
              >
                Únete
              </button>
            </li>
            <li>
              <Link to="/admin" className="menu-link btn btn-link p-0 border-0 text-start" onClick={() => setMenuOpen(false)}>
                Iniciar Sesión
              </Link>
            </li>
          </ul>

          {/* Botón hamburguesa */}
          <div className="menu-toggle" id="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      {/* 🔸 Contenido principal */}
      <main className="containerx">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calf" element={<Calif />} />
          <Route path="/obj" element={<Objet />} />
          <Route path="/job" element={<Job />} />
          <Route path="/drivep" element={<Drivep />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* 🔸 Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            {/* Logo */}
            <div className="col-lg-3 col-md-6 footer-logo text-center mb-4 mb-lg-0">
              <img
                src="img/taxi.webp"
                alt="Logo La Mancha Amarilla"
                className="footer-logo-img"
              />
            </div>

            {/* Descripción */}
            <div className="col-lg-3 col-md-6 footer-about mb-4 mb-lg-0">
              <p>
                La Mancha Amarilla es un proyecto pensado para mejorar el
                servicio de transporte en taxis, fomentando una comunidad
                cívico-social que apoya a conductores y pasajeros con un servicio
                más humano y confiable.
              </p>
            </div>

            {/* Contacto */}
            <div className="col-lg-3 col-md-6 footer-contact mb-4 mb-lg-0">
              <h5>Información de Contacto</h5>
              <ul>
                <li>
                  <strong>Email:</strong> LamanchaamarillaVirtual@gmail.com
                </li>
              </ul>
            </div>

            {/* Redes Sociales */}
            <div className="col-lg-3 col-md-6 footer-social">
              <h5>Síguenos</h5>
              <div className="social-grid">
                <a
                  href="https://www.facebook.com/lamanchaamarilla/?locale=es_LA"
                  className="facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://x.com/" className="x">
                  <i className="fab fa-x-twitter"></i>
                </a>
                <a
                  href="https://www.instagram.com/lamanchaamarilla/"
                  className="instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://www.youtube.com/@lamanchaamarilla"
                  className="youtube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
                <a
                  href="https://www.tiktok.com/@johnnyrangellma"
                  className="tiktok"
                >
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 La Mancha Amarilla. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}
