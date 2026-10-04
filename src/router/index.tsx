import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "../shared/components/ProtectedRoute";
import LoginPage from "../features/auth/pages/Login/LoginPage";
import { ModelsPage } from "../features/models";
// import { TeamsPage } from '../features/teams';
import { WorkersPage } from "../features/workers";
import {
  DozensPage,
  DozensTablePage,
  DozensFormPage,
} from "../features/dozens";
import AdminLayout from "@/layouts/AdminLayout";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import AppLayout2 from "@/layouts/AppLayout2";

export default function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app2" element={<AppLayout2 />} />

      {/* RUTAS PROTEGIDAS CON LAYOUT */}
      <Route
        path="/"
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        {/* Todas estas páginas se verán DENTRO del layout (en el Outlet) */}
        <Route path="dashboard" element={<ModelsPage />} />
        <Route path="/production/dozens" element={<DozensTablePage />} />
        <Route path="/production/dozens/process" element={<DozensPage />} />
        <Route path="/production/dozens/new" element={<DozensFormPage />} />
        <Route
          path="/production/dozens/:id/edit"
          element={<DozensFormPage />}
        />
        <Route path="/catalog/models" element={<ModelsPage />} />
        {/* <Route path="/staff/teams" element={<TeamsPage />} /> */}
        <Route path="/staff/workers" element={<WorkersPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
