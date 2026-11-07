import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "../shared/components/ProtectedRoute";
import LoginPage from "../features/auth/pages/Login/LoginPage";
import { ModelsPage } from "../features/models";
import { CategoriesPage } from "../features/categories";
import { RatesPage } from "../features/rates";
import { WorkersPage } from "../features/workers";
import { WorkerPortalPage } from "../features/worker-portal";
import { SpecialtiesPage } from "../features/specialties";
import { ColorsPage } from "../features/colors";
import { SizesPage } from "../features/sizes";
import { MaterialTypesPage } from "../features/material-types";
import { PlantTypesPage } from "../features/plant-types";

import {
  DozensPage,
  DozensTablePage,
  DozensFormPage,
  DozensInProgressPage,
} from "../features/dozens";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import { DashboardPage } from "../features/dashboard";

export default function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/portal" element={<WorkerPortalPage />} />

      {/* RUTAS PROTEGIDAS CON LAYOUT */}
      <Route
        path="/"
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="/production/dozens" element={<DozensTablePage />} />
        <Route path="/production/dozens/process" element={<DozensPage />} />
        <Route
          path="/production/dozens/in-progress"
          element={<DozensInProgressPage />}
        />
        <Route path="/production/dozens/new" element={<DozensFormPage />} />
        <Route
          path="/production/dozens/:id/edit"
          element={<DozensFormPage />}
        />
        <Route path="/catalog/models" element={<ModelsPage />} />
        <Route path="/catalog/categories" element={<CategoriesPage />} />
        <Route path="/catalog/colors" element={<ColorsPage />} />
        <Route path="/catalog/sizes" element={<SizesPage />} />
        <Route path="/catalog/material-types" element={<MaterialTypesPage />} />
        <Route path="/catalog/plant-types" element={<PlantTypesPage />} />
        <Route path="/staff/workers" element={<WorkersPage />} />
        <Route path="/staff/specialties" element={<SpecialtiesPage />} />
        <Route path="/payroll/rates" element={<RatesPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
