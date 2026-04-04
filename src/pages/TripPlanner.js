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
  const [transportOptions, setTransportOptions] = useState({ onward: [], return: [] });
  const [stayOptions, setStayOptions] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState({ onward: null, return: null, cab_mode: null, agency_charge: 0 });
  const [selectedStay, setSelectedStay] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [orchestrating, setOrchestrating] = useState(false);
  const [manualAgencyCharge, setManualAgencyCharge] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [transactionId, setTransactionId] = useState('');

  const generateManifest = () => {
    let manifest = `--- Y.A.S.H TRIP MANIFEST ---\n`;
    manifest += `Generated: ${new Date().toLocaleString()}\n`;
    manifest += `Trip ID: ${tripId}\n\n`;
    
    manifest += `[PASSENGERS]\n`;
    passengers.forEach((p, i) => {
      manifest += `${i+1}. ${p.name || 'Anonymous'} | ID: ${p.id || 'N/A'} | Phone: ${p.phone || 'N/A'} | Email: ${p.email || 'N/A'}\n`;
    });
    
    manifest += `\n[TRANSPORT]\n`;
    manifest += `Onward: ${selectedTransport.onward?.provider} (${selectedTransport.onward?.type}) | Price: ₹${selectedTransport.onward?.price}\n`;
    if (selectedTransport.return) {
      manifest += `Return: ${selectedTransport.return?.provider} (${selectedTransport.return?.type}) | Price: ₹${selectedTransport.return?.price}\n`;
    }
    
    manifest += `\n[STAY]\n`;
    manifest += `${selectedStay?.name} | Nights: ${selectedStay?.nights} | Total: ₹${selectedStay?.price}\n`;
    
    manifest += `\n[FINANCIALS]\n`;
    manifest += `Agency Charge: ₹${manualAgencyCharge}\n`;
    manifest += `Transaction ID: ${transactionId}\n`;
    manifest += `TOTAL PAID: ₹${((selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + (selectedStay?.price || 0) + manualAgencyCharge).toLocaleString()}\n`;
    
    return manifest;
  };

  const downloadManifest = async () => {
    const manifest = generateManifest();
    
    // 1. Local Download
    const element = document.createElement("a");
    const file = new Blob([manifest], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `YASH_Manifest_${tripId}.txt`;
    document.body.appendChild(element);
    element.click();

    // 2. Network Dispatch (Notification Hub)
    try {
      const emails = passengers.map(p => p.email).filter(Boolean);
      const phones = passengers.map(p => p.phone).filter(Boolean);
      await tripAPI.sendManifest({
        manifest,
        emails,
        phones,
        trip_id: tripId
      });
      toast.success('Manifest dispatched to explorer terminals');
    } catch (err) {
      console.warn('Notification hub offline, manifest delivered locally only');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const data = await tripAPI.getTrip(tripId);
        setTrip(data);
        // Auto-initialize orchestration to skip the manual "Plan Ready" step
        setOrchestrating(true);
        const response = await tripAPI.orchestrateTrip(tripId);
        setTransportOptions(response.transports || { onward: [], return: [] });
        setStayOptions(response.stays || []);
        setItinerary(response.itinerary || []);
        // Initialize passengers array from trip data
        const travelerCount = data.details?.num_people || 1;
        setPassengers(Array.from({ length: travelerCount }).map(() => ({ name: '', id: '', phone: '', email: '' })));
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
                initialPeople={trip.details.num_people}
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
                <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Explorer Matrix</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {passengers.map((p, idx) => (
                  <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/50 bg-white/30">
                    <h3 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-6">Passenger {idx + 1}</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-14 px-6 font-bold" 
                        value={p.name}
                        onChange={(e) => {
                          const newP = [...passengers];
                          newP[idx].name = e.target.value;
                          setPassengers(newP);
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Phone (Opt)" 
                          className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-12 px-6 font-bold text-sm" 
                          value={p.phone}
                          onChange={(e) => {
                            const newP = [...passengers];
                            newP[idx].phone = e.target.value;
                            setPassengers(newP);
                          }}
                        />
                        <input 
                          type="email" 
                          placeholder="Email (Opt)" 
                          className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-12 px-6 font-bold text-sm" 
                          value={p.email}
                          onChange={(e) => {
                            const newP = [...passengers];
                            newP[idx].email = e.target.value;
                            setPassengers(newP);
                          }}
                        />
                      </div>
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
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Transport (Onward)</p>
                    <h3 className="text-2xl font-black text-[#1a0b2e] mb-1">{selectedTransport.onward?.provider || selectedTransport.onward?.type || "None"}</h3>
                    <p className="text-[10px] text-[#1a0b2e]/40 font-bold mb-4">{selectedTransport.cab_mode === 'self' ? 'Self Arranged Cab' : ''}</p>
                    <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport.onward?.price || 0).toLocaleString()}</div>
                  </div>
                  {selectedTransport.return && (
                    <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                      <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Transport (Return)</p>
                      <h3 className="text-2xl font-black text-[#1a0b2e] mb-1">{selectedTransport.return.provider || selectedTransport.return.type}</h3>
                      <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport.return.price || 0).toLocaleString()}</div>
                    </div>
                  )}
                  {selectedTransport.cab_mode === 'agency' && selectedTransport.agency_charge > 0 && (
                    <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                      <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Cab Charge</p>
                      <h3 className="text-2xl font-black text-[#1a0b2e] mb-4">Agency Cab</h3>
                      <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport.agency_charge || 0).toLocaleString()}</div>
                    </div>
                  )}
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Stay</p>
                    <h3 className="text-2xl font-black text-[#1a0b2e] mb-4">{selectedStay?.name}</h3>
                    <div className="text-3xl font-black text-[#A855F7]">₹{(selectedStay?.price || 0).toLocaleString()}</div>
                  </div>
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20 bg-[#A855F7]/5">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Platform Fee & Taxes</p>
                    <h3 className="text-2xl font-black text-[#1a0b2e] mb-4">Agency Charge</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-3xl font-black text-[#A855F7]">₹</span>
                       <input 
                         type="number" 
                         value={manualAgencyCharge || ''} 
                         onChange={(e) => setManualAgencyCharge(Number(e.target.value) || 0)}
                         placeholder="0"
                         className="bg-transparent border-b-2 border-[#A855F7]/30 text-3xl font-black text-[#A855F7] w-32 focus:outline-none focus:border-[#A855F7] transition-all"
                       />
                    </div>
                  </div>
                </div>
              </div>

              <UPIPayment
                amount={Math.round((selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + (selectedStay?.price || 0) + manualAgencyCharge)}
                tripId={tripId}
                onTransactionIdChange={(val) => setTransactionId(val)}
                onComplete={() => {
                  toast.success('Mission Complete: Credits Settled.');
                  downloadManifest();
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
