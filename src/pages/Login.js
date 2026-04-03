import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  const handleGoogleLogin = () => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    // Redirect to /auth/callback — Supabase will append #access_token=... to this URL
    const redirectTo = `${window.location.origin}/auth/callback`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-8 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <Globe className="w-10 h-10 text-black" />
          </motion.div>
 
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-light text-white mb-6">
            <span className="font-bold text-[#D4AF37]">Y.A.S.H</span>
            <br />
            <span className="text-2xl sm:text-3xl text-gray-400">Yatra And Stay Hub</span>
          </h1>
 
          <p className="text-base sm:text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto mb-12">
            Experience the future of luxury travel planning. AI-powered itineraries, seamless bookings, and customized stays — all in one premium platform.
          </p>
 
          {/* CTA Button */}
          <Button
            data-testid="google-login-btn"
            onClick={handleGoogleLogin}
            className="bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-full px-10 py-6 text-lg font-bold transition-all duration-200 shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 border-none"
          >
            Continue with Google
          </Button>
 
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              <span>Premium Luxury</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              <span>Global Concierge</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;