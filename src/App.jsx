import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { TicketsPage } from "@/pages/TicketsPage";
import { NewTicketPage } from "@/pages/NewTicketPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CollectionsPage } from "@/pages/CollectionsPage";
import { TechnicianDashboardPage } from "@/pages/TechnicianDashboardPage";

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function TechnicianRoute() {
  const { isAuthenticated, role } = useAuthStore();
  return isAuthenticated && role === "technician" ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/new" element={<NewTicketPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
          </Route>
        </Route>
        <Route element={<TechnicianRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<TechnicianDashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
