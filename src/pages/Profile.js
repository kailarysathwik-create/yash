import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Building, Phone, Globe, CreditCard, Save, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';
import { toast } from 'sonner';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    phone: '',
    website: '',
    upi_id: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await tripAPI.auth.getMe();
        setUser(data);
        setFormData({
          organization: data.organization || '',
          phone: data.phone || '',
          website: data.website || '',
          upi_id: data.upi_id || ''
        });
      } catch (err) {
        toast.error('Failed to sync agency identity');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await tripAPI.auth.updateProfile(formData);
      toast.success('Agency Matrix Updated');
    } catch (err) {
      toast.error('Update failed. Verify your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoaderCircle className="w-12 h-12 text-[#A855F7] animate-spin" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-20 pb-40"
    >
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center">
            <Shield className="text-[#A855F7] w-6 h-6" />
          </div>
          <h1 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Agency Command Center</h1>
        </div>
        <p className="text-[#1a0b2e]/50 font-bold max-w-2xl">
          Manage your organization's metadata and financial vectors. These details are used to brand your manifests and settle credits.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Identity Block */}
        <section className="glass-card rounded-[3rem] p-10 border-white/50 shadow-xl">
           <div className="flex items-center gap-3 mb-8">
             <Building className="w-5 h-5 text-[#A855F7]" />
             <h2 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest">Agency Identity</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-[#1a0b2e]/40 ml-2">Official Email (Locked)</label>
               <div className="w-full bg-[#1a0b2e]/5 border border-white/50 text-[#1a0b2e]/30 rounded-2xl h-16 px-6 flex items-center font-black">
                 {user?.email}
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-[#A855F7] ml-2">Organization Name</label>
               <input
                 type="text"
                 className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-2xl h-16 px-6 font-black focus:border-[#A855F7] transition-all"
                 value={formData.organization}
                 onChange={(e) => setFormData({...formData, organization: e.target.value})}
                 placeholder="Y.A.S.H Global"
               />
             </div>
           </div>
        </section>

        {/* Contact Vector Section */}
        <section className="glass-card rounded-[3rem] p-10 border-white/50 shadow-xl">
           <div className="flex items-center gap-3 mb-8">
             <Phone className="w-5 h-5 text-[#A855F7]" />
             <h2 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest">Global Reach</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-[#A855F7] ml-2">Support Phone</label>
               <input
                 type="text"
                 className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-2xl h-16 px-6 font-black"
                 value={formData.phone}
                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
                 placeholder="+91 XXXX"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-[#A855F7] ml-2">Official Website</label>
               <div className="relative">
                 <input
                   type="text"
                   className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-2xl h-16 pl-14 px-6 font-black"
                   value={formData.website}
                   onChange={(e) => setFormData({...formData, website: e.target.value})}
                   placeholder="agency.com"
                 />
                 <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a0b2e]/20" />
               </div>
             </div>
           </div>
        </section>

        {/* Settlement Hub */}
        <section className="glass-card rounded-[3rem] p-10 border-[#A855F7]/20 border-2 shadow-2xl shadow-[#A855F7]/5">
           <div className="flex items-center gap-3 mb-8">
             <CreditCard className="w-5 h-5 text-[#A855F7]" />
             <h2 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest">Financial Settlement</h2>
           </div>
           
           <div className="space-y-2 max-w-md">
             <label className="text-[10px] font-black uppercase text-[#A855F7] ml-2">Recipient UPI ID</label>
             <input
               type="text"
               className="w-full bg-[#A855F7]/5 border border-[#A855F7]/20 text-[#1a0b2e] rounded-2xl h-16 px-6 font-black"
               value={formData.upi_id}
               onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
               placeholder="agency@upi"
             />
             <p className="text-[9px] font-bold text-[#1a0b2e]/30 mt-2 px-2 italic">
               * This UPI ID will be used to generate dynamic QR codes for client payments.
             </p>
           </div>
        </section>

        <div className="flex justify-start pt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-20 px-12 font-black text-xl flex items-center gap-4 shadow-2xl shadow-[#A855F7]/20 disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-6 h-6" /> Save Matrix
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
