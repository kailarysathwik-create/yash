import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Globe, Waves, Sparkles, CreditCard } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    phone: '',
    website: '',
    upi_id: ''
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

      toast.success('Hub Profile Created!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete hub profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12 relative overflow-hidden font-['Outfit']">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00BCD4]/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <div className="glass-card rounded-[3rem] p-10 md:p-14 border-white/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 p-6 opacity-10">
            <Waves className="w-20 h-20 text-[#00BCD4]" />
          </div>

          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00BCD4]/10 rounded-full text-[#00BCD4] text-[9px] font-black uppercase tracking-widest mb-4">
               <Sparkles className="w-3 h-3" /> Initializing Hub Access
             </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight mb-3">
              Define Your Hub
            </h2>
            <p className="text-sm font-medium text-gray-400">
              Setup your organization to begin smart itinerary planning.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Organization
                  </div>
                </Label>
                <Input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold"
                  placeholder="Yatra Hub Name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Hub Number
                  </div>
                </Label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold"
                  placeholder="+91"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Hub URL <span className="text-gray-300 ml-1">(Optional)</span>
                </div>
              </Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold"
                placeholder="https://yash-hub.com"
              />
            </div>

            <div className="pt-8 border-t border-gray-50 bg-[#00BCD4]/5 -mx-10 md:-mx-14 px-10 md:px-14 pb-10">
              <div className="flex items-center gap-3 mb-6">
                 <CreditCard className="w-5 h-5 text-[#00BCD4]" />
                 <h3 className="text-lg font-black text-gray-800 tracking-tight">Access Payments</h3>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">
                  UPI Hub ID
                </Label>
                <Input
                  type="text"
                  required
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  className="bg-white/80 border-gray-100 h-14 rounded-2xl font-bold focus:border-[#00BCD4] shadow-sm"
                  placeholder="hub@upi"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00BCD4] text-white hover:scale-[1.02] transition-all rounded-full h-16 font-black text-lg shadow-xl shadow-[#00BCD4]/20"
            >
              {loading ? 'Processing Hub...' : 'Complete Hub Setup'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;