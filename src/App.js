import React, { useState, useCallback } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Calif from "./pages/Calif";
import Objet from "./pages/Objet";
import Job from "./pages/Job";
import Drivep from "./pages/Drivep";
import "./styles/index.css";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/lamanchaamarilla/?locale=es_LA", icon: "facebook-f", className: "facebook" },
  { href: "https://x.com/", icon: "x-twitter", className: "x" },
  { href: "https://www.instagram.com/lamanchaamarilla/", icon: "instagram", className: "instagram" },
  { href: "https://www.youtube.com/@lamanchaamarilla", icon: "youtube", className: "youtube" },
  { href: "https://www.tiktok.com/@johnnyrangellma", icon: "tiktok", className: "tiktok" }
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavigateToSection = useCallback((sectionId) => {
    closeMenu();
    navigate("/");

    requestAnimationFrame(() => {
      const section = document.querySelector(sectionId);
      section?.scrollIntoView({ behavior: "smooth" });
    });
  }, [navigate, closeMenu]);

  return (
    <>
      <header>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="apps">
            <a href="#">Android App</a> | <a href="#">iOS App</a>
          </div>

          <div className="social-icons">
            {SOCIAL_LINKS.map(({ href, icon }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer">
                <i className={`fab fa-${icon}`}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">
            <img src="img/MANCHAAMARILLA.COM.png" alt="Logo" />
          </div>

          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" className="menu-link btn btn-link p-0 border-0 text-start" onClick={closeMenu}>
                Inicio
              </Link>
            </li>
            <li>
              <button className="menu-link btn btn-link p-0 border-0 text-start"
                onClick={() => handleNavigateToSection("#servicios")}>
                Servicio
              </button>
            </li>
            <li>
              <button className="menu-link btn btn-link p-0 border-0 text-start"
                onClick={() => handleNavigateToSection("#Sobre-Nosotros")}>
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button className="menu-link btn btn-link p-0 border-0 text-start"
                onClick={() => handleNavigateToSection("#contacto")}>
                Únete
              </button>
            </li>
            <li>
              <Link to="/admin" className="menu-link btn btn-link p-0 border-0 text-start" onClick={closeMenu}>
                Iniciar Sesión
              </Link>
            </li>
          </ul>

          <div className="menu-toggle" onClick={() => setMenuOpen(v => !v)}>
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      {/* Main */}
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 footer-logo text-center mb-4 mb-lg-0">
              <img src="img/taxi.webp" alt="Logo La Mancha Amarilla" className="footer-logo-img" />
            </div>

            <div className="col-lg-3 col-md-6 footer-about mb-4 mb-lg-0">
              <p>
                La Mancha Amarilla es un proyecto pensado para mejorar el servicio de transporte en taxis,
                fomentando una comunidad cívico-social más humana y confiable.
              </p>
            </div>

            <div className="col-lg-3 col-md-6 footer-contact mb-4 mb-lg-0">
              <h5>Información de Contacto</h5>
              <ul>
                <li><strong>Email:</strong> LamanchaamarillaVirtual@gmail.com</li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6 footer-social">
              <h5>Síguenos</h5>
              <div className="social-grid">
                {SOCIAL_LINKS.map(({ href, icon, className }, i) => (
                  <a key={i} href={href} className={className} target="_blank" rel="noopener noreferrer">
                    <i className={`fab fa-${icon}`}></i>
                  </a>
                ))}
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
