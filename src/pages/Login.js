import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Globe, Waves, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9370DB]/10 rounded-full blur-[120px] pulse-bg" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] animate-float" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full text-center relative z-10"
      >
        <div className="flex justify-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-black/50 rotate-12 border border-white/20"
          >
            <Waves className="w-12 h-12 text-[#1a0b2e]" />
          </motion.div>
        </div>

        <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-[0.85]">
          Yatra And Stay <br /> <span className="text-[#9370DB]">Hub</span>
        </h1>
        <p className="text-white/40 font-bold mb-12 uppercase tracking-[0.4em] text-[11px]">
          Luxury Travel Concierge • Purple Edition
        </p>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card rounded-[3.5rem] p-12 border-white/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#9370DB]/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mb-8 border border-white/5">
             <ShieldCheck className="w-3 h-3 text-[#9370DB]" /> SECURE ACCESS PROTOCOL
          </div>
          
          <h2 className="text-2xl font-black text-white mb-10 tracking-tight">Authorize Identity</h2>
          
          <div className="space-y-8">
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-105 transition-all duration-500 rounded-full h-24 text-2xl font-black shadow-2xl shadow-black/50 flex items-center justify-center gap-5"
            >
              <Globe className="w-8 h-8" />
              Google Authentication
            </Button>
            
            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] leading-loose">
                By entering the hub, you agree to <br/> 
                <span className="text-white/40 hover:text-[#9370DB] cursor-pointer transition-colors">Y.A.S.H Secure Protocols</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Sparkles Decor */}
      <div className="fixed top-20 right-20 -z-10 opacity-5">
        <Sparkles className="w-[400px] h-[400px] text-white" strokeWidth={0.5} />
      </div>
    </div>
  );
};

export default Login;