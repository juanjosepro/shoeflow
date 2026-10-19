import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "../shared/components/ProtectedRoute";
import LoginPage from "../features/auth/pages/Login/LoginPage";
import { ModelsPage } from "../features/models";
import { CategoriesPage } from "../features/categories";
import { RatesPage } from "../features/rates";
import { WorkersPage } from "../features/workers";
import { SpecialtiesPage } from "../features/specialties";
import { ColorsPage } from "../features/colors";
import { SizesPage } from "../features/sizes";
import { MaterialTypesPage } from "../features/material-types";
import { PlantTypesPage } from "../features/plant-types";

import {
  DozensPage,
  DozensTablePage,
  DozensFormPage,
} from "../features/dozens";
import MainLayout from "@/layouts/MainLayout/MainLayout";

export default function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />

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
