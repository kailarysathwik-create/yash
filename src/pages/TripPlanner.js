import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { tripAPI } from '../api/tripAPI';
import RealTransportSearch from '../components/RealTransportSearch';
import RealStaySearch from '../components/RealStaySearch';
import UPIPayment from '../components/UPIPayment';
import { Button } from '../components/ui/button';
import { MapPin, Calendar, Users, Sparkles, CheckCircle2, LoaderCircle, Send, ShieldCheck } from 'lucide-react';

const TripPlanner = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const customerRef = useRef(null);
  const agencyRef = useRef(null);
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [transportOptions, setTransportOptions] = useState({ onward: [], return: [] });
  const [stayOptions, setStayOptions] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState({ onward: null, return: null, cab_mode: null, agency_charge: 0 });
  const [selectedStays, setSelectedStays] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [orchestrating, setOrchestrating] = useState(false);
  const [manualAgencyCharge, setManualAgencyCharge] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [transactionId, setTransactionId] = useState('');
  const [isHistory, setIsHistory] = useState(false);

  const bookedNights = selectedStays.reduce((acc, s) => acc + (s.nights || 0), 0);

  const maskAadhar = (val) => {
    if (!val) return 'N/A';
    if (val.length < 4) return val;
    return `XXXX-XXXX-${val.slice(-4)}`;
  };

  const downloadCustomerManifest = async () => {
    if (!customerRef.current) return;
    try {
      const dataUrl = await toPng(customerRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Voyager_Blueprint_${trip?.destination || 'Trip'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Visual Blueprint Captured');
    } catch (err) {
      toast.error('Synthesis failed');
    }
  };

  const downloadAgencyManifest = async () => {
    if (!agencyRef.current) return;
    try {
      const dataUrl = await toPng(agencyRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Agency_Master_${trip?.destination || 'Trip'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Logistics Master Captured');
    } catch (err) {
      toast.error('Synthesis failed');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const tripData = await tripAPI.getTrip(tripId);
        setTrip(tripData);
        
        // Fetch user in background to avoid blocking
        tripAPI.auth.getMe().then(setUser).catch(err => console.error("Identity Sync Postponed:", err));

        if (tripData.transaction_id || tripData.status === 'completed') {
            setIsHistory(true);
            setTransactionId(tripData.transaction_id || '');
            setManualAgencyCharge(tripData.agency_charge || 0);
            
            setSelectedTransport({
              onward: tripData.transport_details?.onward || null,
              return: tripData.transport_details?.return || null,
              cab_mode: tripData.transport_details?.cab_mode || null,
              agency_charge: tripData.transport_details?.agency_charge || 0,
              num_cabs: tripData.num_cabs || 1,
              number_plate: tripData.number_plate || ''
            });
            setSelectedStays(tripData.stay_details || []);
            setItinerary(tripData.itinerary || []);

            if (tripData.tourists && tripData.tourists.length > 0) {
              setPassengers(tripData.tourists.map(t => ({
                name: t.name,
                age: t.age?.toString() || '',
                gender: t.gender || '',
                proof: t.proof || '',
                is_primary: t.is_primary || false,
                phone: t.phone || '',
                email: t.email || ''
              })));
            }
            
            setStep(7);
        } else {
            setOrchestrating(true);
            const response = await tripAPI.orchestrateTrip(tripId);
            setTransportOptions(response.transports || { onward: [], return: [] });
            setStayOptions(response.stays || []);
            setItinerary(response.itinerary || []);
            setPassengers(Array.from({ length: tripData.num_people || 1 }).map(() => ({ 
              name: '', age: '', gender: '', proof: '', is_primary: false, phone: '', email: '' 
            })));
            setManualAgencyCharge(tripData.agency_charge || 0);
            setStep(2); 
        }
      } catch (error) {
        toast.error('Failed to synchronize hub data');
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
        <header className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-2xl shadow-[#A855F7]/20 border-2 border-white aspect-square">
                <img src="/logo.png" alt="Y.A.S.H Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="px-4 py-1.5 glass rounded-full text-[10px] font-black text-[#A855F7] uppercase tracking-widest border border-[#A855F7]/20">
                    Mission: {trip.destination}
                  </span>
                  <span className="text-[#1a0b2e]/20 font-bold text-xs uppercase tracking-widest">Ref: {tripId.slice(0, 8)}</span>
                </div>
                <h1 className="text-5xl font-black text-[#1a0b2e] tracking-tight">Yatra And Stay Hub</h1>
              </div>
            </motion.div>

            <div className={`flex items-center justify-center space-x-4 mb-20 ${isHistory ? 'opacity-0 h-0 pointer-events-none' : ''}`}>
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
              <div><p className="text-[10px] font-black uppercase text-[#A855F7]/60 tracking-widest mb-1">Vector</p><p className="font-bold text-[#1a0b2e]">{trip.from_location} → {trip.destination}</p></div>
            </div>
            <div className="flex items-center gap-4 border-l border-[#1a0b2e]/5 pl-12">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center"><Calendar className="text-[#A855F7] w-6 h-6" /></div>
              <div><p className="text-[10px] font-black uppercase text-[#A855F7]/60 tracking-widest mb-1">Commencement</p><p className="font-bold text-[#1a0b2e]">{trip.start_date} • {trip.num_days} Days</p></div>
            </div>
            <div className="flex items-center gap-4 border-l border-[#1a0b2e]/5 pl-12">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center"><Users className="text-[#A855F7] w-6 h-6" /></div>
              <div><p className="text-[10px] font-black uppercase text-[#A855F7]/60 tracking-widest mb-1">Personnel</p><p className="font-bold text-[#1a0b2e]">{trip.num_people} Explorer(s)</p></div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-20">
              <div className="max-w-2xl mx-auto glass-card rounded-[4rem] p-16 border-dashed border-2 border-[#A855F7]/20">
                <Sparkles className="w-16 h-16 text-[#A855F7] mx-auto mb-10 animate-pulse" />
                <h2 className="text-4xl font-black text-[#1a0b2e] mb-6">Plan Ready</h2>
                <Button onClick={() => { setOrchestrating(true); tripAPI.orchestrateTrip(tripId).then(r => { setTransportOptions(r.transports); setStayOptions(r.stays); setItinerary(r.itinerary); setStep(2); }); }} disabled={orchestrating} className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] rounded-full h-20 px-12 font-black text-xl">
                  {orchestrating ? 'Synchronizing...' : 'Initialize AI Sync'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RealTransportSearch options={transportOptions} initialPeople={trip?.num_people || 1} tripData={trip} onSelect={(val) => { setSelectedTransport(val); setStep(3); }} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <RealStaySearch options={stayOptions} tripData={trip} numDays={trip?.num_days || 1} onSelect={(opt) => { setSelectedStays(prev => [...prev, opt]); if (bookedNights + opt.nights >= trip.num_days) setStep(4); }} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="grid grid-cols-1 gap-8">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="glass-card rounded-[3.5rem] p-12 border-white/50 shadow-2xl">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-2">Day {idx + 1}</h3>
                        <h4 className="text-3xl font-black text-[#1a0b2e] tracking-tight">{day.title}</h4>
                      </div>
                      <div className="w-16 h-16 rounded-3xl bg-[#A855F7]/10 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-[#A855F7]" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      {day.activities.map((activity, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-4 p-4 rounded-2xl bg-[#1a0b2e]/[0.02] border border-[#1a0b2e]/5">
                          <div className="w-2 h-2 rounded-full bg-[#A855F7] mt-2.5 shrink-0" />
                          <p className="text-[#1a0b2e] font-bold leading-relaxed">{activity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-20">
                <Button onClick={() => setStep(5)} className="bg-[#1a0b2e] text-white rounded-full h-24 px-20 font-black text-2xl">Next: Passenger Details</Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {passengers.map((p, idx) => (
                  <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/50 bg-white/30 relative group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#A855F7]/10">
                    <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
                      <label className="text-[10px] font-black uppercase text-[#A855F7]/40 group-hover:text-[#A855F7] transition-colors cursor-pointer">Official Primary</label>
                      <input 
                        type="checkbox"
                        className="w-5 h-5 accent-[#A855F7] cursor-pointer"
                        checked={p.is_primary}
                        onChange={(e) => {
                          const newP = [...passengers];
                          newP[idx].is_primary = e.target.checked;
                          // If this one is primary, set its phone as lead
                          setPassengers(newP);
                        }}
                      />
                    </div>
                    <h3 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-6">Passenger {idx + 1}</h3>
                    <div className="space-y-4">
                      <input type="text" placeholder="Full Name" className="w-full bg-white/50 border border-white/50 rounded-xl h-14 px-6 font-bold" value={p.name} onChange={(e) => { const newP = [...passengers]; newP[idx].name = e.target.value; setPassengers(newP); }} />
                      <div className="grid grid-cols-3 gap-4">
                        <input type="number" placeholder="Age" className="bg-white/50 border border-white/50 rounded-xl h-12 px-6 font-bold text-sm" value={p.age} onChange={(e) => { const newP = [...passengers]; newP[idx].age = e.target.value; setPassengers(newP); }} />
                        <select className="bg-white/50 border border-white/50 rounded-xl h-12 px-6 font-bold text-sm appearance-none" value={p.gender} onChange={(e) => { const newP = [...passengers]; newP[idx].gender = e.target.value; setPassengers(newP); }}><option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option></select>
                        <input type="text" placeholder="Aadhar ID" className="bg-white/50 border border-white/50 rounded-xl h-12 px-6 font-bold text-sm" value={p.proof} onChange={(e) => { const newP = [...passengers]; newP[idx].proof = e.target.value; setPassengers(newP); }} />
                      </div>

                      <AnimatePresence>
                        {p.is_primary && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-4 pt-4 border-t border-[#A855F7]/10"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-[#A855F7] tracking-widest ml-1">Official Mobile (Req)</label>
                                <input 
                                  type="text"
                                  placeholder="+91 XXXX"
                                  className="w-full bg-[#A855F7]/5 border border-[#A855F7]/20 text-[#1a0b2e] rounded-xl h-12 px-5 font-bold text-sm focus:border-[#A855F7] transition-all"
                                  value={p.phone || ''}
                                  onChange={(e) => {
                                    const newP = [...passengers];
                                    newP[idx].phone = e.target.value;
                                    setPassengers(newP);
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-[#A855F7] tracking-widest ml-1">Official Email (Opt)</label>
                                <input 
                                  type="email"
                                  placeholder="email@agency.com"
                                  className="w-full bg-[#A855F7]/5 border border-[#A855F7]/20 text-[#1a0b2e] rounded-xl h-12 px-5 font-bold text-sm focus:border-[#A855F7] transition-all"
                                  value={p.email || ''}
                                  onChange={(e) => {
                                    const newP = [...passengers];
                                    newP[idx].email = e.target.value;
                                    setPassengers(newP);
                                  }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-20">
                <Button 
                  onClick={async () => { 
                    const primary = passengers.find(p => p.is_primary);
                    if (!primary || !primary.phone) {
                      toast.error("Identity Protocol Required: Mark one 'Official Primary' with a phone number.");
                      return;
                    }

                    try {
                      setLoading(true);
                       await tripAPI.updateTouristDetails(tripId, { 
                         tourists: passengers.map(p => ({
                           name: p.name,
                           age: parseInt(p.age) || 0,
                           gender: p.gender,
                           proof: p.proof,
                           is_primary: p.is_primary || false
                         })),
                         contact_phone: primary.phone,
                         contact_email: primary.email || "",
                         secondary_phone: "",
                         agency_charge: manualAgencyCharge,
                         num_cabs: selectedTransport.num_cabs || 1,
                         number_plate: selectedTransport.number_plate || ""
                       }); 
                       toast.success('Explorer Matrix Synchronized');
                       setStep(6); 
                    } catch(err) {
                       toast.error('Matrix Synchronization Failed (422 Schema)');
                    } finally {
                       setLoading(false);
                    }
                  }} 
                  disabled={loading}
                  className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] rounded-full h-24 px-20 font-black text-2xl"
                >
                  {loading ? 'Synchronizing Protocols...' : 'Next: Settle Credits'}
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
                    <p className="text-[10px] text-[#A855F7] font-black mb-4">ID: {selectedTransport.onward?.vehicle_id || "N/A"}</p>
                    <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport.onward?.price || 0).toLocaleString()}</div>
                  </div>
                  {selectedTransport.return && (
                    <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                      <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Transport (Return)</p>
                      <h3 className="text-2xl font-black text-[#1a0b2e] mb-1">{selectedTransport.return.provider || selectedTransport.return.type}</h3>
                      <p className="text-[10px] text-[#A855F7] font-black mb-4">ID: {selectedTransport.return.vehicle_id || "N/A"}</p>
                      <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport.return.price || 0).toLocaleString()}</div>
                    </div>
                  )}
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Stays</p>
                    <div className="space-y-2">
                      {selectedStays.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/40 p-3 rounded-xl border border-white/50">
                          <span className="font-bold text-[#1a0b2e] text-sm">{s.name}</span>
                          <span className="font-black text-[#A855F7] text-sm">₹{s.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20 bg-[#A855F7]/5">
                    <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Platform Fee & Taxes</p>
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
                amount={Math.round((selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge)}
                tripId={tripId}
                onComplete={async () => {
                  toast.success('Credits Settled.');
                  const totalAmount = Number(selectedTransport.onward?.price || 0) + Number(selectedTransport.return?.price || 0) + Number(selectedTransport.agency_charge || 0) + Number(selectedStays.reduce((acc, s) => acc + (s.price || 0), 0)) + Number(manualAgencyCharge || 0);

                  const leadPrimary = passengers.find(p => p.is_primary) || passengers[0];
                  await tripAPI.confirmPayment(tripId, {
                    transaction_id: transactionId,
                    total_amount: totalAmount,
                    agency_charge: manualAgencyCharge,
                    primary_phone: leadPrimary.phone || '',
                    email: leadPrimary.email || '',
                    secondary_phone: ''
                  });
                  const freshTrip = await tripAPI.getTrip(tripId);
                  setTrip(freshTrip);
                  setStep(7);
                }}
              />
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-5xl font-black text-[#1a0b2e] tracking-tighter mb-2">Mission Settlement</h2>
                  <p className="text-[#1a0b2e]/50 font-bold uppercase text-[10px] tracking-widest">Reference: YASH-X-00{tripId.slice(-4)}</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-3">
                   <ShieldCheck className="w-6 h-6 text-green-500" />
                   <div>
                     <p className="text-[8px] font-black uppercase text-green-500 tracking-widest">Status: Finalized</p>
                     <p className="text-[10px] font-bold text-green-800/60 leading-none">ReadOnly Archive</p>
                   </div>
                </div>
              </div>

              <Tabs defaultValue="blueprint" className="w-full">
                <TabsList className="bg-white/40 border border-white/50 p-2 rounded-3xl mb-12 h-16 w-full max-w-md">
                   <TabsTrigger value="blueprint" className="rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-[#A855F7] data-[state=active]:text-white transition-all duration-500">Voyager Blueprint</TabsTrigger>
                   <TabsTrigger value="logistics" className="rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-[#1a0b2e] data-[state=active]:text-white transition-all duration-500">Logistics Master</TabsTrigger>
                </TabsList>

                <TabsContent value="blueprint" className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                  <div className="flex justify-end gap-4 -mt-20 mb-8">
                     <Button onClick={downloadCustomerManifest} className="bg-[#A855F7] text-white hover:scale-105 transition-all h-14 rounded-2xl px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#A855F7]/20">Capture Blueprint PNG</Button>
                  </div>
                  
                  {/* Live Blueprint Preview */}
                  <div className="max-w-4xl mx-auto glass-card rounded-[4rem] overflow-hidden shadow-3xl">
                     <div className="bg-[#A855F7] p-12 text-white flex justify-between items-center">
                        <div className="space-y-2">
                           <h3 className="text-4xl font-black italic tracking-tighter uppercase">{user?.organization || 'Y.A.S.H'}</h3>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Customer Copy • Voyage Blueprint</p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black">{trip?.destination.toUpperCase()}</p>
                           <p className="text-xs font-bold opacity-60">{trip?.num_days} Day Mission</p>
                        </div>
                     </div>
                     <div className="p-16 space-y-16 bg-white/60">
                        {itinerary.map((day, idx) => (
                           <div key={idx} className="relative pl-12 border-l-2 border-[#A855F7]/10">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#A855F7] shadow-lg shadow-[#A855F7]/30" />
                              <h4 className="text-2xl font-black text-[#1a0b2e] mb-4">Day {idx + 1}: {day.title}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {day.activities.map((act, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/80 border border-black/5 text-sm font-bold text-gray-600">• {act}</div>
                                 ))}
                              </div>
                           </div>
                        ))}
                        <div className="pt-20 border-t border-black/5 text-center">
                           <p className="text-[10px] font-black text-[#A855F7] tracking-[0.5em] uppercase">Y.A.S.H crafted by KPN Studios</p>
                        </div>
                     </div>
                  </div>
                </TabsContent>

                <TabsContent value="logistics" className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                  <div className="flex justify-end gap-4 -mt-20 mb-8">
                     <Button onClick={downloadAgencyManifest} className="bg-[#1a0b2e] text-white hover:scale-105 transition-all h-14 rounded-2xl px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20">Capture Logistics PNG</Button>
                  </div>

                  {/* Live Logistics Preview */}
                  <div className="max-w-4xl mx-auto glass-card rounded-[4rem] overflow-hidden shadow-3xl">
                     <div className="bg-[#1a0b2e] p-12 text-white flex justify-between items-center">
                        <div className="space-y-2">
                           <h3 className="text-4xl font-black italic tracking-tighter uppercase">{user?.organization || 'Y.A.S.H'}</h3>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Internal Master • Logistics Record</p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black italic">PROB: 100% SYNC</p>
                           <p className="text-[10px] font-bold opacity-40">Settlement ID: {trip?.transaction_id}</p>
                        </div>
                     </div>
                     <div className="p-16 space-y-12 bg-white/60">
                        <div className="grid grid-cols-3 gap-8">
                           <div className="p-6 rounded-[2rem] bg-[#1a0b2e]/5">
                              <p className="text-[8px] font-black uppercase text-[#1a0b2e]/40 mb-2">Mission Payload</p>
                              <p className="text-xl font-black italic text-[#1a0b2e]">{passengers.length} Matrix Point(s)</p>
                           </div>
                           <div className="p-6 rounded-[2rem] bg-[#1a0b2e]/5">
                              <p className="text-[8px] font-black uppercase text-[#1a0b2e]/40 mb-2">Transport Vector</p>
                              <p className="text-xl font-black italic text-[#1a0b2e]">{selectedTransport.onward?.provider || 'CAB'}</p>
                           </div>
                           <div className="p-6 rounded-[2rem] bg-[#1a0b2e]/5 text-right">
                              <p className="text-[8px] font-black uppercase text-[#1a0b2e]/40 mb-2">Settlement</p>
                              <p className="text-2xl font-black italic text-[#A855F7]">₹{trip?.total_amount?.toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="rounded-[3rem] overflow-hidden border border-black/5 bg-white/80">
                           <table className="w-full text-left">
                              <thead className="bg-[#1a0b2e]/[0.02] border-b border-black/5">
                                 <tr>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Explorer Matrix</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">AGE/SEX</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">ID PROOF</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-black/5">
                                 {passengers.map((p, i) => (
                                    <tr key={i} className="hover:bg-white transition-colors">
                                       <td className="p-6 font-black text-gray-700">{p.name} {p.is_primary && <span className="ml-2 text-[8px] bg-[#A855F7] text-white px-2 py-0.5 rounded-full">Lead</span>}</td>
                                       <td className="p-6 font-bold text-gray-500 uppercase">{p.age} • {p.gender}</td>
                                       <td className="p-6 text-xs font-black text-gray-300 font-mono italic tracking-tighter">{p.proof}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                        <div className="text-center pt-8">
                           <p className="text-[10px] font-black text-[#1a0b2e] tracking-[0.5em] opacity-10 uppercase italic">Y.A.S.H crafted by KPN Studios</p>
                        </div>
                     </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[5%] w-[900px] h-[900px] bg-[#fdfafb] rounded-full blur-[150px] opacity-100" />
        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[#f3e8ff] rounded-full blur-[140px] pulse-bg opacity-40" />
      </div>

      {/* Branded Visual Signature */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#A855F7]/20 to-transparent mb-8" />
        <p className="text-2xl font-black text-[#1a0b2e] tracking-tighter">Y.A.S.H</p>
        <p className="text-[10px] font-black uppercase text-[#A855F7]/40 tracking-widest">crafted by KPN Studio</p>
      </footer>
    </div>
  );
};

export default TripPlanner;
