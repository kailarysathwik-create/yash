import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { tripAPI } from '@/api/tripAPI';
import RealTransportSearch from '@/components/RealTransportSearch';
import RealStaySearch from '@/components/RealStaySearch';
import UPIPayment from '@/components/UPIPayment';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Sparkles, Navigation, CheckCircle2, ChevronRight, LoaderCircle, Globe } from 'lucide-react';

const TripPlanner = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // States for orchestration
  const [transportOptions, setTransportOptions] = useState([]);
  const [stayOptions, setStayOptions] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [orchestrating, setOrchestrating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await tripAPI.getTrip(tripId);
        setTrip(data);
        // Auto-initialize orchestration to skip the manual "Plan Ready" step
        setOrchestrating(true);
        const response = await tripAPI.orchestrateTrip(tripId);
        setTransportOptions(response.transports || []);
        setStayOptions(response.stays || []);
        setItinerary(response.itinerary || []);
        setStep(2); // Move immediately to Transport
      } catch (error) {
        toast.error('Failed to synchronize and orchestrate trip data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
        setOrchestrating(false);
      }
    };
    init();
  }, [tripId, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoaderCircle className="w-12 h-12 text-[#A855F7] animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1a0b2e]/30">Synchronizing Hub Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-40 selection:bg-[#A855F7]/20">
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Orchestration Header */}
        <header className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/50 rounded-full border-4 border-white flex items-center justify-center shadow-xl overflow-hidden shrink-0">
                <img src="/logo.png" alt="Y.A.S.H Logo" className="w-full h-full object-cover scale-[1.15]" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="px-4 py-1.5 glass rounded-full text-[10px] font-black text-[#A855F7] uppercase tracking-widest border border-[#A855F7]/20">
                    Mission: {trip.details.destination}
                  </span>
                  <span className="text-[#1a0b2e]/20 font-bold text-xs uppercase tracking-widest">Ref: {tripId.slice(0, 8)}</span>
                </div>
                <h1 className="text-5xl font-black text-[#1a0b2e] tracking-tight">Yatra And Stay Hub</h1>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-700 ${step >= s ? 'bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/20' : 'bg-white/40 text-[#1a0b2e]/20 border border-white/50'
                    }`}>
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < 6 && <div className={`w-8 h-[2px] mx-1 rounded-full ${step > s ? 'bg-[#A855F7]' : 'bg-[#1a0b2e]/5'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[3rem] p-10 flex flex-wrap items-center gap-12 border-white/50 shadow-xl shadow-[#A855F7]/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center"><MapPin className="text-[#A855F7] w-6 h-6" /></div>
              <div><p className="text-[10px] font-black uppercase text-[#A855F7]/60 tracking-widest mb-1">Vector</p><p className="font-bold text-[#1a0b2e]">{trip.details.from_location} → {trip.details.destination}</p></div>
            </div>
            <div className="flex items-center gap-4 border-l border-[#1a0b2e]/5 pl-12">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center"><Calendar className="text-[#A855F7] w-6 h-6" /></div>
              <div><p className="text-[10px] font-black uppercase text-[#A855F7]/60 tracking-widest mb-1">Commencement</p><p className="font-bold text-[#1a0b2e]">{trip.details.start_date} • {trip.details.num_days} Days</p></div>
            </div>
            <div className="flex items-center gap-4 border-l border-[#1a0b2e]/5 pl-12">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center"><Users className="text-[#A855F7] w-6 h-6" /></div>
              <div><p className="text-[10px] font-black uppercase text-[#A855F7]/60 tracking-widest mb-1">Personnel</p><p className="font-bold text-[#1a0b2e]">{trip.details.num_people} Explorer(s)</p></div>
            </div>
          </div>
        </header>

        {/* Step Manager */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="max-w-2xl mx-auto glass-card rounded-[4rem] p-16 border-dashed border-2 border-[#A855F7]/20">
                <Sparkles className="w-16 h-16 text-[#A855F7] mx-auto mb-10 animate-pulse" />
                <h2 className="text-4xl font-black text-[#1a0b2e] mb-6">Plan Ready</h2>
                <p className="text-[#1a0b2e]/50 font-medium mb-12 text-lg">Y.A.S.H AI is ready to compute the optimal transport matrix and luxury stay in one place.</p>
                <Button onClick={handleOrchestrate} disabled={orchestrating} className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-20 px-12 font-black text-xl shadow-2xl shadow-[#A855F7]/20">
                  {orchestrating ? 'Synchronizing Protocols...' : 'Initialize AI Sync'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RealTransportSearch
                options={transportOptions}
                onSelect={(opt) => { setSelectedTransport(opt); setStep(3); }}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RealStaySearch
                options={stayOptions}
                onSelect={(opt) => { setSelectedStay(opt); setStep(4); }}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">AI Intelligence Narrative</h2>
                <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
                  <span className="text-[10px] font-black uppercase text-[#1a0b2e] tracking-widest">Itinerary Loaded</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {itinerary.map((day, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      key={i} className="glass-card rounded-[2.5rem] p-10 border-white/50 hover:border-[#A855F7]/30 transition-all duration-500"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-[#A855F7] text-white flex items-center justify-center font-black text-xl shadow-xl shadow-[#A855F7]/20">D{day.day}</div>
                        <div>
                          <h4 className="text-2xl font-black text-[#1a0b2e]">{day.title}</h4>
                          <p className="text-[#1a0b2e]/50 font-medium">{day.activities.join(' • ')}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-20">
                <Button onClick={() => setStep(5)} className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-24 px-20 font-black text-2xl shadow-3xl shadow-[#A855F7]/30">
                  Next: Passenger Details
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Explorer Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: trip.details.num_people }).map((_, idx) => (
                  <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/50">
                    <h3 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-6">Passenger {idx + 1}</h3>
                    <div className="space-y-4">
                      <input type="text" placeholder="Full Name" className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-14 px-6 font-bold" />
                      <input type="text" placeholder="ID / Passport (Optional)" className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-14 px-6 font-bold" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-20">
                <Button onClick={() => setStep(6)} className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-24 px-20 font-black text-2xl shadow-3xl shadow-[#A855F7]/30">
                  Next: Settle Credits & Checkout
                </Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-12">
                <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight mb-8">Checkout Manifest</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Transport</p>
                    <h3 className="text-2xl font-black text-[#1a0b2e] mb-2">{selectedTransport?.type}</h3>
                    <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport?.price || 0).toLocaleString()}</div>
                  </div>
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Stay</p>
                    <h3 className="text-2xl font-black text-[#1a0b2e] mb-2">{selectedStay?.name}</h3>
                    <div className="text-3xl font-black text-[#A855F7]">₹{(selectedStay?.price || 0).toLocaleString()}</div>
                  </div>
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20 bg-[#A855F7]/5">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Platform Fee & Taxes</p>
                    <h3 className="text-2xl font-black text-[#1a0b2e] mb-2">Agency Charges (10%)</h3>
                    <div className="text-3xl font-black text-[#A855F7]">
                      ₹{Math.round(((selectedTransport?.price || 0) + (selectedStay?.price || 0)) * 0.10).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <UPIPayment
                amount={Math.round(((selectedTransport?.price || 0) + (selectedStay?.price || 0)) * 1.10)}
                tripId={tripId}
                onComplete={() => {
                  toast.success('Mission Complete: Credits Settled.');
                  navigate('/dashboard');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative BG - Airy & Bright */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[5%] w-[900px] h-[900px] bg-[#fdfafb] rounded-full blur-[150px] opacity-100" />
        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[#f3e8ff] rounded-full blur-[140px] pulse-bg opacity-40" />
      </div>
    </div>
  );
};

export default TripPlanner;
