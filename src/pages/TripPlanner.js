import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import { tripAPI } from '../api/tripAPI';
import RealTransportSearch from '../components/RealTransportSearch';
import RealStaySearch from '../components/RealStaySearch';
import UPIPayment from '../components/UPIPayment';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapPin, Calendar, Users, Sparkles, CheckCircle2, LoaderCircle, ShieldCheck, LogOut } from 'lucide-react';

const TripPlanner = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const customerRef = useRef(null);
  const agencyRef = useRef(null);
  const videoRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [masterMode, setMasterMode] = useState('planner'); // 'planner' | 'command'
  const [masterData, setMasterData] = useState({ agencies: [], stats: {} });

  const [transportOptions, setTransportOptions] = useState({ onward: [], return: [] });
  const [stayOptions, setStayOptions] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState({ onward: null, return: null, cab_mode: null, agency_charge: 0, num_cabs: 1, number_plate: '' });
  const [selectedStays, setSelectedStays] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [orchestrating, setOrchestrating] = useState(false);
  const [manualAgencyCharge, setManualAgencyCharge] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [faceCaptureEnabled, setFaceCaptureEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isHistory, setIsHistory] = useState(false);
  const [onwardTransit, setOnwardTransit] = useState('');
  const [returnTransit, setReturnTransit] = useState('');
  const [hqStayName, setHqStayName] = useState('');
  const [seatMatrix, setSeatMatrix] = useState({}); 

  // Identity Mapping
  const isMaster = user?.is_master || user?.email?.toLowerCase() === 'middlemen1245@gmail.com';
  const theme = {
    bg: isMaster ? 'bg-[#0f172a]' : 'bg-[#f8f9fa]',
    header: isMaster ? 'bg-black/80 border-red-500/20' : 'bg-white/80 border-black/5',
    accent: isMaster ? '#ef4444' : '#A855F7',
    text: isMaster ? 'text-white' : 'text-[#1a0b2e]',
    subtext: isMaster ? 'text-gray-400' : 'text-[#1a0b2e]/40',
    card: isMaster ? 'bg-zinc-900/40 border-red-500/10' : 'bg-white/60 border-white/50',
    btn: isMaster ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-[#1a0b2e] hover:bg-[#A855F7] shadow-black/10'
  };

  const bookedNights = selectedStays.reduce((acc, s) => acc + (s.nights || 0), 0);

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
        
        const u = await tripAPI.auth.getMe();
        setUser(u);
        if (u?.is_master) {
          const mData = await tripAPI.getMasterDashboard();
          setMasterData(mData);
        }

        if (tripData.status === 'completed' || tripData.transaction_id) {
            setIsHistory(true);
            setStep(7); // Synthesis Step
        } else if (tripData.tourists && tripData.tourists.length > 0) {
            setStep(6); // Checkout
        } else if (tripData.itinerary && tripData.itinerary.length > 0) {
            setStep(4); // Passengers
        } else if (tripData.stay_details && tripData.stay_details.length > 0) {
            setStep(3); // AI Plan
        } else if (tripData.transport_details?.onward) {
            setStep(2); // Stays
        } else {
            setStep(1); // Transport
        }

        // Hydrate details
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
            name: t.name, age: t.age?.toString() || '', gender: t.gender || '',
            is_primary: t.is_primary || false, phone: t.phone || '', email: t.email || ''
          })));
        } else {
          // Initialize empty personnel slots based on blueprint payload
          const count = tripData.num_people || 1;
          setPassengers(Array.from({ length: count }, () => ({
            name: '', age: '', gender: '',
            is_primary: false, phone: '', email: ''
          })));
        }

        // Default Master to Command Mode
        if (u?.email === 'middlemen1245@gmail.com') {
          setMasterMode('command');
        }
      } catch (error) {
        toast.error('Identity Matrix Malfunction');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [tripId, navigate]);

  // Background AI Sync for immediate Phase 1 availability
  useEffect(() => {
    const syncData = async () => {
       if (step === 1 && transportOptions.onward.length === 0 && !orchestrating) {
          setOrchestrating(true);
          try {
             const r = await tripAPI.orchestrateTrip(tripId);
             setTransportOptions(r.transports);
             setStayOptions(r.stays);
             setItinerary(r.itinerary);
          } catch (e) {
             console.error("AI Sync Delayed:", e);
          } finally {
             setOrchestrating(false);
          }
       }
    };
    syncData();
  }, [step, tripId, transportOptions.onward.length, orchestrating]);

  // Camera Sector Controller: Authorize hardware vision for Phase 5
  useEffect(() => {
    let currentStream = null;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Hardware Vision Malfunction:", err);
      }
    };

    if (step === 5 && !capturedImage) {
      startCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, capturedImage]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="text-center">
        <LoaderCircle className="w-12 h-12 text-[#A855F7] animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1a0b2e]/30">Synchronizing Hub Data...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-1000 font-sans selection:bg-[#A855F7]/30`}>
      {/* Global Mission HUD */}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <header className="mb-16">
          <div className="flex items-center justify-between mb-12">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${isMaster ? 'bg-gradient-to-tr from-black to-red-600 shadow-red-900/40' : 'bg-gradient-to-tr from-[#1a0b2e] to-[#A855F7] shadow-[#A855F7]/20'}`}>
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${isMaster ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20'}`}>
                    Mission: {trip?.destination}
                  </span>
                  <span className={`${theme.subtext} font-bold text-xs uppercase tracking-widest`}>Ref: {tripId.slice(-8)}</span>
                </div>
                <h1 className={`text-5xl font-black tracking-tight italic ${theme.text}`}>{isMaster ? 'Command Center' : 'Yatra And Stay Hub'}</h1>
              </div>
            </motion.div>

            {user?.is_master && (
              <div className="bg-white/40 border border-white/50 p-2 rounded-3xl flex items-center gap-2">
                <Button 
                  onClick={() => setMasterMode('planner')} 
                  className={`rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-widest transition-all ${masterMode === 'planner' ? 'bg-[#A855F7] text-white shadow-xl' : 'bg-transparent text-[#1a0b2e]/40'}`}
                >
                  Agency Planner
                </Button>
                <Button 
                  onClick={() => setMasterMode('command')} 
                  className={`rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-widest transition-all ${masterMode === 'command' ? 'bg-[#1a0b2e] text-white shadow-xl' : 'bg-transparent text-[#1a0b2e]/40'}`}
                >
                  Command Center
                </Button>
              </div>
            )}
          </div>

          <div className={`flex items-center justify-center space-x-4 mb-20 ${isHistory || masterMode === 'command' || step > 6 ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100 h-auto'}`}>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center font-black text-xs">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${step >= s ? 'bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/20' : 'bg-white/40 text-[#1a0b2e]/20 border border-white/50'}`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 6 && <div className={`w-8 h-[2px] mx-1 rounded-full ${step > s ? 'bg-[#A855F7]' : 'bg-[#1a0b2e]/5'}`} />}
              </div>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {user?.is_master && masterMode === 'command' ? (
            <motion.div key="master" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass-card rounded-[2.5rem] p-8 bg-[#A855F7]/5 border-[#A855F7]/20">
                     <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-2">Global Agencies</p>
                     <p className="text-4xl font-black text-[#1a0b2e]">{masterData.agencies?.length || 0}</p>
                  </div>
                  <div className="glass-card rounded-[2.5rem] p-8 bg-[#1a0b2e]/5">
                     <p className="text-[10px] font-black uppercase text-[#1a0b2e]/40 tracking-widest mb-2">Total Mission Settlement</p>
                     <p className="text-4xl font-black text-[#1a0b2e]">
                        {Object.values(masterData.stats || {}).reduce((acc, s) => acc + (s.total || 0), 0)}
                     </p>
                  </div>
                  <div className="glass-card rounded-[2.5rem] p-8 bg-green-500/5 border-green-500/20">
                     <p className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-2">Global Completed</p>
                     <p className="text-4xl font-black text-[#1a0b2e]">
                        {Object.values(masterData.stats || {}).reduce((acc, s) => acc + (s.completed || 0), 0)}
                     </p>
                  </div>
               </div>

               <div className="glass-card rounded-[3.5rem] overflow-hidden border-red-500/10 shadow-2xl bg-zinc-900/60">
                  <table className="w-full text-left">
                     <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Agency Identification</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Operational Stats</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Access Protocol</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {masterData.agencies?.map((agency) => (
                           <tr key={agency.user_id} className="hover:bg-white/5 transition-colors">
                              <td className="p-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center font-black text-red-500 border border-red-500/20">{agency.organization?.[0] || 'A'}</div>
                                    <div><p className="font-black text-white">{agency.organization || 'Independent'}</p><p className="text-xs font-bold text-gray-500">{agency.email}</p></div>
                                 </div>
                              </td>
                              <td className="p-8 font-black text-gray-300">
                                 Missions: {masterData.stats?.[agency.user_id]?.total || 0} • Settled: {masterData.stats?.[agency.user_id]?.completed || 0}
                              </td>
                              <td className="p-8">
                                 <Button 
                                    onClick={async () => {
                                      const res = await tripAPI.toggleAgency(agency.user_id);
                                      toast.success(`Protocol ${res.is_active ? 'Authorized' : 'Revoked'}`);
                                      const newData = await tripAPI.getMasterDashboard();
                                      setMasterData(newData);
                                    }}
                                    className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${agency.is_active !== false ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'} text-white`}
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
            <div className="space-y-12">
               {step === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <RealTransportSearch options={transportOptions} initialPeople={trip?.num_people || 1} tripData={trip} onSelect={(val) => { setSelectedTransport(val); setStep(2); }} />
                    <div className="fixed bottom-24 right-12 z-50">
                       {orchestrating && <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20"><LoaderCircle className="w-4 h-4 text-[#A855F7] animate-spin" /><span className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]">Syncing Data...</span></div>}
                    </div>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <RealStaySearch options={stayOptions} tripData={trip} numDays={trip?.num_days || 1} onSelect={(opt) => { if (bookedNights + opt.nights > trip?.num_days) return; setSelectedStays(prev => [...prev, opt]); }} />
                    <div className="flex justify-center"><Button onClick={() => setStep(3)} disabled={selectedStays.length === 0} className="bg-[#1a0b2e] text-white rounded-full h-20 px-12 font-black text-xl shadow-2xl">Confirm Stays & View AI Plan</Button></div>
                 </motion.div>
               )}

               {step === 3 && (
                 <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <div className="grid grid-cols-1 gap-8">
                       {(Array.isArray(itinerary) ? itinerary : itinerary?.days || []).map((day, idx) => (
                          <div key={idx} className="glass-card rounded-[3.5rem] p-12 border-white/50 shadow-2xl">
                             <div className="flex justify-between mb-8"><h4 className="text-3xl font-black text-[#1a0b2e] tracking-tight">Day {idx + 1}: {day.title}</h4><Calendar className="w-8 h-8 text-[#A855F7]" /></div>
                             <div className="space-y-6">{(day.activities || []).map((act, i) => <div key={i} className={`flex gap-4 p-4 rounded-2xl ${isMaster ? 'bg-red-500/5 text-white' : 'bg-[#1a0b2e]/5 text-[#1a0b2e]'} font-bold`}>{act}</div>)}</div>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-center"><Button onClick={() => setStep(4)} className="bg-[#1a0b2e] text-white rounded-full h-24 px-16 font-black text-2xl shadow-xl">Proceed to Personnel Matrix</Button></div>
                 </motion.div>
               )}

               {step === 4 && (
                 <motion.div key="step4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {passengers.map((p, idx) => (
                          <div key={idx} className={`glass-card rounded-[3rem] p-10 border transition-all duration-500 hover:shadow-2xl ${theme.card}`}>
                             <div className="flex justify-between items-center mb-10">
                                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.subtext}`}>Personnel Index {idx + 1}</h3>
                                <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-black/5">
                                   <label className={`text-[10px] font-black uppercase ${theme.subtext}`}>Official Lead</label>
                                   <input 
                                     type="checkbox" 
                                     checked={p.is_primary} 
                                     onChange={(e) => { 
                                       const n = [...passengers]; 
                                       // Only one primary allowed
                                       n.forEach((pax, i) => pax.is_primary = (i === idx ? e.target.checked : false));
                                       setPassengers(n); 
                                     }} 
                                     className={`w-6 h-6 rounded-lg transition-all ${isMaster ? 'accent-red-600' : 'accent-[#A855F7]'}`} 
                                   />
                                </div>
                             </div>
                             
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <Label className={`text-[10px] font-black uppercase ml-4 ${theme.subtext}`}>Full Legal Name</Label>
                                   <Input placeholder="Enter Identity" value={p.name} onChange={(e) => { const n = [...passengers]; n[idx].name = e.target.value; setPassengers(n); }} className={`h-16 px-6 font-bold text-lg rounded-[1.5rem] border-none ${isMaster ? 'bg-white/5 text-white' : 'bg-[#1a0b2e]/5 text-[#1a0b2e]'}`} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                      <Label className={`text-[10px] font-black uppercase ml-4 ${theme.subtext}`}>Temporal Age</Label>
                                      <Input placeholder="Age" type="number" value={p.age} onChange={(e) => { const n = [...passengers]; n[idx].age = e.target.value; setPassengers(n); }} className={`h-16 px-6 font-bold text-lg rounded-[1.5rem] border-none ${isMaster ? 'bg-white/5 text-white' : 'bg-[#1a0b2e]/5 text-[#1a0b2e]'}`} />
                                   </div>
                                   <div className="space-y-2">
                                      <Label className={`text-[10px] font-black uppercase ml-4 ${theme.subtext}`}>Biological Identity</Label>
                                      <select value={p.gender} onChange={(e) => { const n = [...passengers]; n[idx].gender = e.target.value; setPassengers(n); }} className={`w-full h-16 rounded-[1.5rem] border-none px-6 font-bold text-lg outline-none appearance-none ${isMaster ? 'bg-white/5 text-white' : 'bg-[#1a0b2e]/5 text-[#1a0b2e]'}`}>
                                         <option value="" className="bg-gray-900">Gender</option>
                                         <option value="Male" className="bg-gray-900">Male</option>
                                         <option value="Female" className="bg-gray-900">Female</option>
                                      </select>
                                   </div>
                                </div>

                                <AnimatePresence>
                                   {p.is_primary && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-6 pt-6 border-t border-black/5">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                               <Label className={`text-[10px] font-black uppercase ml-4 ${theme.accent === '#ef4444' ? 'text-red-500' : 'text-[#A855F7]'}`}>Emergency Vector (Phone)</Label>
                                               <Input placeholder="+91 XXXXX XXXXX" value={p.phone} onChange={(e) => { const n = [...passengers]; n[idx].phone = e.target.value; setPassengers(n); }} className={`h-16 px-6 font-bold text-lg rounded-[1.5rem] border-2 ${isMaster ? 'bg-red-500/10 border-red-500/30 text-white' : 'bg-[#A855F7]/10 border-[#A855F7]/30 text-[#1a0b2e]'}`} />
                                            </div>
                                            <div className="space-y-2">
                                               <Label className={`text-[10px] font-black uppercase ml-4 ${theme.accent === '#ef4444' ? 'text-red-500' : 'text-[#A855F7]'}`}>Digital Relay (Email)</Label>
                                               <Input placeholder="explorer@identity.com" value={p.email} onChange={(e) => { const n = [...passengers]; n[idx].email = e.target.value; setPassengers(n); }} className={`h-16 px-6 font-bold text-lg rounded-[1.5rem] border-2 ${isMaster ? 'bg-red-500/10 border-red-500/30 text-white' : 'bg-[#A855F7]/10 border-[#A855F7]/30 text-[#1a0b2e]'}`} />
                                            </div>
                                         </div>
                                         <div className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${isMaster ? 'bg-red-500/5 border-red-500/20' : 'bg-[#A855F7]/5 border-[#A855F7]/20'}`}>
                                            <input type="checkbox" id={`face-${idx}`} checked={faceCaptureEnabled} onChange={(e) => setFaceCaptureEnabled(e.target.checked)} className={`w-6 h-6 rounded-lg ${isMaster ? 'accent-red-600' : 'accent-[#A855F7]'}`} />
                                            <label htmlFor={`face-${idx}`} className={`text-[10px] font-black uppercase tracking-widest cursor-pointer ${isMaster ? 'text-red-500' : 'text-[#A855F7]'}`}>Activate Visual Identity Checkpoint (Optional Face Photo)</label>
                                         </div>
                                      </motion.div>
                                   )}
                                </AnimatePresence>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-center pt-12">
                       <Button onClick={async () => { 
                         const lead = passengers.find(px => px.is_primary);
                         if (!lead || !lead.phone) { toast.error("Primary Vector Unidentified"); return; }
                         try { setLoading(true); await tripAPI.updateTouristDetails(tripId, { tourists: passengers, contact_phone: lead.phone, contact_email: lead.email || '' }); setStep(faceCaptureEnabled ? 5 : 6); } catch(e) { toast.error("Hub Sync Failed"); } finally { setLoading(false); }
                       }} disabled={loading} className={`rounded-full h-24 px-20 font-black text-2xl transition-all hover:scale-105 ${theme.btn} text-white`}>
                          {loading ? 'Authorizing Matrix...' : 'Proceed to Mission Finalization'}
                       </Button>
                    </div>
                 </motion.div>
               )}

               {step === 5 && (
                 <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                    <div className="max-w-xl mx-auto glass-card rounded-[3rem] overflow-hidden border-2 border-[#A855F7]/30 shadow-2xl relative">
                       {!capturedImage ? (
                          <div className="aspect-video bg-black flex items-center justify-center">
                             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" onLoadedMetadata={() => videoRef.current?.play()} />
                             <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-white/50 rounded-full" />
                          </div>
                       ) : <img src={capturedImage} className="w-full aspect-video object-cover" />}
                    </div>
                    <div className="flex flex-col items-center gap-6">
                       {!capturedImage ? <Button onClick={() => { const c = document.createElement('canvas'); const v = videoRef.current; if (v) { c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); setCapturedImage(c.toDataURL()); } }} className="bg-[#A855F7] text-white rounded-full h-20 px-12 font-black text-xl shadow-xl">Capture Image</Button>
                       : <div className="flex gap-4"><Button onClick={() => setCapturedImage(null)} variant="outline" className="rounded-full h-16 px-10 font-bold">Retake</Button><Button onClick={() => setStep(6)} className="bg-[#1a0b2e] text-white rounded-full h-16 px-12 font-bold shadow-xl">Confirm Photo</Button></div>}
                    </div>
                 </motion.div>
               )}

               {step === 6 && (
                 <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 text-center">
                    <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight mb-8">Settlement Manifest</h2>
                    <div className="max-w-sm mx-auto space-y-8 mb-12">
                        <div className="space-y-3">
                           <Label className={`text-[10px] font-black uppercase tracking-widest ${isMaster ? 'text-red-500' : 'text-[#A855F7]'}`}>Strategic Agency Charge (Credits)</Label>
                           <Input 
                              type="number" 
                              value={manualAgencyCharge} 
                              onChange={(e) => setManualAgencyCharge(Number(e.target.value))} 
                              className={`h-16 text-center text-2xl font-black rounded-[2rem] border-2 transition-all ${isMaster ? 'bg-red-500/5 border-red-500/30 text-white' : 'bg-[#A855F7]/5 border-[#A855F7]/30 text-[#1a0b2e]'}`} 
                           />
                        </div>
                        <div className="glass-card p-10 rounded-[3rem] border-[#A855F7]/30 bg-[#A855F7]/5">
                           <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Final Settlement Payload</p>
                           <div className="text-5xl font-black text-[#1a0b2e]">₹{Math.round((selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge).toLocaleString()}</div>
                        </div>
                     </div>
                    <UPIPayment amount={Math.round((selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge)} tripId={tripId} onComplete={async () => { const total = (selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge; const lead = passengers.find(p => p.is_primary) || { phone: '', email: '' }; await tripAPI.confirmPayment(tripId, { transaction_id: "SYNC_" + tripId.slice(-4), total_amount: total, agency_charge: manualAgencyCharge, primary_phone: lead.phone, email: lead.email, secondary_phone: '' }); const f = await tripAPI.getTrip(tripId); setTrip(f); setStep(7); }} />
                 </motion.div>
               )}

               {step === 7 && (
                 <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-20">
                    <div className="flex justify-between items-center mb-12">
                       <div>
                          <h2 className={`text-5xl font-black tracking-tighter mb-2 ${theme.text}`}>Mission Synthesized</h2>
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.subtext}`}>Ref: {tripId.slice(-8)} • Settlement Verified</p>
                       </div>
                       <div className="flex gap-4">
                          <Button 
                             onClick={async () => {
                               if (!customerRef.current) return;
                               const dataUrl = await toPng(customerRef.current, { quality: 1.0, pixelRatio: 2 });
                               const link = document.createElement('a');
                               link.download = `Voyager_Blueprint_${trip?.destination}.png`;
                               link.href = dataUrl;
                               link.click();
                               toast.success('Voyager Blueprint Captured');
                             }} 
                             className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white shadow-xl"
                          >
                             Capture Voyager Copy
                          </Button>
                          <Button 
                             onClick={downloadAgencyManifest} 
                             className={`h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-2xl ${theme.btn}`}
                          >
                             Capture Master Copy
                          </Button>
                          <Button 
                             onClick={() => navigate('/history')} 
                             className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest bg-zinc-900/10 text-[#1a0b2e] border border-[#1a0b2e]/10 hover:bg-zinc-900/20 transition-all"
                          >
                             Operations Complete
                          </Button>
                       </div>
                    </div>

                    {/* Voyager Blueprint Sector (Customer Copy) */}
                    <div ref={customerRef} className="max-w-4xl mx-auto bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-gray-100 mb-20">
                       <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-16 text-white flex justify-between items-center">
                          <div className="space-y-3">
                             <h3 className="text-5xl font-black italic tracking-tighter uppercase">Voyager Blueprint</h3>
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Official Travel Authorization</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase opacity-40 mb-2">Destination Vector</p>
                             <p className="text-4xl font-black italic">{trip?.destination || 'HYP-X'}</p>
                          </div>
                       </div>
                       <div className="p-16 space-y-16">
                          <div className="grid grid-cols-2 gap-12">
                             <div className="space-y-12">
                                <div>
                                   <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4">Onward Vector</p>
                                   <p className="text-xl font-bold text-gray-800">{selectedTransport.onward?.title || 'SYNCHRONIZED'}</p>
                                   <p className="text-xs font-bold text-gray-400 mt-1">{selectedTransport.onward?.description || 'Class-A Mission'}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4">Mission HQ (Stay)</p>
                                   <div className="space-y-4">
                                      {selectedStays.map((s, i) => (
                                         <p key={i} className="text-xl font-bold text-gray-800">Day {i + 1}: {s.hotel_name || s.name}</p>
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-12">
                                <div>
                                   <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4">Payload Personnel</p>
                                   <div className="space-y-3">
                                      {(passengers.length > 0 ? passengers : trip?.tourists)?.map((p, i) => (
                                         <p key={i} className="font-bold text-gray-700 text-lg">{p.name} <span className="text-xs opacity-30 italic">{p.is_primary ? '(Lead)' : ''}</span></p>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="pt-12 border-t border-gray-100 flex justify-between items-end grayscale opacity-30">
                             <div><p className="text-sm font-black italic uppercase">{user?.organization || 'YASH HUB'}</p><p className="text-[8px] font-bold">Authorized Agency Partner</p></div>
                             <p className="text-[8px] font-bold tracking-[0.5em] italic">POWERED BY YASH AI SYNC</p>
                          </div>
                       </div>
                    </div>

                    {/* Agency Master Copy Sector */}
                    <div ref={agencyRef} className={`max-w-4xl mx-auto rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border ${isMaster ? 'border-red-500/20 bg-zinc-900' : 'border-white bg-white/60 backdrop-blur-3xl'}`}>
                       <div className={`${isMaster ? 'bg-red-600' : 'bg-[#1a0b2e]'} p-16 text-white flex justify-between items-center relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                          <div className="relative z-10">
                             <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-2">{user?.organization || 'Y.A.S.H Hub'}</h3>
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Operational Master Record</p>
                          </div>
                          <div className="text-right relative z-10">
                             {capturedImage && <img src={capturedImage} className="w-24 h-24 rounded-3xl border-4 border-white/20 object-cover ml-auto mb-4 hover:scale-110 transition-transform cursor-pointer" />}
                             <p className="text-3xl font-black italic mb-1">SETTLED: ₹{(trip?.total_amount || 0).toLocaleString()}</p>
                             <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">ID: {trip?.transaction_id || 'LOCAL-SYNC'}</p>
                          </div>
                       </div>
                       
                       <div className="p-16 space-y-16">
                          <div className="grid grid-cols-3 gap-8">
                             <div className={`p-8 rounded-[2.5rem] border ${isMaster ? 'bg-white/5 border-white/10' : 'bg-[#1a0b2e]/5 border-black/5'}`}>
                                <p className={`text-[9px] font-black uppercase mb-3 tracking-widest ${isMaster ? 'text-red-500' : 'text-[#A855F7]'}`}>Personnel Payload</p>
                                <p className={`text-2xl font-black italic ${theme.text}`}>{(passengers.length || trip?.tourists?.length || 0)} Matrix Points</p>
                             </div>
                             <div className={`p-8 rounded-[2.5rem] border ${isMaster ? 'bg-white/5 border-white/10' : 'bg-[#1a0b2e]/5 border-black/5'}`}>
                                <p className={`text-[9px] font-black uppercase mb-3 tracking-widest ${isMaster ? 'text-red-500' : 'text-[#A855F7]'}`}>Settlement Status</p>
                                <p className="text-2xl font-black italic text-green-500">FULLY SECURED</p>
                             </div>
                             <div className={`p-8 rounded-[2.5rem] border ${isMaster ? 'bg-white/5 border-white/10' : 'bg-[#1a0b2e]/5 border-black/5'}`}>
                                <p className={`text-[9px] font-black uppercase mb-3 tracking-widest ${isMaster ? 'text-red-500' : 'text-[#A855F7]'}`}>Mission Context</p>
                                <p className={`text-2xl font-black italic ${theme.text}`}>{trip?.destination} Vector</p>
                             </div>
                          </div>

                          <div className={`rounded-[3.5rem] overflow-hidden border ${isMaster ? 'border-white/10' : 'border-black/5'}`}>
                             <table className="w-full text-left">
                                <thead className={`${isMaster ? 'bg-white/5' : 'bg-[#1a0b2e]/[0.02]'} border-b ${isMaster ? 'border-white/10' : 'border-black/5'}`}>
                                   <tr>
                                      <th className={`p-8 text-[10px] font-black uppercase tracking-widest ${isMaster ? 'text-gray-500' : 'text-gray-400'}`}>Personnel Matrix</th>
                                      <th className={`p-8 text-[10px] font-black uppercase tracking-widest ${isMaster ? 'text-gray-500' : 'text-gray-400'}`}>Profile</th>
                                      <th className={`p-8 text-[10px] font-black uppercase tracking-widest ${isMaster ? 'text-gray-500' : 'text-gray-400'}`}>Emergency Contact</th>
                                   </tr>
                                </thead>
                                <tbody className={`divide-y ${isMaster ? 'divide-white/5' : 'divide-black/5'}`}>
                                   {(passengers.length > 0 ? passengers : (trip?.tourists || [])).map((p, i) => (
                                      <tr key={i} className={`hover:${isMaster ? 'bg-white/5' : 'bg-black/[0.01]'} transition-colors`}>
                                         <td className="p-8">
                                            <div className="flex items-center gap-4">
                                               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${isMaster ? 'bg-red-500/10 text-red-500' : 'bg-[#A855F7]/10 text-[#A855F7]'}`}>
                                                  {i + 1}
                                               </div>
                                               <div>
                                                  <p className={`font-black tracking-tight ${theme.text}`}>{p.name}</p>
                                                  {p.is_primary && <p className="text-[8px] font-black uppercase text-green-500 tracking-widest">Authorized Lead</p>}
                                               </div>
                                            </div>
                                         </td>
                                         <td className="p-8 font-bold text-gray-500 uppercase text-xs">{p.age} Y • {p.gender}</td>
                                         <td className={`p-8 font-black ${theme.text}`}>{p.phone || 'N/A'}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                       <div className="p-12 text-center border-t border-black/5 opacity-10">
                          <p className={`text-[10px] font-black tracking-[1em] uppercase italic ${theme.text}`}>Y.A.S.H Hub System Architecture</p>
                       </div>
                    </div>
                 </motion.div>
               )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden transition-all duration-1000">
        <div className={`absolute top-[5%] right-[5%] w-[900px] h-[900px] rounded-full blur-[150px] transition-all duration-1000 ${isMaster ? 'bg-red-900/10' : 'bg-[#fdfafb]'}`} />
        <div className={`absolute top-[20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 animate-pulse transition-all duration-1000 ${isMaster ? 'bg-black' : 'bg-[#f3e8ff]'}`} />
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#A855F7]/20 to-transparent mb-8" />
        <p className="text-2xl font-black text-[#1a0b2e] tracking-tighter">Y.A.S.H</p>
        <p className="text-[10px] font-black uppercase text-[#A855F7]/40 tracking-widest">crafted by KPN Studio</p>
      </footer>
    </div>
  );
};

export default TripPlanner;
