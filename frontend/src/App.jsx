import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import RegisterPage from './pages/RegisterPage';
import ScanPage from './pages/ScanPage';
import DisplayPage from './pages/DisplayPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveAttendance from './pages/admin/LiveAttendance';
import StudentRoster from './pages/admin/StudentRoster';
import AdminSettings from './pages/admin/AdminSettings';
import DevicePreviewPage from './pages/DevicePreviewPage';

import AnimeBackground from './components/AnimeBackground';

// Protected Route Guard for Admin views
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Dynamic Festival Sparkle Background Animation */}
      <AnimeBackground />

      {/* Viewport Ambient Ring Light Frame */}
      <div className="pointer-events-none fixed inset-0 z-50 border border-amber-500/15 shadow-[inset_0_0_60px_rgba(245,158,11,0.04)]">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400/70" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400/70" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400/70" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400/70" />
      </div>

      <div className="relative z-10 min-h-screen">
        <Routes>
          {/* Student Registration (Guarded by static secret QR key) */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Attendance Marking (StudentID + UniquePIN) */}
          <Route path="/scan" element={<ScanPage />} />

          {/* Classroom Projector Display Screen (Protected: Facilitator/Admin Only) */}
          <Route
            path="/display"
            element={
              <ProtectedAdminRoute>
                <DisplayPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Dual Mobile Device Simulator (Protected: Facilitator/Admin Only) */}
          <Route
            path="/preview"
            element={
              <ProtectedAdminRoute>
                <DevicePreviewPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/mobile"
            element={
              <ProtectedAdminRoute>
                <DevicePreviewPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Admin Authentication */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Management Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          {/* Real-time Live Attendance Table */}
          <Route
            path="/admin/attendance"
            element={
              <ProtectedAdminRoute>
                <LiveAttendance />
              </ProtectedAdminRoute>
            }
          />

          {/* Student Roster View */}
          <Route
            path="/admin/students"
            element={
              <ProtectedAdminRoute>
                <StudentRoster />
              </ProtectedAdminRoute>
            }
          />

          {/* System Settings & Static QR View */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettings />
              </ProtectedAdminRoute>
            }
          />

          {/* Default route redirects to Student Scan page */}
          <Route path="/" element={<Navigate to="/scan" replace />} />
          <Route path="*" element={<Navigate to="/scan" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
