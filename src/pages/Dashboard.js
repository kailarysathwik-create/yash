import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, MapPin, Users, Calendar, IndianRupee, Globe, Plane, Train, Car, Waves, Sparkles, Navigation } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI';

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

  const handleLogout = async () => {
    try {
      await tripAPI.auth.logout();
      navigate('/login');
      toast.success('Logged out from Hub');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

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
      toast.success('Hub Trip Initiated!');
      setShowDialog(false);
      navigate(`/trip/${result.trip_id}`);
    } catch (error) {
      console.error('Trip creation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00BCD4] rounded-xl flex items-center justify-center shadow-lg shadow-[#00BCD4]/20 animate-pulse">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">Yatra And Stay Hub</span>
          </div>
          <Button
            onClick={handleLogout}
            className="text-gray-400 hover:text-[#00BCD4] font-bold text-xs uppercase tracking-widest"
            variant="ghost"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#00BCD4]/5 to-transparent -z-10" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BCD4]/10 rounded-full text-[#00BCD4] text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Sparkles className="w-3 h-3" /> AI-Powered Travel Engine
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9]">
              Your Next <span className="text-[#00BCD4]">Great Story</span> 
              <br /> Starts Here
            </h1>
            
            <p className="text-gray-400 font-medium max-w-xl mx-auto mb-12 text-lg">
              Design intelligent, custom itineraries in seconds. <br/> The complete hub for your travel aspirations.
            </p>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#00BCD4] text-white hover:scale-105 transition-all rounded-full px-12 py-8 text-xl font-black shadow-2xl shadow-[#00BCD4]/30 hover:shadow-[#00BCD4]/50">
                  <Navigation className="w-6 h-6 mr-3" /> Initiate Hub Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/60 rounded-[3rem] p-10 max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-gray-800 tracking-tight">Hub Parameters</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8 mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Departure</Label>
                       <Input value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" placeholder="Source City" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Destination</Label>
                       <Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" placeholder="Target Hub" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Tourists</Label>
                       <Input type="number" min="1" value={formData.num_people} onChange={(e) => setFormData({ ...formData, num_people: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold text-center" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Duration</Label>
                       <Input type="number" min="1" max="30" value={formData.num_days} onChange={(e) => setFormData({ ...formData, num_days: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold text-center" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Budget (₹)</Label>
                       <Input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold text-center" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Transport Access</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {['flight', 'train', 'car'].map((mode) => (
                        <button key={mode} type="button" onClick={() => setFormData({ ...formData, transport_mode: mode })}
                          className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-4 transition-all duration-300 ${
                            formData.transport_mode === mode ? 'border-[#00BCD4] bg-[#00BCD4]/5 text-[#00BCD4] scale-105' : 'border-gray-50 text-gray-300 hover:border-gray-100'
                          }`}
                        >
                          {mode === 'flight' && <Plane className="w-6 h-6" />}
                          {mode === 'train' && <Train className="w-6 h-6" />}
                          {mode === 'car' && <Car className="w-6 h-6" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{mode === 'car' ? 'Cab' : mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Deployment Date</Label>
                       <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" required />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Optional En Route</Label>
                       <Input value={formData.places_to_cover} onChange={(e) => setFormData({ ...formData, places_to_cover: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" placeholder="Cities separated by comma" />
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#00BCD4]">Hub Preferences</Label>
                    <Textarea value={formData.preferences} onChange={(e) => setFormData({ ...formData, preferences: e.target.value })} className="bg-white/50 border-gray-100 rounded-3xl min-h-[100px] font-medium" placeholder="E.g. Adventure, Relaxed, Historical..." />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-[#00BCD4] text-white hover:scale-105 transition-all rounded-full h-16 font-black text-lg shadow-xl shadow-[#00BCD4]/20">
                    {loading ? 'Initiating...' : 'Generate Hub Concept'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* 3D Features Section */}
      <section className="py-24 px-4 card-3d-wrapper">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: 'Hub Routing AI', desc: 'Automatically finds the nearest major transit hub for remote areas.', icon: <Navigation className="w-8 h-8"/> },
            { title: 'Interactive 3D Planning', desc: 'Visualize your journey with ultra-modern 3D UI cards.', icon: <Waves className="w-8 h-8"/> },
            { title: 'Concierge Verification', desc: 'Secure your PNR and Hotel details in one synced hub.', icon: <Sparkles className="w-8 h-8"/> }
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card-3d glass-card p-10 rounded-[3rem] border-white/60 hover:border-[#00BCD4]/20 transition-all cursor-default"
            >
              <div className="w-14 h-14 bg-[#00BCD4]/10 rounded-2xl flex items-center justify-center text-[#00BCD4] mb-8">
                {f.icon}
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-4 tracking-tight">{f.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Background Decor */}
      <div className="fixed top-0 right-0 -z-50 opacity-10">
         <Waves className="w-[1000px] h-[1000px] text-[#00BCD4]" strokeWidth={0.5} />
      </div>
    </div>
  );
};

export default Dashboard;