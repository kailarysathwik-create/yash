import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LoaderCircle, ShieldCheck, Zap, Globe, Navigation } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    { 
      title: "Handshake Protocol", 
      desc: "Synchronizing with Yatra And Stay Hub secure terminal...", 
      icon: ShieldCheck,
      color: "text-blue-400"
    },
    { 
      title: "Matrix Initialization", 
      desc: "Allocating premium orchestration resources...", 
      icon: Zap,
      color: "text-yellow-400"
    },
    { 
      title: "Global Node Sync", 
      desc: "Connecting to 128+ verified Hub terminals...", 
      icon: Globe,
      color: "text-green-400"
    },
    { 
      title: "Protocol Ready", 
      desc: "Welcome to the elite sanctuary of travel.", 
      icon: Navigation,
      color: "text-[#A855F7]"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev === steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => navigate('/dashboard'), 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [navigate, steps.length]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 selection:bg-[#A855F7]/20">
      <div className="max-w-xl w-full text-center">
        <div className="mb-16 relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border-4 border-dashed border-[#A855F7]/20 rounded-full mx-auto flex items-center justify-center"
          >
            <div className="w-24 h-24 border-4 border-dashed border-[#A855F7]/40 rounded-full flex items-center justify-center">
               <LoaderCircle className="w-12 h-12 text-[#A855F7] animate-spin" />
            </div>
          </motion.div>
          <div className="absolute inset-0 blur-3xl bg-[#A855F7]/10 rounded-full -z-10" />
        </div>

        <div className="glass-card rounded-[3.5rem] p-12 relative overflow-hidden border-white/50 shadow-[0_50px_100px_-20px_rgba(147,112,219,0.15)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                 <div className="p-6 bg-white/40 rounded-[2.5rem] shadow-inner border border-white/50">
                    {React.createElement(steps[step].icon, { className: `w-10 h-10 ${steps[step].color}` })}
                 </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7] mb-4">Step {step + 1} of 4</p>
                <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight mb-4">{steps[step].title}</h2>
                <p className="text-[#1a0b2e]/50 font-medium text-lg leading-relaxed">{steps[step].desc}</p>
              </div>

              {/* Progress track */}
              <div className="flex gap-3 justify-center pt-6">
                {steps.map((_, i) => (
                  <motion.div 
                    key={i}
                    className="h-1.5 rounded-full bg-[#1a0b2e]/5 overflow-hidden"
                    style={{ width: i === step ? '48px' : '16px' }}
                    animate={{ width: i === step ? '48px' : '16px', backgroundColor: i <= step ? '#A855F7' : 'rgba(0,0,0,0.05)' }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Sparkles className="w-6 h-6 text-[#A855F7]" />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-[#1a0b2e]/20 text-[10px] font-black uppercase tracking-[0.3em]"
        >
           Yatra And Stay Hub Orchestration Protocol v3.0
        </motion.div>
      </div>

      {/* Decorative BG - Airy Bright */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[800px] h-[800px] bg-[#f3e8ff] rounded-full blur-[150px] pulse-bg opacity-40" />
        <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-white rounded-full blur-[150px] animate-float opacity-30" />
      </div>
    </div>
  );
};

export default Onboarding;
