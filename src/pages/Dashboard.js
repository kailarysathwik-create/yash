import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plane, Train, Car, Navigation, Sparkles, Waves } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    from_location: '',
    destination: '',
    num_people: 1,
    budget: '',
    num_days: 3,
    transport_mode: 'flight',
    start_date: '',
    places_to_cover: '',
    preferences: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        num_people: parseInt(formData.num_people),
        num_days: parseInt(formData.num_days),
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      const result = await tripAPI.createTrip(payload);
      toast.success('Yatra And Stay Hub Deployment Initiated!');
      setShowDialog(false);
      navigate(`/trip/${result.trip_id}`);
    } catch (error) {
      console.error('Trip creation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to initiate deployment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-[#A855F7]/20 pb-32">
      {/* Brand Header */}
      <header className="px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              transition={{ duration: 0.8 }}
              className="w-16 h-16 flex items-center justify-center shrink-0"
            >
              <img src="/logo.png" alt="Y.A.S.H Logo" className="w-full h-full object-cover scale-[1.15]" />
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 glass rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a0b2e]/40">Hub Operational</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Deployment Area */}
        <section className="py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 glass rounded-full mb-10 border border-[#A855F7]/20">
              <Sparkles className="w-4 h-4 text-[#A855F7]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A855F7]">Premium Orchestration</span>
            </div>

            <h1 className="text-6xl md:text-[8rem] font-black text-[#1a0b2e] mb-10 tracking-tighter leading-[0.85]">
              Y.A.S.H <br /> <span className="glass-text">Platform</span>
            </h1>

            <p className="text-[#1a0b2e]/50 font-medium max-w-xl mx-auto mb-16 text-xl leading-relaxed">
              Experience the pinnacle of travel agency orchestration. Airy, bright, and perfectly curated for the elite explorer.
            </p>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full px-16 py-10 text-xl font-black shadow-2xl shadow-[#A855F7]/20 group">
                  <Navigation className="w-6 h-6 mr-4 group-hover:rotate-45 transition-transform" />
                  Begin New Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[3.5rem] p-12 max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_8px_60px_-10px_rgba(168,85,247,0.15),0_0_0_1px_rgba(255,255,255,0.6),inset_0_1px_0_rgba(255,255,255,0.8)] before:absolute before:inset-0 before:rounded-[3.5rem] before:bg-gradient-to-br before:from-pink-200/10 before:via-transparent before:to-purple-200/10 before:pointer-events-none">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-[#1a0b2e] tracking-tight mb-10">New Trip</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A855F7]/60">Start</Label>
                      <Input value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} className="glass-input h-16 px-6 font-bold placeholder:text-[#A855F7]/30 placeholder:font-medium" placeholder="Departure City" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A855F7]/60">Destination</Label>
                      <Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="glass-input h-16 px-6 font-bold placeholder:text-[#A855F7]/30 placeholder:font-medium" placeholder="Destination City" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-3 text-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]/60">persons</Label>
                      <Input type="number" min="1" value={formData.num_people} onChange={(e) => setFormData({ ...formData, num_people: e.target.value })} className="glass-input h-16 text-center text-xl font-black" required />
                    </div>
                    <div className="space-y-3 text-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]/60">No.Of Days</Label>
                      <Input type="number" min="1" max="30" value={formData.num_days} onChange={(e) => setFormData({ ...formData, num_days: e.target.value })} className="glass-input h-16 text-center text-xl font-black" required />
                    </div>
                    <div className="space-y-3 text-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]/60">Budget</Label>
                      <Input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="glass-input h-16 text-center text-xl font-black" placeholder="-" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A855F7]/60">Transport</Label>
                    <div className="grid grid-cols-3 gap-6">
                      {['flight', 'train', 'car'].map((mode) => (
                        <button key={mode} type="button" onClick={() => setFormData({ ...formData, transport_mode: mode })}
                          className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-700 ${formData.transport_mode === mode ? 'border-[#A855F7] glass text-[#1a0b2e] scale-105 shadow-2xl shadow-[#A855F7]/20' : 'border-white/20 hover:border-[#A855F7]/30 text-[#1a0b2e]/20'
                            }`}
                        >
                          {mode === 'flight' && <Plane className="w-8 h-8" />}
                          {mode === 'train' && <Train className="w-8 h-8" />}
                          {mode === 'car' && <Car className="w-8 h-8" />}
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{mode === 'car' ? 'Ground' : mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A855F7]/60">Start Date</Label>
                      <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="glass-input h-16 px-6 font-bold text-[#A855F7]/70" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A855F7]/60">Places To Cover</Label>
                      <Input value={formData.places_to_cover} onChange={(e) => setFormData({ ...formData, places_to_cover: e.target.value })} className="glass-input h-16 px-6 font-bold placeholder:text-[#A855F7]/30 placeholder:font-medium" placeholder="Optional cities" />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-[1.02] transition-all duration-700 rounded-full h-20 font-black text-xl shadow-2xl shadow-[#1a0b2e]/20">
                    {loading ? 'Initiating Hub Sync...' : 'Confirm Vector Parameters'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </section>
      </main>

      {/* Decorative BG - Airy & Bright */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[5%] w-[800px] h-[800px] bg-[#f3e8ff] rounded-full blur-[150px] pulse-bg opacity-40" />
        <div className="absolute bottom-[5%] left-[5%] w-[700px] h-[700px] bg-white rounded-full blur-[150px] animate-float opacity-30" />
      </div>
    </div>
  );
};

export default Dashboard;
