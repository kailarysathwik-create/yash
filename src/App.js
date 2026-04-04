import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from "next-themes";
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';
import TripPlanner from './pages/TripPlanner';
import ProtectedRoute from './components/ProtectedRoute';
import Taskbar from './components/Taskbar';
import Particles from './components/Particles';
import { UIProvider } from './context/UIContext';
import './App.css';

function AppRouter() {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  if (location.hash?.includes('access_token=') || searchParams.has('code')) {
    return <AuthCallback />;
  }

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
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="App relative min-h-screen overflow-hidden">
        <Particles />
        <BrowserRouter>
          <UIProvider>
            <AppRouter />
          </UIProvider>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
