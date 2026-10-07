import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { InstitutionLayout } from './layouts/InstitutionLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { VerifyPage } from './pages/public/VerifyPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterInstitutionPage } from './pages/public/RegisterInstitutionPage';

// Super Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminInstitutionsPage } from './pages/admin/AdminInstitutionsPage';
import { AdminCertificatesPage } from './pages/admin/AdminCertificatesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';

// Institution Pages
import { InstitutionDashboardPage } from './pages/institution/InstitutionDashboardPage';
import { InstitutionCertificatesPage } from './pages/institution/InstitutionCertificatesPage';
import { CreateCertificatePage } from './pages/institution/CreateCertificatePage';
import { CertificateDetailPage } from './pages/institution/CertificateDetailPage';
import { InstitutionVerificationsPage } from './pages/institution/InstitutionVerificationsPage';
import { InstitutionProfilePage } from './pages/institution/InstitutionProfilePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:certificateId" element={<VerifyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-institution" element={<RegisterInstitutionPage />} />
          </Route>

          {/* Super Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="institutions" element={<AdminInstitutionsPage />} />
            <Route path="certificates" element={<AdminCertificatesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="verifications" element={<AdminVerificationsPage />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Institution Admin Protected Routes */}
          <Route path="/institution" element={<InstitutionLayout />}>
            <Route path="dashboard" element={<InstitutionDashboardPage />} />
            <Route path="certificates" element={<InstitutionCertificatesPage />} />
            <Route path="certificates/create" element={<CreateCertificatePage />} />
            <Route path="certificates/:id" element={<CertificateDetailPage />} />
            <Route path="verifications" element={<InstitutionVerificationsPage />} />
            <Route path="profile" element={<InstitutionProfilePage />} />
            <Route index element={<Navigate to="/institution/dashboard" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
