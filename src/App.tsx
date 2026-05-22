/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/pimpinan/Dashboard';
import { MonitoringKinerja } from './pages/pimpinan/MonitoringKinerja';
import { InputKinerja } from './pages/user/InputKinerja';
import { RiwayatKinerja } from './pages/user/RiwayatKinerja';
import { Biodata } from './pages/user/Biodata';
import { ExportLKB } from './pages/user/ExportLKB';
import { ManajemenPerkin } from './pages/operator/ManajemenPerkin';
import { ManajemenIksk } from './pages/operator/ManajemenIksk';
import { ManajemenSk } from './pages/operator/ManajemenSk';
import { ManajemenPeriode } from './pages/operator/ManajemenPeriode';
import { ManajemenPerkinSatker } from './pages/operator/ManajemenPerkinSatker';
import { ExportLaporan } from './pages/operator/ExportLaporan';
import { ManajemenUser } from './pages/admin/ManajemenUser';
import { ManajemenSatker } from './pages/admin/ManajemenSatker';
import { Unauthorized, PlaceholderPage } from './pages/Unauthorized';
import { useAuthStore } from './store/authStore';
import { getDashboardPath } from './utils/navigation';

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const { config } = useAuthStore.getState();
    const targetPath = config?.dashboard_path || getDashboardPath(user.role);
    return <Navigate to={targetPath} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN']} />}>
            <Route path="/admin/users" element={<ManajemenUser />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['SUPER ADMIN']} />}>
            <Route path="/admin/satker" element={<ManajemenSatker />} />
          </Route>

          {/* Operator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER ADMIN', 'OPERATOR']} />}>
            <Route path="/operator/perkin" element={<ManajemenPerkin />} />
            <Route path="/operator/sk" element={<ManajemenSk />} />
            <Route path="/operator/iksk" element={<ManajemenIksk />} />
            <Route path="/operator/periode" element={<ManajemenPeriode />} />
            <Route path="/operator/perkin-satker" element={<ManajemenPerkinSatker />} />
            <Route path="/operator/export" element={<ExportLaporan />} />
          </Route>

          {/* User Routes (Hanya untuk role USER) */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/user/kinerja" element={<InputKinerja />} />
            <Route path="/user/riwayat" element={<RiwayatKinerja />} />
            <Route path="/user/export" element={<ExportLKB />} />
          </Route>

          {/* Biodata (Bisa diakses semua role) */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN', 'OPERATOR', 'USER', 'PIMPINAN']} />}>
            <Route path="/user/biodata" element={<Biodata />} />
          </Route>

          {/* Pimpinan Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PIMPINAN']} />}>
            <Route path="/pimpinan/dashboard" element={<Dashboard />} />
            <Route path="/pimpinan/monitoring" element={<MonitoringKinerja />} />
          </Route>

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

