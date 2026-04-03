import React from 'react';
import { motion } from 'framer-motion';
import { Waves, Globe, Sparkles, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  const handleGoogleLogin = () => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const redirectTo = `${window.location.origin}/auth/callback`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] text-gray-900 font-['Outfit']">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00BCD4]/5 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00BCD4]/5 rounded-full blur-[100px] -ml-64 -mb-64" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          {/* Logo Handle */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-[#00BCD4]/10 mb-12"
          >
            <Waves className="w-6 h-6 text-[#00BCD4]" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Yatra And Stay Hub</span>
          </motion.div>
  
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-gray-900">
            The Hub of <br />
            <span className="text-[#00BCD4]">Smart Travel.</span>
          </h1>
  
          <p className="text-lg md:text-xl font-medium text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
            Experience the future of concierge planning. AI-routed transport, 3D itinerary visualization, and curated hub retreats.
          </p>
  
          {/* CTA Section */}
          <div className="flex flex-col items-center gap-6">
            <Button
              onClick={handleGoogleLogin}
              className="bg-[#00BCD4] text-white hover:scale-105 transition-all rounded-full px-16 py-9 text-2xl font-black shadow-2xl shadow-[#00BCD4]/30 flex items-center gap-4 group"
            >
              <Globe className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              Access the Hub
            </Button>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Official Google Authentication Required</p>
          </div>
  
          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-24 grid grid-cols-3 gap-8 text-left"
          >
            {[
              { icon: <Navigation className="w-5 h-5"/>, label: "AI Hub Routing" },
              { icon: <Sparkles className="w-5 h-5"/>, label: "3D Concierge" },
              { icon: <Waves className="w-5 h-5"/>, label: "Smart Retreats" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#00BCD4] shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

       {/* Floating Wave Decor */}
       <div className="fixed top-1/2 left-0 -translate-x-1/2 opacity-5 pointer-events-none">
          <Waves className="w-[1200px] h-[1200px] text-[#00BCD4]" strokeWidth={0.5} />
       </div>
    </div>
  );
};

export default Login;