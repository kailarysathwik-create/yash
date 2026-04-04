import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LoaderCircle, ShieldCheck, Zap, Globe, Navigation, Building2, Phone, Link, CreditCard, ArrowRight } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Handshake, 1: Form
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    phone: '',
    website: '',
    upi_id: ''
  });

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
    }
  ];

  useEffect(() => {
    if (step < 2) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organization || !formData.phone || !formData.upi_id) {
      toast.error('Please fill all mandatory fields');
      return;
    }

    setLoading(true);
    try {
      await tripAPI.auth.onboarding(formData);
      toast.success('Protocol established. Welcome to Y.A.S.H');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Matrix connection failed. Try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 selection:bg-[#A855F7]/20">
      <div className="max-w-2xl w-full text-center">
        
        <AnimatePresence mode="wait">
          {step < 2 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-12"
            >
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
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    <div className="flex justify-center">
                      <div className="p-6 bg-white/40 rounded-[2.5rem] shadow-inner border border-white/50">
                        {step === 0 ? <ShieldCheck className="w-10 h-10 text-blue-400" /> : <Zap className="w-10 h-10 text-yellow-400" />}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight mb-4">{steps[step]?.title}</h2>
                      <p className="text-[#1a0b2e]/50 font-medium text-lg">{steps[step]?.desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full"
            >
              <div className="glass-card rounded-[4rem] p-16 border-white/50 shadow-2xl relative overflow-hidden">
                <div className="text-left mb-12">
                  <div className="w-16 h-16 bg-[#A855F7] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-[#A855F7]/20">
                    <Building2 className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-5xl font-black text-[#1a0b2e] tracking-tight mb-4">Agency Identity</h2>
                  <p className="text-[#1a0b2e]/50 font-medium text-lg">Define your presence in the travel orchestration matrix.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] ml-2">Agency Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a0b2e]/30" />
                        <input 
                           required
                           type="text" 
                           placeholder="Travel Hub Pro" 
                           className="w-full h-16 bg-white/50 border-2 border-transparent focus:border-[#A855F7]/30 rounded-[2rem] pl-16 pr-8 font-bold text-[#1a0b2e] transition-all outline-none"
                           value={formData.organization}
                           onChange={(e) => setFormData({...formData, organization: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] ml-2">Contact Number</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a0b2e]/30" />
                        <input 
                           required
                           type="tel" 
                           placeholder="+91 99999 99999" 
                           className="w-full h-16 bg-white/50 border-2 border-transparent focus:border-[#A855F7]/30 rounded-[2rem] pl-16 pr-8 font-bold text-[#1a0b2e] transition-all outline-none"
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] ml-2">Website (Optional)</label>
                    <div className="relative">
                      <Link className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a0b2e]/30" />
                      <input 
                         type="url" 
                         placeholder="https://travelhub.com" 
                         className="w-full h-16 bg-white/50 border-2 border-transparent focus:border-[#A855F7]/30 rounded-[2rem] pl-16 pr-8 font-bold text-[#1a0b2e] transition-all outline-none"
                         value={formData.website}
                         onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] ml-2">Agency UPI ID (For Collections)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a0b2e]/30" />
                      <input 
                         required
                         type="text" 
                         placeholder="agency@upi" 
                         className="w-full h-16 bg-white/80 border-2 border-[#A855F7]/20 focus:border-[#A855F7] rounded-[2rem] pl-16 pr-8 font-black text-[#A855F7] transition-all outline-none"
                         value={formData.upi_id}
                         onChange={(e) => setFormData({...formData, upi_id: e.target.value.toLowerCase()})}
                      />
                    </div>
                    <p className="text-[9px] font-bold text-[#1a0b2e]/30 ml-4">This ID will be used to generate secure QR codes for customers.</p>
                  </div>

                  <div className="pt-8">
                    <Button 
                      disabled={loading}
                      type="submit" 
                      className="w-full h-20 bg-[#1a0b2e] hover:bg-[#A855F7] text-white rounded-full font-black text-xl shadow-2xl shadow-[#A855F7]/20 transition-all group"
                    >
                      {loading ? 'Initializing...' : 'Authorize & Synchronize'}
                      {!loading && <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-12 text-[#1a0b2e]/20 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          Yatra And Stay Hub Manifest
        </motion.div>
      </div>

      {/* Decorative BG */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[800px] h-[800px] bg-[#f3e8ff] rounded-full blur-[150px] pulse-bg opacity-40" />
        <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-white rounded-full blur-[150px] animate-float opacity-30" />
      </div>
    </div>
  );
};

export default Onboarding;
