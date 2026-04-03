import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import HistoryPage from '@/pages/History';
import TripPlanner from '@/pages/TripPlanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Taskbar from '@/components/Taskbar';
import Particles from '@/components/Particles';
import '@/App.css';

function AppRouter() {
  const location = useLocation();

  // Supabase OAuth returns access_token in the hash on /auth/callback
  // This catches it no matter which route the hash lands on
  if (location.hash?.includes('access_token=')) {
    return <AuthCallback />;
  }

  // Show Taskbar only on protected routes (not login/auth/onboarding)
  const showTaskbar = ['/dashboard', '/history', '/trip/'].some(path => location.pathname.includes(path));

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/trip/:tripId" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
      </Routes>
      {showTaskbar && <Taskbar />}
    </>
  );
}

function App() {
  return (
    <div className="App relative min-h-screen overflow-hidden">
      <Particles />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
