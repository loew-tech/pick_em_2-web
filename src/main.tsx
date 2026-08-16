import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";

import "./auth/amplify";
import App from "./App.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import Home from "./pages/home.tsx";
import ActivityPage from "./pages/activity.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* @TODO: move to /Routes */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="register" element={<Register />} />{" "}
        <Route path="/home" element={<Home />} />
        <Route path="/activities/new" element={<ActivityPage />} />
        <Route
          path="/categories/:categoryId/activities/:activityId"
          element={<ActivityPage />}
        />
        {/* @TODO: Redirect to home and have home redirect to login if not auth */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
