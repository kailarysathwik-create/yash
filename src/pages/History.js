import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import { History, RefreshCw, Calendar, Users, Plane, Train, Car, ArrowRight, LoaderCircle, Building2, User, Download } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Synthesis Engine Refs
  const agencyRef = useRef(null);
  const customerRef = useRef(null);
  const [captureTrip, setCaptureTrip] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      console.log('Hub: Accessing trip archives...');
      const data = await tripAPI.getTrips();
      const tripsArray = Array.isArray(data) ? data : (data?.trips || []);
      setTrips(tripsArray);
    } catch (error) {
      console.error('Hub Archive Error:', error);
      toast.error('Failed to access trip archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const fetchUser = async () => {
      try {
        const userData = await tripAPI.auth.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Identity Fetch Failed:", err);
      }
    };
    fetchUser();
  }, []);

  const initiateCapture = async (trip, type) => {
    setCaptureTrip(trip);
    setIsCapturing(true);
    toast.loading(`Synthesizing ${type === 'agency' ? 'Logistics Master' : 'Voyager Blueprint'}...`, { id: 'capture' });

    // Wait for DOM to hydrate with captureTrip data
    setTimeout(async () => {
      try {
        const ref = type === 'agency' ? agencyRef : customerRef;
        if (!ref.current) throw new Error("Synthesis Vector Not Found");
        
        const dataUrl = await toPng(ref.current, { quality: 1, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `YASH_${type.toUpperCase()}_${trip.trip_id.slice(-6)}.png`;
        link.href = dataUrl;
        link.click();
        
        toast.success(`${type === 'agency' ? 'Logistics Master' : 'Voyager Blueprint'} Captured`, { id: 'capture' });
      } catch (err) {
        toast.error("Synthesis Protocol Failed", { id: 'capture' });
      } finally {
        setCaptureTrip(null);
        setIsCapturing(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen pb-32">
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <header className="mb-20">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-[2rem] glass flex items-center justify-center shadow-xl shadow-[#A855F7]/10">
                <History className="w-8 h-8 text-[#A855F7]" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-[#1a0b2e] tracking-tight">Hub Archive</h1>
                <p className="text-[#A855F7]/40 text-sm font-bold uppercase tracking-[0.2em] mt-2">Chronicles of Yatra And Stay Hub</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button 
                onClick={fetchHistory}
                className="flex items-center gap-3 px-8 py-4 glass rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all duration-500"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Synchronizing...' : 'Sync Archive'}
              </button>
            </motion.div>
          </div>
        </header>

        {/* content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <LoaderCircle className="w-12 h-12 animate-spin text-[#A855F7]" />
              <div className="absolute inset-0 blur-xl bg-[#A855F7]/20 rounded-full" />
            </div>
            <p className="mt-8 text-[#1a0b2e]/30 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Protocols...</p>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 card-3d-wrapper">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.trip_id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  className="card-3d glass-card rounded-[3rem] p-10 group relative overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A855F7]/10 rounded-full blur-[60px] group-hover:bg-[#A855F7]/20 transition-all duration-700" />
                  
                  <div className="flex items-center justify-between mb-10 relative z-10">
                     <span className="text-[10px] font-black text-[#1a0b2e] bg-white/40 px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-[#A855F7]/20 group-hover:bg-[#A855F7] group-hover:text-white transition-all duration-500">
                       {trip.status}
                     </span>
                     <span className="text-[11px] font-bold text-[#1a0b2e]/20 group-hover:text-[#1a0b2e]/50 transition-colors">
                       {new Date(trip.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </span>
                  </div>

                  <h3 className="text-3xl font-black text-[#1a0b2e] mb-8 group-hover:translate-x-2 transition-transform duration-500 relative z-10 leading-tight">
                    {trip.from_location} <ArrowRight className="inline w-5 h-5 mx-2 text-[#A855F7]/30" /> {trip.destination}
                  </h3>

                  <div className="space-y-5 mb-10 relative z-10">
                    <div className="flex items-center gap-4 text-sm font-bold text-[#1a0b2e]/40 group-hover:text-[#1a0b2e]/70 transition-colors">
                      <Calendar className="w-5 h-5 text-[#A855F7]" />
                      {trip.start_date} • {trip.num_days} Deployment Days
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-[#1a0b2e]/40 group-hover:text-[#1a0b2e]/70 transition-colors">
                      <Users className="w-5 h-5 text-[#A855F7]" />
                      {trip.num_people} Personnel Synchronized
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#1a0b2e]/5 flex items-center justify-between group-hover:border-[#A855F7]/20 transition-all duration-500 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="bg-white/60 p-3 rounded-2xl group-hover:bg-[#A855F7] transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#A855F7]/20">
                          {trip.transport_mode === 'flight' && <Plane className="w-5 h-5 text-[#A855F7] group-hover:text-white" />}
                          {trip.transport_mode === 'train' && <Train className="w-5 h-5 text-[#A855F7] group-hover:text-white" />}
                          {trip.transport_mode === 'car' && <Car className="w-5 h-5 text-[#A855F7] group-hover:text-white" />}
                        </div>
                        <span className="text-[11px] font-black uppercase text-[#1a0b2e]/30 group-hover:text-[#1a0b2e] tracking-widest">{trip.transport_mode === 'car' ? 'Ground Cab' : trip.transport_mode}</span>
                     </div>
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={isCapturing}
                          onClick={() => initiateCapture(trip, 'agency')}
                          className="w-10 h-10 rounded-xl border border-[#1a0b2e]/10 flex items-center justify-center hover:bg-[#1a0b2e] hover:text-white transition-all shadow-sm group/btn disabled:opacity-50"
                          title="Agency Copy (PNG)"
                        >
                          <Building2 className="w-4 h-4 text-[#1a0b2e] group-hover/btn:text-white" />
                        </button>
                        <button 
                          disabled={isCapturing}
                          onClick={() => initiateCapture(trip, 'customer')}
                          className="w-10 h-10 rounded-xl border border-[#A855F7]/10 flex items-center justify-center hover:bg-[#A855F7] hover:text-white transition-all shadow-sm group/btn disabled:opacity-50"
                          title="Customer Copy (PNG)"
                        >
                          <User className="w-4 h-4 text-[#A855F7] group-hover/btn:text-white" />
                        </button>
                      </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 glass rounded-[4rem] border-dashed border-2 border-[#A855F7]/10 relative overflow-hidden"
          >
            <History className="w-24 h-24 text-[#A855F7]/10 mx-auto mb-10" />
            <p className="text-[#1a0b2e]/20 font-black uppercase tracking-[0.4em] text-[12px] mb-6">Archive Empty</p>
            <p className="text-[#1a0b2e]/40 font-bold max-w-xs mx-auto italic">No prior deployments detected in the Hub records. Start your first journey to begin the chronicle.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/dashboard')}
              className="mt-12 px-10 py-5 bg-[#A855F7] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-[#A855F7]/20"
            >
              Initiate Deployment
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Background Capture Portal (Hidden) */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none">
        <div ref={customerRef} className="w-[800px] bg-white p-20">
          <div className="bg-[#A855F7] p-12 -mx-20 -mt-20 mb-12 flex justify-between items-center text-white">
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">{user?.organization || 'AGENCY'}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Customer Copy • Voyage Blueprint</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black italic">{captureTrip?.destination.toUpperCase()}</p>
              <p className="text-[10px] font-bold opacity-60">{captureTrip?.num_days} Day Mission</p>
            </div>
          </div>
          <div className="space-y-12">
            {captureTrip?.itinerary?.days?.map((day, idx) => (
              <div key={idx} className="relative pl-10 border-l-2 border-[#A855F7]/10">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#A855F7]" />
                <h3 className="text-xl font-black text-[#1a0b2e] mb-4">Day {idx + 1}: {day.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {day.activities.map((act, i) => <p key={i} className="text-xs text-gray-500 font-bold">• {act}</p>)}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-20 text-center">
            <p className="text-[10px] font-black text-[#A855F7] tracking-[0.5em] uppercase opacity-30 italic">Y.A.S.H crafted by KPN Studios</p>
          </div>
        </div>

        <div ref={agencyRef} className="w-[1000px] bg-white p-20">
          <div className="bg-[#1a0b2e] p-12 -mx-20 -mt-20 mb-12 flex justify-between items-center text-white">
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">{user?.organization || 'AGENCY'}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Internal Master • Logistics Record</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black italic">PROB: 100% SYNC</p>
              <p className="text-[10px] font-bold opacity-30">Ref ID: {captureTrip?.trip_id.slice(-8)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-[2rem] bg-[#1a0b2e]/5">
              <p className="text-[8px] font-black uppercase text-[#1a0b2e]/40 mb-2">Personnel</p>
              <p className="text-xl font-black italic text-[#1a0b2e]">{captureTrip?.num_people} Personnel</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-[#1a0b2e]/5">
               <p className="text-[8px] font-black uppercase text-[#1a0b2e]/40 mb-2">Settlement</p>
               <p className="text-xl font-black italic text-[#A855F7]">₹{captureTrip?.total_amount?.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-[#1a0b2e]/5 text-right">
               <p className="text-[8px] font-black uppercase text-[#1a0b2e]/40 mb-2">Contact</p>
               <p className="text-xs font-black italic text-[#1a0b2e]">{captureTrip?.contact_phone}</p>
            </div>
          </div>
          <table className="w-full mb-12 overflow-hidden rounded-3xl border border-gray-100">
            <thead className="bg-[#1a0b2e]/[0.02] text-left"><tr><th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Personnel Matrix</th><th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Age / Sex</th><th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Identity Proof</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {(captureTrip?.passengers || captureTrip?.tourists)?.map((p, idx) => (
                <tr key={idx}><td className="p-6 font-black text-[#1a0b2e]">{p.name || 'ANON'}</td><td className="p-6 font-bold text-gray-400 uppercase text-xs">{p.age || 'N/A'} • {p.gender || 'N/A'}</td><td className="p-6 text-mono text-xs font-black text-gray-200">{p.proof || 'N/A'}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="text-center pt-8">
            <p className="text-[10px] font-black text-[#1a0b2e] tracking-[0.5em] opacity-10 uppercase italic">Y.A.S.H crafted by KPN Studios</p>
          </div>
        </div>
      </div>

      {/* Decorative BG elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-[#A855F7]/5 rounded-full blur-[140px] pulse-bg" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[700px] h-[700px] bg-[#f3e8ff] rounded-full blur-[150px] animate-float opacity-50" />
      </div>
    </div>
  );
};

export default HistoryPage;
