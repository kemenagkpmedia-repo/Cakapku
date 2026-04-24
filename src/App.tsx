/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/pimpinan/Dashboard';
import { InputKinerja } from './pages/user/InputKinerja';
import { RiwayatKinerja } from './pages/user/RiwayatKinerja';
import { Biodata } from './pages/user/Biodata';
import { ExportLKB } from './pages/user/ExportLKB';
import { ManajemenPerkin } from './pages/operator/ManajemenPerkin';
import { ManajemenPeriode } from './pages/operator/ManajemenPeriode';
import { ManajemenPerkinSatker } from './pages/operator/ManajemenPerkinSatker';
import { ManajemenUser } from './pages/admin/ManajemenUser';
import { ManajemenSatker } from './pages/admin/ManajemenSatker';
import { Unauthorized, PlaceholderPage } from './pages/Unauthorized';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<ManajemenUser />} />
            <Route path="/admin/satker" element={<ManajemenSatker />} />
          </Route>

          {/* Operator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
            <Route path="/operator/perkin" element={<ManajemenPerkin />} />
            <Route path="/operator/periode" element={<ManajemenPeriode />} />
            <Route path="/operator/perkin-satker" element={<ManajemenPerkinSatker />} />
            <Route path="/operator/export" element={<PlaceholderPage title="Export Laporan" />} />
          </Route>

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/user/kinerja" element={<InputKinerja />} />
            <Route path="/user/riwayat" element={<RiwayatKinerja />} />
            <Route path="/user/biodata" element={<Biodata />} />
            <Route path="/user/export" element={<ExportLKB />} />
          </Route>

          {/* Pimpinan Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PIMPINAN']} />}>
            <Route path="/pimpinan/dashboard" element={<Dashboard />} />
          </Route>

        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

