import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import axios from "axios";

/* ===================== AXIOS GLOBAL ===================== */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3050";
axios.defaults.baseURL = `${API_BASE}/api/v1`;
axios.defaults.timeout = 15000;
/* ======================================================= */

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
