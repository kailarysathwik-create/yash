import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

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
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        console.log('Processing auth callback:', {
          hasHash: !!hash,
          hasCode: !!code,
          hashIncludes: hash?.includes('access_token='),
        });

        let accessToken = null;

        // Method 1: Supabase PKCE flow returns ?code= in query params
        if (code) {
          console.log('PKCE code detected, exchanging for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange failed:', error);
            navigate('/login', { state: { error: error.message } });
            return;
          }
          accessToken = data.session?.access_token;
          console.log('Code exchange successful, got access token');
        }
        // Method 2: Implicit flow returns #access_token= in hash
        else if (hash?.includes('access_token=')) {
          const params = new URLSearchParams(hash.substring(1));
          accessToken = params.get('access_token');
          const error = params.get('error');
          const errorDescription = params.get('error_description');

          if (error) {
            console.error('Supabase Auth error:', error, errorDescription);
            navigate('/login', { state: { error: errorDescription || error } });
            return;
          }
        }

        // Clear URL artifacts immediately
        window.history.replaceState(null, '', window.location.pathname);

        if (!accessToken) {
          console.error('No access_token found in callback');
          navigate('/login');
          return;
        }

        // Send access_token to backend — backend verifies with Supabase and creates a session cookie
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
          console.error('Backend Error Response Body:', error.response.data);
        }
        const errorMessage = error.response?.data?.msg || error.response?.data?.detail || 'Authentication failed. Please try again.';
        navigate('/login', { state: { error: errorMessage } });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center selection:bg-[#A855F7]/20">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#A855F7]/20 border-t-[#A855F7]" />
        <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#1a0b2e]/30">Verifying Identity...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
