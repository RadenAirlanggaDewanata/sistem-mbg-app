import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DataSekolah } from './pages/DataSekolah';
import { DataPosyandu } from './pages/DataPosyandu';
import { DataRelawan } from './pages/DataRelawan';
import { DataPenerima } from './pages/DataPenerima';
import { MenuHarian } from './pages/MenuHarian';
import { UjiOrganoleptik } from './pages/UjiOrganoleptik';
import { AbsensiRelawan } from './pages/AbsensiRelawan';
import { Laporan } from './pages/Laporan';

// Protected Route Guard (Must be logged in)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role Guard for specific roles
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Login Route Guard (Redirect to dashboard if already logged in)
const PublicLoginRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<PublicLoginRoute />} />

          {/* Protected Routes inside MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Master Data Routes (Admin & Kepala SPPG) */}
            <Route
              path="sekolah"
              element={
                <RoleRoute allowedRoles={['Administrator', 'Kepala SPPG']}>
                  <DataSekolah />
                </RoleRoute>
              }
            />
            <Route
              path="posyandu"
              element={
                <RoleRoute allowedRoles={['Administrator', 'Kepala SPPG']}>
                  <DataPosyandu />
                </RoleRoute>
              }
            />
            <Route
              path="relawan"
              element={
                <RoleRoute allowedRoles={['Administrator', 'Kepala SPPG']}>
                  <DataRelawan />
                </RoleRoute>
              }
            />
            <Route
              path="penerima-manfaat"
              element={
                <RoleRoute allowedRoles={['Administrator', 'Kepala SPPG']}>
                  <DataPenerima />
                </RoleRoute>
              }
            />

            {/* Operational Modules */}
            <Route path="menu-harian" element={<MenuHarian />} />
            <Route path="uji-organoleptik" element={<UjiOrganoleptik />} />
            <Route path="absensi-relawan" element={<AbsensiRelawan />} />

            {/* Reports (Admin & Kepala SPPG) */}
            <Route
              path="laporan"
              element={
                <RoleRoute allowedRoles={['Administrator', 'Kepala SPPG']}>
                  <Laporan />
                </RoleRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
