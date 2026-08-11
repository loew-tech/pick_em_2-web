import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";

import "./auth/amplify";
import App from "./App.tsx";
import Login from "./pages/login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* @TODO: move to /Routes */}
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
