import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plane, Train, Car, Navigation, Sparkles, Waves, MapPin, LoaderCircle } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';
import { indiaData } from '../utils/indiaData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [masterData, setMasterData] = useState({ agencies: [], stats: {} });

  // Master Identity Engine
  const isMaster = user?.is_master || user?.email?.toLowerCase() === 'middlemen1245@gmail.com';
  const theme = {
    bg: isMaster ? 'bg-[#0a0a0a]' : 'bg-[#f8f9fa]',
    accent: isMaster ? '#ef4444' : '#A855F7',
    text: isMaster ? 'text-white' : 'text-[#1a0b2e]',
    subtext: isMaster ? 'text-gray-400' : 'text-[#1a0b2e]/40',
    card: isMaster ? 'bg-zinc-900/40 border-red-500/10' : 'bg-white/60 border-white/50',
    btn: isMaster ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-[#1a0b2e] hover:bg-[#A855F7]'
  };

  React.useEffect(() => {
    const init = async () => {
      try {
        const u = await tripAPI.auth.getMe();
        setUser(u);
        if (u?.email === 'middlemen1245@gmail.com') {
          const mData = await tripAPI.getMasterDashboard();
          setMasterData(mData);
        }
      } catch (err) {
        console.error("Identity Matrix Malfunction:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const [formData, setFormData] = useState({
    from_state: '',
    from_location: '',
    dest_state: '',
    destination: '',
    num_people: 1,
    budget: '',
    num_days: 3,
    transport_mode: 'flight',
    start_date: '',
    places_to_cover: '',
    preferences: ''
  });

  const states = Object.keys(indiaData).sort();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { from_state, dest_state, ...restData } = formData;
      const payload = {
        ...restData,
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <LoaderCircle className="w-12 h-12 text-[#A855F7] animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} selection:bg-red-500/20 transition-all duration-1000`}>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {isMaster ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
            {/* Master Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl">
                <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-3">Global Agency Fleet</p>
                <p className="text-5xl font-black text-white italic">{masterData.agencies?.length || 0}</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl">
                <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-3">Global Missions</p>
                <p className="text-5xl font-black text-white italic">
                  {Object.values(masterData.stats || {}).reduce((acc, s) => acc + (s.total || 0), 0)}
                </p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl">
                <p className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-3">Settled Operations</p>
                <p className="text-5xl font-black text-white italic text-green-500">
                  {Object.values(masterData.stats || {}).reduce((acc, s) => acc + (s.completed || 0), 0)}
                </p>
              </div>
            </div>

            {/* Master Access Control Matrix */}
            <div className="rounded-[3.5rem] overflow-hidden border border-white/10 shadow-3xl bg-zinc-900/30">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Agency Identification</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Operations</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Access Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {masterData.agencies?.map((agency) => (
                    <tr key={agency.user_id} className="hover:bg-white/5 transition-colors">
                      <td className="p-8">
                        <div>
                          <p className="font-black text-white text-lg">{agency.organization || 'Independent'}</p>
                          <p className="text-xs font-bold text-gray-400">{agency.email}</p>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex gap-6">
                          <div><p className="text-[9px] font-black uppercase text-gray-500">Missions</p><p className="font-black text-white">{masterData.stats?.[agency.user_id]?.total || 0}</p></div>
                          <div className="w-[1px] h-6 bg-white/10 self-center" />
                          <div><p className="text-[9px] font-black uppercase text-green-500">Settled</p><p className="font-black text-green-500">{masterData.stats?.[agency.user_id]?.completed || 0}</p></div>
                        </div>
                      </td>
                      <td className="p-8">
                        <Button
                          onClick={async () => {
                            const res = await tripAPI.toggleAgency(agency.user_id);
                            toast.success(`Protocol ${res.is_active ? 'Authorized' : 'Revoked'}`);
                            const newData = await tripAPI.getMasterDashboard();
                            setMasterData(newData);
                          }}
                          className={`h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest ${agency.is_active !== false ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-green-600 hover:bg-green-700'} text-white transition-all hover:scale-105`}
                        >
                          {agency.is_active !== false ? 'Revoke Access' : 'Restore Access'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <section className="py-20 text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <div className="inline-flex items-center gap-2 px-6 py-2 glass rounded-full mb-10 border border-[#A855F7]/20">
                <Sparkles className="w-4 h-4 text-[#A855F7]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A855F7]">OG Agency Platform</span>
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black text-[#1a0b2e] mb-10 tracking-tighter leading-none">
                Y.A.S.H <br /> <span className="glass-text italic">Premium</span>
              </h1>
              <p className="text-[#1a0b2e]/50 font-medium max-w-xl mx-auto mb-16 text-xl leading-relaxed">Experience the pinnacle of travel agency orchestration. Airy, bright, and perfectly curated.</p>

              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-24 px-16 text-2xl font-black shadow-2xl shadow-[#A855F7]/20 group">
                    <Navigation className="w-8 h-8 mr-4 group-hover:rotate-45 transition-transform" />
                    Begin New Mission
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/90 backdrop-blur-3xl border border-white/60 rounded-[4rem] p-12 max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-3xl">
                  <DialogTitle className="text-5xl font-black text-[#1a0b2e] tracking-tighter mb-12">Mission Initializer</DialogTitle>
                  <DialogDescription className="sr-only">Enter mission parameters to initialize the blueprint.</DialogDescription>
                  <form onSubmit={handleSubmit} className="space-y-12 pb-12">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Deployment Origin</Label>
                        <select value={formData.from_state} onChange={(e) => setFormData({ ...formData, from_state: e.target.value, from_location: '' })} className="glass-input h-16 px-6 font-bold w-full bg-white/20 rounded-2xl border-none outline-none appearance-none" required><option value="">Select State</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </div>
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Vector Origin</Label>
                        <select value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} className="glass-input h-16 px-6 font-bold w-full bg-white/20 rounded-2xl border-none outline-none appearance-none disabled:opacity-20" disabled={!formData.from_state} required><option value="">Select City</option>{formData.from_state && indiaData[formData.from_state].map(c => <option key={c} value={c}>{c}</option>)}</select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Target Destination</Label>
                        <select value={formData.dest_state} onChange={(e) => setFormData({ ...formData, dest_state: e.target.value, destination: '' })} className="glass-input h-16 px-6 font-bold w-full bg-white/20 rounded-2xl border-none outline-none appearance-none" required><option value="">Select State</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </div>
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Vector Destination</Label>
                        <select value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="glass-input h-16 px-6 font-bold w-full bg-white/20 rounded-2xl border-none outline-none appearance-none disabled:opacity-20" disabled={!formData.dest_state} required><option value="">Select City</option>{formData.dest_state && indiaData[formData.dest_state].map(c => <option key={c} value={c}>{c}</option>)}</select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-4 text-center"><Label className="text-[10px] font-black uppercase text-[#A855F7]">Personnel Units</Label><Input type="number" min="1" value={formData.num_people} onChange={(e) => setFormData({ ...formData, num_people: e.target.value })} className="glass-input h-16 text-center text-xl font-black bg-white/20 border-none rounded-2xl" required /></div>
                      <div className="space-y-4 text-center"><Label className="text-[10px] font-black uppercase text-[#A855F7]">Mission Duration</Label><Input type="number" min="1" value={formData.num_days} onChange={(e) => setFormData({ ...formData, num_days: e.target.value })} className="glass-input h-16 text-center text-xl font-black bg-white/20 border-none rounded-2xl" required /></div>
                      <div className="space-y-4 text-center"><Label className="text-[10px] font-black uppercase text-[#A855F7]">Credit Budget</Label><Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="glass-input h-16 text-center text-xl font-black bg-white/20 border-none rounded-2xl" placeholder="-" /></div>
                    </div>
                    <div className="space-y-6">
                      <Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Transit Vector</Label>
                      <div className="grid grid-cols-3 gap-6">
                        {['flight', 'train', 'car'].map((mode) => (
                          <button key={mode} type="button" onClick={() => setFormData({ ...formData, transport_mode: mode })} className={`flex flex-col items-center gap-4 p-8 rounded-[3rem] border-2 transition-all duration-700 ${formData.transport_mode === mode ? 'border-[#A855F7] bg-[#A855F7]/5 text-[#1a0b2e] scale-105 shadow-2xl shadow-[#A855F7]/10' : 'border-black/5 text-gray-300'}`} >
                            {mode === 'flight' && <Plane className="w-10 h-10" />}
                            {mode === 'train' && <Train className="w-10 h-10" />}
                            {mode === 'car' && <Car className="w-10 h-10" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{mode === 'car' ? 'Ground' : mode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Commencement Date</Label><Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="glass-input h-16 px-6 font-bold bg-white/20 border-none rounded-2xl" required /></div>
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-[#A855F7] ml-4">Visual Localities</Label><Input value={formData.places_to_cover} onChange={(e) => setFormData({ ...formData, places_to_cover: e.target.value })} className="glass-input h-16 px-6 font-bold bg-white/20 border-none rounded-2xl" placeholder="Optional" /></div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-[#1a0b2e] text-white hover:bg-[#A855F7] transition-all duration-700 rounded-full h-24 font-black text-2xl shadow-2xl">
                      {loading ? 'Initializing Hub Sync...' : 'Confirm Mission Blueprint'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>
          </section>
        )}
      </main>

      {/* Dynamic Background Blurs */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden transition-all duration-1000">
        <div className={`absolute top-[10%] right-[5%] w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ${isMaster ? 'bg-red-900/10' : 'bg-[#f3e8ff] pulse-bg opacity-40'}`} />
        <div className={`absolute bottom-[5%] left-[5%] w-[700px] h-[700px] rounded-full blur-[150px] transition-all duration-1000 ${isMaster ? 'bg-black' : 'bg-white opacity-30 animate-float'}`} />
      </div>
    </div>
  );
};

export default Dashboard;
