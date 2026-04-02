import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Supabase returns the token in the URL hash after OAuth:
        // /auth/callback#access_token=...&refresh_token=...&token_type=bearer
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          console.error('No access_token found in URL hash');
          navigate('/login');
          return;
        }

        // Send access_token to backend — backend will verify with Supabase and create a session
        const response = await axios.post(
          `${API}/auth/session`,
          { access_token: accessToken },
          { withCredentials: true }
        );

        const { user, needs_onboarding } = response.data;

        // Clear hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Navigate to appropriate page
        if (needs_onboarding) {
          navigate('/onboarding', { state: { user }, replace: true });
        } else {
          navigate('/dashboard', { state: { user }, replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        // Clear the hash to avoid infinite loop
        window.history.replaceState(null, '', '/');
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E8E6E1] border-t-[#D96C4A]" />
        <p className="mt-4 text-[#5A6B5D]">Setting up your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;