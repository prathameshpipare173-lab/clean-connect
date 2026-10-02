import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { seedDemoData } from './data/seed';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VillagerDashboard from './pages/villager/VillagerDashboard';
import VillagerMap from './pages/villager/Map';
import AgentDashboard from './pages/agent/AgentDashboard';
import RecyclerDashboard from './pages/recycler/RecyclerDashboard';
import PanchayatDashboard from './pages/admin/PanchayatDashboard';
import { Recycle } from 'lucide-react';

// Seed data on app load
seedDemoData();

function RoleGuard({ role, children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== role) return <Navigate to={`/${currentUser.role}`} replace />;
  return children;
}

function AuthGuard({ children }) {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to={`/${currentUser.role}`} replace />;
  return children;
}

function SplashScreen() {
  return (
    <div className="splash-root">
      <div className="splash-logo-wrap">
        <div className="splash-logo">
          <Recycle size={44} color="#fff" className="splash-spin" />
        </div>
        <div className="splash-title">Clean Connect</div>
        <div className="splash-sub">Village Waste-to-Wealth Platform</div>
        <div className="splash-sub2">Panhala Taluka, Kolhapur</div>
      </div>
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (showSplash || loading) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/" element={<AuthGuard><Login /></AuthGuard>} />
      <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />

      {/* Villager Routes */}
      <Route path="/villager" element={<RoleGuard role="villager"><VillagerDashboard /></RoleGuard>} />
      <Route path="/villager/map" element={<RoleGuard role="villager"><VillagerMap /></RoleGuard>} />

      {/* Agent Routes */}
      <Route path="/agent" element={<RoleGuard role="agent"><AgentDashboard /></RoleGuard>} />

      {/* Recycler Routes */}
      <Route path="/recycler" element={<RoleGuard role="recycler"><RecyclerDashboard /></RoleGuard>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<RoleGuard role="admin"><PanchayatDashboard /></RoleGuard>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
