import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    location.state?.user ? true : null
  );
  const [user, setUser] = useState(location.state?.user || null);

  useEffect(() => {
    // If user data passed from AuthCallback, skip auth check
    if (location.state?.user) {
      setIsAuthenticated(true);
      setUser(location.state.user);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });

        const { user: userData, needs_onboarding } = response.data;
        setUser(userData);
        setIsAuthenticated(true);

        // Redirect to onboarding if needed and not already there
        if (needs_onboarding && !location.pathname.includes('/onboarding')) {
          navigate('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E8E6E1] border-t-[#D96C4A]" />
      </div>
    );
  }

  // Render children if authenticated
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
