import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AppLayout from "../layouts/AppLayout";
import { AdminRoute } from "../shared/components/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import { ModelsPage } from "../features/models";
// import { TeamsPage } from '../features/teams';
import { WorkersPage } from "../features/workers";
import { DozensPage, DozensFormPage } from "../features/dozens";

export default function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<AppLayout />} />

      {/* RUTAS PROTEGIDAS CON LAYOUT */}
      <Route
        path="/"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* Todas estas páginas se verán DENTRO del layout (en el Outlet) */}
        <Route path="dashboard" element={<ModelsPage />} />
        <Route path="dozens" element={<DozensPage />} />
        <Route path="dozens/new" element={<DozensFormPage />} />
        <Route path="dozens/:id/edit" element={<DozensFormPage />} />
        <Route path="models" element={<ModelsPage />} />
        {/* <Route path="teams" element={<TeamsPage />} /> */}
        <Route path="workers" element={<WorkersPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
