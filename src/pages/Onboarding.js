import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Globe, Waves, Sparkles, CreditCard } from 'lucide-react';
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
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save hub details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background Decor */}
       <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9370DB]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E6E6FA]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass-card rounded-[3rem] p-12 border-white/60 shadow-2xl relative"
      >
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-[#9370DB] rounded-3xl flex items-center justify-center shadow-2xl rotate-[-12deg]">
          <Waves className="w-10 h-10 text-white" />
        </div>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9370DB]/10 rounded-full text-[#9370DB] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles className="w-3 h-3" /> Initializing Hub Protocol
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Concierge Onboarding</h1>
          <p className="text-gray-400 font-medium">Configure your hub identity for premium orchestration.</p>
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
                className="bg-white/80 border-gray-100 h-16 rounded-2xl font-bold focus:border-[#9370DB] shadow-sm"
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
                className="bg-white/80 border-gray-100 h-16 rounded-2xl font-bold focus:border-[#9370DB] shadow-sm"
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
                className="bg-white/80 border-gray-100 h-16 rounded-2xl font-bold focus:border-[#9370DB] shadow-sm"
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
                className="bg-white/80 border-gray-100 h-16 rounded-2xl font-bold focus:border-[#9370DB] shadow-sm"
                placeholder="hub@upi"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9370DB] text-white hover:scale-[1.02] transition-all rounded-full h-20 text-xl font-black shadow-2xl shadow-[#9370DB]/20 mt-8"
          >
            {loading ? 'Synchronizing...' : 'Authorize Hub Entry'}
          </Button>
        </form>

        <p className="mt-12 text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.4em]">
          Yatra And Stay Hub • Secure Protocol v3.0
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;