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
import { MapPin, Calendar, Users, Sparkles, CheckCircle2, LoaderCircle, Send, ShieldCheck } from 'lucide-react';

const TripPlanner = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const customerRef = useRef(null);
  const agencyRef = useRef(null);
  const [trip, setTrip] = useState(null);
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
        const data = await tripAPI.getTrip(tripId);
        setTrip(data);
        
        if (data.transaction_id || data.status === 'completed') {
            setIsHistory(true);
            setTransactionId(data.transaction_id || '');
            setManualAgencyCharge(data.agency_charge || 0);
            
            setSelectedTransport({
              onward: data.transport_details?.onward || null,
              return: data.transport_details?.return || null,
              cab_mode: data.transport_details?.cab_mode || null,
              agency_charge: data.transport_details?.agency_charge || 0,
              num_cabs: data.num_cabs || 1,
              number_plate: data.number_plate || ''
            });
            setSelectedStays(data.stay_details || []);
            setItinerary(data.itinerary || []);

            if (data.tourists && data.tourists.length > 0) {
              setPassengers(data.tourists.map(t => ({
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
            setPassengers(Array.from({ length: data.num_people || 1 }).map(() => ({ 
              name: '', age: '', gender: '', proof: '', is_primary: false, phone: '', email: '' 
            })));
            setManualAgencyCharge(data.agency_charge || 0);
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
                  <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/50 bg-white/30">
                    <h3 className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-6">Passenger {idx + 1}</h3>
                    <input type="text" placeholder="Full Name" className="w-full bg-white/50 border border-white/50 rounded-xl h-14 px-6 font-bold mb-4" value={p.name} onChange={(e) => { const newP = [...passengers]; newP[idx].name = e.target.value; setPassengers(newP); }} />
                    <div className="grid grid-cols-3 gap-4">
                       <input type="number" placeholder="Age" className="bg-white/50 border border-white/50 rounded-xl h-12 px-6 font-bold text-sm" value={p.age} onChange={(e) => { const newP = [...passengers]; newP[idx].age = e.target.value; setPassengers(newP); }} />
                       <select className="bg-white/50 border border-white/50 rounded-xl h-12 px-6 font-bold text-sm" value={p.gender} onChange={(e) => { const newP = [...passengers]; newP[idx].gender = e.target.value; setPassengers(newP); }}><option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option></select>
                       <input type="text" placeholder="Aadhar ID" className="bg-white/50 border border-white/50 rounded-xl h-12 px-6 font-bold text-sm" value={p.proof} onChange={(e) => { const newP = [...passengers]; newP[idx].proof = e.target.value; setPassengers(newP); }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-20">
                <Button onClick={async () => { await tripAPI.updateTouristDetails(tripId, { tourists: passengers }); setStep(6); }} className="bg-[#1a0b2e] text-white rounded-full h-24 px-20 font-black text-2xl">Next: Settle Credits</Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <UPIPayment amount={1000} tripId={tripId} onComplete={() => setStep(7)} />
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-[#1a0b2e] tracking-tighter mb-2">Voyage Manifest</h2>
                </div>
                <div className="flex gap-4">
                  <Button onClick={downloadAgencyManifest} className="bg-[#1a0b2e] text-white h-14 rounded-2xl px-8 flex items-center gap-3 font-bold"><ShieldCheck className="w-5 h-5" /> Download Agency Copy</Button>
                  <Button onClick={downloadCustomerManifest} className="bg-[#A855F7] text-white h-14 rounded-2xl px-8 flex items-center gap-3 font-bold"><Send className="w-5 h-5" /> Send Customer Copy</Button>
                </div>
              </div>

              <div className="fixed -left-[4000px] top-0 pointer-events-none">
                <div ref={customerRef} className="w-[800px] bg-white p-20">
                  <div className="bg-[#A855F7] p-12 -mx-20 -mt-20 mb-12 flex justify-between items-center text-white">
                    <div><h1 className="text-4xl font-black">Y.A.S.H AGENCY</h1><p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-1">Voyager Blueprint</p></div>
                  </div>
                  <div className="space-y-12">
                    {itinerary.map((day, idx) => (
                      <div key={idx}><h3 className="text-xl font-black text-[#A855F7] mb-2 uppercase">Day {idx + 1}: {day.title}</h3><div className="space-y-3">{day.activities.map((act, i) => <p key={i} className="text-sm text-gray-700 font-bold">• {act}</p>)}</div></div>
                    ))}
                  </div>
                </div>

                <div ref={agencyRef} className="w-[1000px] bg-white p-20">
                  <div className="bg-[#1a0b2e] p-12 -mx-20 -mt-20 mb-12 text-white"><h1 className="text-4xl font-black text-center">Y.A.S.H AGENCY</h1><p className="text-center text-sm font-bold opacity-40 uppercase tracking-widest mt-2">Logistics Master Record</p></div>
                  <table className="w-full mb-12 overflow-hidden rounded-2xl border border-gray-100">
                    <thead className="bg-gray-50 text-left"><tr><th className="p-4 text-xs font-black uppercase text-gray-500">Explorer</th><th className="p-4 text-xs font-black uppercase text-gray-500">Age/Sex</th><th className="p-4 text-xs font-black uppercase text-gray-500">Proof ID</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">{passengers.map((p, idx) => <tr key={idx}><td className="p-4 font-bold">{p.name || 'Anonymous'}</td><td className="p-4 text-sm font-bold">{p.age}/{p.gender}</td><td className="p-4 text-mono text-xs">{p.proof}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
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
