import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, MapPin, Users, Calendar, IndianRupee, Globe, Plane, Train, Car, Waves, Sparkles, Navigation, History, ArrowRight, ExternalLink } from 'lucide-react';
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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await tripAPI.getTrips();
        setTrips(data || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await tripAPI.auth.logout();
      navigate('/login');
      toast.success('Logged out from Lavender Hub');
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
      toast.success('Lavender Hub Trip Initiated!');
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
    <div className="min-h-screen bg-[#F8F7FF] selection:bg-[#9370DB]/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#9370DB] rounded-2xl flex items-center justify-center shadow-lg shadow-[#9370DB]/20">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-800 tracking-tight">Yatra And Stay Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLogout}
              className="text-gray-400 hover:text-[#9370DB] font-bold text-[10px] uppercase tracking-widest"
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
        <section className="mb-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-[#9370DB]/5 to-transparent -z-10" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tighter leading-[0.85]">
              Every Journey is a <br /> <span className="text-[#9370DB]">Masterpiece.</span>
            </h1>
            <p className="text-gray-400 font-medium max-w-xl mx-auto mb-10 text-lg">
              The high-end sanctuary for personal and agency travel orchestration.
            </p>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#9370DB] text-white hover:scale-105 transition-all rounded-full px-12 py-8 text-xl font-black shadow-2xl shadow-[#9370DB]/20">
                  <Navigation className="w-6 h-6 mr-3" /> Start New Deployment
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/60 rounded-[3rem] p-10 max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-gray-800 tracking-tight mb-8">Hub Configuration</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Origin Point</Label>
                       <Input value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" placeholder="Source City" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Target Destination</Label>
                       <Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" placeholder="Hub City" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Personnel</Label>
                       <Input type="number" min="1" value={formData.num_people} onChange={(e) => setFormData({ ...formData, num_people: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold text-center" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Runtime (Days)</Label>
                       <Input type="number" min="1" max="30" value={formData.num_days} onChange={(e) => setFormData({ ...formData, num_days: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold text-center" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Credits (₹)</Label>
                       <Input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold text-center" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Transit Mode</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {['flight', 'train', 'car'].map((mode) => (
                        <button key={mode} type="button" onClick={() => setFormData({ ...formData, transport_mode: mode })}
                          className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-4 transition-all duration-300 ${
                            formData.transport_mode === mode ? 'border-[#9370DB] bg-[#9370DB]/5 text-[#9370DB] scale-105 shadow-xl' : 'border-gray-50 text-gray-300'
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
                       <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" required />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#9370DB]">Secondary Nodes</Label>
                       <Input value={formData.places_to_cover} onChange={(e) => setFormData({ ...formData, places_to_cover: e.target.value })} className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold" placeholder="Cities (comma separated)" />
                     </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-[#9370DB] text-white hover:scale-[1.02] transition-all rounded-full h-16 font-black text-lg shadow-xl shadow-[#9370DB]/20">
                    {loading ? 'Initiating Hub...' : 'Finalize Hub Parameters'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </section>

        {/* Trip History Section */}
        <section className="mt-32">
          <div className="flex items-center gap-4 mb-12">
             <div className="w-12 h-12 rounded-2xl bg-[#9370DB]/10 flex items-center justify-center">
               <History className="w-6 h-6 text-[#9370DB]" />
             </div>
             <div>
               <h2 className="text-3xl font-black text-gray-800 tracking-tight">Recent Hub Deployments</h2>
               <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">History of your orchestrated journeys</p>
             </div>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-20">
              <LoaderCircle className="w-12 h-12 animate-spin text-[#9370DB]" />
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 card-3d-wrapper">
              <AnimatePresence>
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.trip_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/trip/${trip.trip_id}`)}
                    className="card-3d glass-card rounded-[2.5rem] p-8 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#9370DB]/5 rounded-full blur-2xl group-hover:bg-[#9370DB]/10 transition-colors" />
                    
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[10px] font-black text-[#9370DB] bg-[#9370DB]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                         {trip.status}
                       </span>
                       <span className="text-[10px] font-bold text-gray-300">
                         {new Date(trip.created_at).toLocaleDateString()}
                       </span>
                    </div>

                    <h3 className="text-2xl font-black text-gray-800 mb-6 group-hover:text-[#9370DB] transition-colors">
                      {trip.details.from_location} <ArrowRight className="inline w-4 h-4 mx-2" /> {trip.details.destination}
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <Calendar className="w-4 h-4 text-[#9370DB]/40" />
                        {trip.details.start_date} • {trip.details.num_days} Days
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <Users className="w-4 h-4 text-[#9370DB]/40" />
                        {trip.details.num_people} Personnel
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between group-hover:border-[#9370DB]/20 transition-colors">
                       <div className="flex items-center gap-2">
                          <div className="bg-[#9370DB]/10 p-2 rounded-lg">
                            {trip.details.transport_mode === 'flight' && <Plane className="w-4 h-4 text-[#9370DB]" />}
                            {trip.details.transport_mode === 'train' && <Train className="w-4 h-4 text-[#9370DB]" />}
                            {trip.details.transport_mode === 'car' && <Car className="w-4 h-4 text-[#9370DB]" />}
                          </div>
                          <span className="text-[10px] font-black uppercase text-gray-400">{trip.details.transport_mode}</span>
                       </div>
                       <ExternalLink className="w-4 h-4 text-[#9370DB] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-32 glass rounded-[3rem] border-dashed border-2 border-[#9370DB]/10">
              <History className="w-16 h-16 text-[#9370DB]/10 mx-auto mb-6" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No deployments detected in Hub archive</p>
            </div>
          )}
        </section>
      </main>

      {/* Floating Sparkles Detail */}
      <div className="fixed bottom-10 right-10 -z-50 opacity-10">
        <Sparkles className="w-[800px] h-[800px] text-[#9370DB]" strokeWidth={0.5} />
      </div>
    </div>
  );
};

const LoaderCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Dashboard;