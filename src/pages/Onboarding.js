import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Globe, Waves, Sparkles, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://trip-bkak.onrender.com/';
const API = `${BACKEND_URL}/api`;

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    phone: '',
    website: '',
    upi_id: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API}/onboarding`,
        formData,
        { withCredentials: true }
      );
      toast.success('Hub Profile Synchronized!');
      setTimeout(() => navigate('/'), 2000); // Give time for the setup animation
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save hub details');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="onboarding-form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            className="max-w-2xl w-full glass-card rounded-[3rem] p-12 relative border-white/20 shadow-2xl"
          >
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl rotate-[-12deg] border border-white/20">
              <Waves className="w-10 h-10 text-[#1a0b2e]" />
            </div>

            <div className="mb-12 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
                <Sparkles className="w-3 h-3 text-[#9370DB]" /> Initializing Hub Protocol
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-4">Concierge Onboarding</h1>
              <p className="text-white/40 font-medium">Configure your hub identity for premium travel orchestration.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9370DB] flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Organization
                  </Label>
                  <Input
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="glass-input h-16"
                    placeholder="Agency or Personal Hub"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9370DB] flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Sequence
                  </Label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="glass-input h-16"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9370DB] flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Terminal URL
                  </Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="glass-input h-16"
                    placeholder="https://yourhub.com"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9370DB] flex items-center gap-2">
                    <CreditCard className="w-3 h-3" /> UPI Settlement ID
                  </Label>
                  <Input
                    required
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    className="glass-input h-16"
                    placeholder="hub@upi"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-full h-20 text-xl font-black shadow-2xl shadow-black/50 mt-8"
              >
                Authorize Hub Entry
              </Button>
            </form>

            <p className="mt-12 text-center text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">
              Yatra And Stay Hub • Secure Protocol v3.0
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="setting-up"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-white"
          >
            <div className="relative mb-12 flex justify-center">
               <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 flex items-center justify-center relative z-10 border border-white/20">
                 <Loader2 className="w-12 h-12 text-[#9370DB] animate-spin" />
               </div>
               <div className="absolute inset-0 bg-[#9370DB]/20 blur-[60px] animate-pulse rounded-full" />
            </div>
            
            <h2 className="text-5xl font-black mb-6 tracking-tighter">Setting up your hub...</h2>
            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs">Calibrating orchestration layers</p>
            
            <div className="mt-12 flex flex-col items-center gap-4">
               {['Securing Nodes', 'Fetching Assets', 'Initializing Concierge'].map((step, i) => (
                 <motion.div 
                   key={step}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + (i * 0.4) }}
                   className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10"
                 >
                   <ShieldCheck className="w-4 h-4 text-[#9370DB]" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{step}</span>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles Decor */}
      <div className="fixed bottom-0 left-10 -z-10 opacity-5">
        <Sparkles className="w-[600px] h-[600px] text-white" strokeWidth={0.5} />
      </div>
    </div>
  );
};

export default Onboarding;