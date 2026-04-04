import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Waves, Sparkles, MapPin, Navigation } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI';
import { supabase } from '@/lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tripAPI.auth.login(email);
      toast.success('Hub Access Protocol Initiated. Check your email!');
    } catch (error) {
      toast.error('Authentication node failure');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Google OAuth error:', error);
        toast.error('Google login failed: ' + error.message);
      }
      // Supabase JS client automatically redirects to Google
    } catch (error) {
      console.error('Google login exception:', error);
      toast.error('Identity provider handshake failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 selection:bg-[#A855F7]/20">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 bg-white/50 rounded-full border-4 border-white mx-auto shadow-2xl hover:scale-105 transition-transform duration-500 overflow-hidden shrink-0">
            <img src="/logo.png" alt="Y.A.S.H Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-[3.5rem] p-12 border-white/50 shadow-[0_50px_100px_-20px_rgba(147,112,219,0.15)]"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-[#1a0b2e] mb-2">Access Hub</h2>
            <p className="text-[#1a0b2e]/40 text-sm font-medium">Login To Y.A.S.H</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A855F7]/60 ml-1">Email login</Label>
              <Input
                type="email"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input h-16 px-6 font-bold placeholder:text-[#A855F7]/40 placeholder:font-medium"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-[1.02] transition-all duration-700 rounded-full h-16 font-black text-lg shadow-xl shadow-[#1a0b2e]/10"
            >
              {loading ? 'Handshaking...' : 'Initialize Access'}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1a0b2e]/5"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-transparent text-[#1a0b2e]/20 font-black uppercase tracking-widest">OR</span></div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-16 h-16 border-2 border-[#1a0b2e]/5 bg-white/40 hover:bg-white hover:border-[#A855F7]/30 hover:scale-110 transition-all duration-500 rounded-full flex items-center justify-center p-0 shadow-lg"
              title="Continue with Google"
            >
              <svg className="w-8 h-8 text-[#1a0b2e]" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </Button>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1a0b2e]/20">
              <MapPin className="w-3 h-3" /> Ai Plans
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1a0b2e]/20">
              <Navigation className="w-3 h-3" /> Happy Journey
            </div>
          </div>
          <p className="text-[#A855F7]/20 text-[9px] font-bold tracking-widest">© 2026 YATRA AND STAY HUB. ALL RIGHTS RESERVED.</p>
        </motion.div>
      </div>

      {/* Background Decor - Airy Bright */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-[#f3e8ff] rounded-full blur-[140px] pulse-bg opacity-50" />
        <div className="absolute bottom-[10%] left-[10%] w-[700px] h-[700px] bg-white rounded-full blur-[150px] animate-float opacity-30" />
      </div>
    </div>
  );
};

export default Login;
