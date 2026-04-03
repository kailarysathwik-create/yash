import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Globe, Waves, Sparkles } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    if (!supabaseUrl) {
      toast.error("Supabase URL not configured");
      return;
    }
    
    // Redirect to Supabase Google Auth
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}/auth/callback`;
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9370DB]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E6E6FA]/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 bg-[#9370DB] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#9370DB]/30 rotate-12">
            <Waves className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-none">
          Yatra And Stay <span className="text-[#9370DB]">Hub</span>
        </h1>
        <p className="text-gray-400 font-medium mb-12 uppercase tracking-[0.3em] text-[10px]">
          Luxury Travel Concierge • Lavender Edition
        </p>

        <div className="glass-card rounded-[3rem] p-10 border-white/60 shadow-2xl relative">
          <div className="absolute -top-4 -right-4">
            <Sparkles className="w-8 h-8 text-[#9370DB] animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-8 tracking-tight">Access the Architecture</h2>
          
          <div className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-[#9370DB] text-white hover:scale-105 transition-all rounded-full h-20 text-xl font-black shadow-xl shadow-[#9370DB]/20 flex items-center justify-center gap-4"
            >
              <Globe className="w-6 h-6" />
              Sign in with Google
            </Button>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
              By accessing the hub, you agree to our <br/> 
              <span className="text-[#9370DB] cursor-pointer">Protocol terms of service</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Branded Element */}
      <div className="mt-20 flex items-center gap-3 opacity-20">
        <div className="w-5 h-5 bg-[#9370DB] rounded-full" />
        <span className="text-xs font-black tracking-[0.5em] text-gray-900 uppercase">Hub 3.0</span>
      </div>
    </div>
  );
};

export default Login;