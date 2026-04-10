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
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Taskbar from './components/Taskbar';
import Particles from './components/Particles';
import { UIProvider, useUI } from './context/UIContext';
import './App.css';

function AppRouter() {
  const location = useLocation();
  const { isMaster, user, logout } = useUI();

  const searchParams = new URLSearchParams(location.search);
  if (location.hash?.includes('access_token=') || searchParams.has('code')) {
    return <AuthCallback />;
  }

  const isAuthRoute = ['/', '/login', '/auth/callback'].includes(location.pathname);
  const showTaskbar = !isMaster && !isAuthRoute && ['/dashboard', '/history', '/trip/', '/profile'].some(path => location.pathname.includes(path));

  return (
    <>
      {isMaster && !isAuthRoute && (
        <div className="fixed top-0 right-0 p-8 z-[100] flex items-center gap-6">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 opacity-50 mb-1">Master Commander</span>
            <span className="text-xs font-bold text-white tracking-tight italic opacity-90">{user?.email}</span>
          </div>
          <button 
            onClick={logout}
            className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all duration-500 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-0 group-hover:rotate-12 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/trip/:tripId" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
