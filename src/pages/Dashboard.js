import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, MapPin, Users, Calendar, IndianRupee, Globe, Plane, Train, Car, Waves, Sparkles, Navigation, History, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      console.log('Hub: Fetching trip archives...');
      const data = await tripAPI.getTrips();
      console.log('Hub: Archive payload received:', data);
      
      // Ensure data is an array
      const tripsArray = Array.isArray(data) ? data : (data?.trips || []);
      setTrips(tripsArray);
      
      if (tripsArray.length === 0) {
        console.warn('Hub: No trip history found for this operative.');
      }
    } catch (error) {
      console.error('Hub: Archive retrieval failed:', error);
      toast.error('Failed to access trip archives');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await tripAPI.auth.logout();
      navigate('/login');
      toast.success('Logged out from Purple Hub');
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
      toast.success('Purple Hub Deployment Initiated!');
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
    <div className="min-h-screen selection:bg-white/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"
            >
              <Waves className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-black text-white tracking-tight">Yatra And Stay Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLogout}
              className="text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest"
              variant="ghost"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <section className="mb-20 text-center relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#9370DB]/5 blur-[120px] rounded-full -z-10 animate-pulse" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-[7rem] font-black text-white mb-8 tracking-tighter leading-[0.85]">
              Every Journey is a <br /> <span className="text-white/40 glass-text">Masterpiece.</span>
            </h1>
            <p className="text-white/60 font-medium max-w-xl mx-auto mb-12 text-lg">
              The premium sanctuary for high-end travel orchestration and agency operations.
            </p>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-105 transition-all duration-500 rounded-full px-12 py-9 text-xl font-black shadow-2xl shadow-black/50">
                  <Navigation className="w-6 h-6 mr-3" /> Start New Deployment
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20 rounded-[3rem] p-10 max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar text-white">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-white tracking-tight mb-8">Hub Parameters</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Origin Point</Label>
                       <Input value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} className="glass-input h-14" placeholder="Source City" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Target Destination</Label>
                       <Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="glass-input h-14" placeholder="Hub City" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Personnel</Label>
                       <Input type="number" min="1" value={formData.num_people} onChange={(e) => setFormData({ ...formData, num_people: e.target.value })} className="glass-input h-14 text-center" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Runtime (Days)</Label>
                       <Input type="number" min="1" max="30" value={formData.num_days} onChange={(e) => setFormData({ ...formData, num_days: e.target.value })} className="glass-input h-14 text-center" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Credits (₹)</Label>
                       <Input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="glass-input h-14 text-center" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Transit Mode</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {['flight', 'train', 'car'].map((mode) => (
                        <button key={mode} type="button" onClick={() => setFormData({ ...formData, transport_mode: mode })}
                          className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                            formData.transport_mode === mode ? 'border-[#9370DB] bg-white/10 text-white scale-105 shadow-xl shadow-[#9370DB]/20' : 'border-white/5 text-white/20 hover:border-white/20'
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
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Commencement</Label>
                       <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="glass-input h-14" required />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Secondary Nodes</Label>
                       <Input value={formData.places_to_cover} onChange={(e) => setFormData({ ...formData, places_to_cover: e.target.value })} className="glass-input h-14" placeholder="Cities (comma separated)" />
                     </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-full h-16 font-black text-lg shadow-xl shadow-black/50">
                    {loading ? 'Initiating Hub...' : 'Finalize Hub Parameters'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </section>

        {/* Trip History Section */}
        <section className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                 <History className="w-6 h-6 text-[#9370DB]" />
               </div>
               <div>
                 <h2 className="text-3xl font-black text-white tracking-tight">Recent Hub Deployments</h2>
                 <p className="text-white/40 text-sm font-medium uppercase tracking-widest">History of your orchestrated journeys</p>
               </div>
            </div>
            <Button onClick={fetchHistory} variant="ghost" className="text-white/40 hover:text-white">
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingHistory ? 'animate-spin' : ''}`} />
              Sync Archive
            </Button>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-32">
              <div className="relative">
                <LoaderCircle className="w-16 h-16 animate-spin text-[#9370DB]" />
                <div className="absolute inset-0 blur-xl bg-[#9370DB]/20 rounded-full" />
              </div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 card-3d-wrapper">
              <AnimatePresence>
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.trip_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    onClick={() => navigate(`/trip/${trip.trip_id}`)}
                    className="card-3d glass-card rounded-[2.5rem] p-8 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#9370DB]/10 rounded-full blur-[80px] group-hover:bg-[#9370DB]/20 transition-all duration-700" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                       <span className="text-[9px] font-black text-white bg-white/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-white/10 group-hover:border-[#9370DB]/50 transition-colors">
                         {trip.status}
                       </span>
                       <span className="text-[10px] font-bold text-white/30 group-hover:text-white/60 transition-colors">
                         {new Date(trip.created_at).toLocaleDateString()}
                       </span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-6 group-hover:text-[#9370DB] transition-all duration-500 relative z-10 leading-tight">
                      {trip.details.from_location} <ArrowRight className="inline w-4 h-4 mx-2 opacity-30" /> {trip.details.destination}
                    </h3>

                    <div className="space-y-4 mb-8 relative z-10">
                      <div className="flex items-center gap-3 text-xs font-bold text-white/40 group-hover:text-white/70 transition-colors">
                        <Calendar className="w-4 h-4 text-[#9370DB]" />
                        {trip.details.start_date} • {trip.details.num_days} Days
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-white/40 group-hover:text-white/70 transition-colors">
                        <Users className="w-4 h-4 text-[#9370DB]" />
                        {trip.details.num_people} Personnel
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-white/20 transition-all duration-500 relative z-10">
                       <div className="flex items-center gap-2">
                          <div className="bg-white/5 p-2 rounded-xl group-hover:bg-[#9370DB]/20 transition-colors">
                            {trip.details.transport_mode === 'flight' && <Plane className="w-4 h-4 text-[#9370DB]" />}
                            {trip.details.transport_mode === 'train' && <Train className="w-4 h-4 text-[#9370DB]" />}
                            {trip.details.transport_mode === 'car' && <Car className="w-4 h-4 text-[#9370DB]" />}
                          </div>
                          <span className="text-[10px] font-black uppercase text-white/20 group-hover:text-white/60 tracking-widest">{trip.details.transport_mode}</span>
                       </div>
                       <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#9370DB] group-hover:border-[#9370DB] transition-all duration-500">
                         <ExternalLink className="w-4 h-4 text-white" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-2 border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[#9370DB]/5 animate-pulse" />
              <History className="w-20 h-20 text-white/5 mx-auto mb-8 relative z-10" />
              <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] mb-4 relative z-10">Archive Empty</p>
              <p className="text-white/10 font-bold max-w-xs mx-auto relative z-10 italic">No deployments detected in Hub archive. Initiate your first journey above.</p>
            </div>
          )}
        </section>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[#9370DB]/10 rounded-full blur-[120px] pulse-bg" />
        <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] animate-float" />
      </div>
    </div>
  );
};

const LoaderCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Dashboard;