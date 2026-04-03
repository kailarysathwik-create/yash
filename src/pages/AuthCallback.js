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
        const hash = window.location.hash;
        console.log('Processing auth callback with hash:', hash ? 'Present' : 'Missing');
        
        // Clear hash IMMEDIATELY to prevent double processing/loops
        window.history.replaceState(null, '', window.location.pathname);

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          console.error('Supabase Auth error:', error, errorDescription);
          navigate('/login', { state: { error: errorDescription || error } });
          return;
        }

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



        // Navigate to appropriate page
        if (needs_onboarding) {
          navigate('/onboarding', { state: { user }, replace: true });
        } else {
          navigate('/dashboard', { state: { user }, replace: true });
        }
      } catch (error) {
        console.error('Full auth callback error details:', error);
        if (error.response) {
          console.error('Backend response items:', error.response.data);
          console.error('Backend status:', error.response.status);
        }
        // Clear the hash as a secondary safety measure
        window.history.replaceState(null, '', '/');
        navigate('/login', { state: { error: 'Authentication failed. Please check backend connection.' } });
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
