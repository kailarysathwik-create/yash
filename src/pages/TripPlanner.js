import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { tripAPI } from '../api/tripAPI';
import RealTransportSearch from '../components/RealTransportSearch';
import RealStaySearch from '../components/RealStaySearch';
import UPIPayment from '../components/UPIPayment';
import { Button } from '../components/ui/button';
import { MapPin, Calendar, Users, Sparkles, Navigation, CheckCircle2, ChevronRight, LoaderCircle, Globe, Download, Send, ShieldCheck } from 'lucide-react';

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
  const [selectedStays, setSelectedStays] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [orchestrating, setOrchestrating] = useState(false);
  const [manualAgencyCharge, setManualAgencyCharge] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [primaryContact, setPrimaryContact] = useState({ phone: '', name: '' });
  const [secondaryContact, setSecondaryContact] = useState({ phone: '', email: '' });
  const [transactionId, setTransactionId] = useState('');

  const bookedNights = selectedStays.reduce((acc, s) => acc + (s.nights || 0), 0);
  const remainingNights = (trip?.num_days || 0) - bookedNights;

  const maskAadhar = (val) => {
    if (!val) return 'N/A';
    if (val.length < 4) return val;
    return `XXXX-XXXX-${val.slice(-4)}`;
  };

  const generateAgencyManifest = () => {
    let manifest = `--- Y.A.S.H AGENCY MANIFEST (INTERNAL) ---\n`;
    manifest += `Generated: ${new Date().toLocaleString()}\n`;
    manifest += `Trip ID: ${tripId}\n\n`;

    manifest += `[PRIMARY CONTACT]\n`;
    manifest += `Name: ${primaryContact.name || 'N/A'}\n`;
    manifest += `Phone: ${primaryContact.phone || 'N/A'}\n`;
    manifest += `Email: ${secondaryContact.email || 'N/A'}\n\n`;

    manifest += `[PASSENGER MATRIX]\n`;
    passengers.forEach((p, i) => {
      manifest += `${i + 1}. ${p.name || 'Anonymous'} | Age: ${p.age || 'N/A'} | Gender: ${p.gender || 'N/A'} | Aadhar: ${p.proof}\n`;
    });

    manifest += `\n[TRANSPORT LOGISTICS]\n`;
    manifest += `Onward: ${selectedTransport.onward?.provider} (${selectedTransport.onward?.vehicle_id || 'N/A'}) | Base: ₹${selectedTransport.onward?.price}\n`;
    if (selectedTransport.return) {
      manifest += `Return: ${selectedTransport.return?.provider} (${selectedTransport.return?.vehicle_id || 'N/A'}) | Base: ₹${selectedTransport.return?.price}\n`;
    }

    manifest += `\n[STAY INVENTORY]\n`;
    selectedStays.forEach((s, i) => {
      manifest += `${i + 1}. ${s.name} | Total Cost: ₹${s.price}\n`;
    });

    manifest += `\n[FINANCIAL RECONCILIATION]\n`;
    manifest += `Agency Markup: ₹${manualAgencyCharge}\n`;
    manifest += `Transaction ID: ${transactionId || 'OFFLINE_SETTLEMENT'}\n`;
    const totalAmount = (selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge;
    manifest += `TOTAL REVENUE: ₹${totalAmount.toLocaleString()}\n`;

    return manifest;
  };

  const generateCustomerManifest = () => {
    let manifest = `--- YOUR VOYAGE PLAN: ${trip.destination.toUpperCase()} ---\n`;
    manifest += `Synthesized by Y.A.S.H Agency\n\n`;

    manifest += `[TRAVELER DETAILS]\n`;
    manifest += `Lead Traveler: ${primaryContact.name || 'N/A'}\n`;
    manifest += `Personnel: ${passengers.length} Traveler(s)\n\n`;

    manifest += `[ITINERARY SUMMARY]\n`;
    itinerary.forEach(day => {
      manifest += `Day ${day.day}: ${day.title}\n`;
      day.activities?.forEach(act => {
        manifest += `  - ${typeof act === 'string' ? act : (act.time + ': ' + act.task)}\n`;
      });
      manifest += `\n`;
    });

    manifest += `[ACCOMMODATION & TRANSIT]\n`;
    manifest += `Onward: ${selectedTransport.onward?.provider} (${selectedTransport.onward?.type})\n`;
    if (selectedTransport.return) manifest += `Return: ${selectedTransport.return?.provider} (${selectedTransport.return?.type})\n`;
    selectedStays.forEach(s => {
      manifest += `Stay: ${s.name} (${s.location})\n`;
    });

    manifest += `\n[TOTAL PACKAGE PRICE]\n`;
    const totalAmount = (selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge;
    manifest += `Total Credits: ₹${totalAmount.toLocaleString()} (All Inclusive)\n`;

    return manifest;
  };

  const downloadAgencyManifest = () => {
    const text = generateAgencyManifest();
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `AGENCY_COPY_${tripId}.txt`;
    document.body.appendChild(element);
    element.click();
    toast.success('Agency Matrix Downloaded');
  };

  const downloadCustomerManifest = async () => {
    const text = generateCustomerManifest();
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `CUSTOMER_PLAN_${tripId}.txt`;
    document.body.appendChild(element);
    element.click();
    
    try {
      await tripAPI.sendManifest({ manifest: text, emails: [secondaryContact.email], trip_id: tripId });
      toast.success('Customer Narrative Dispatched');
    } catch (err) {
      toast.info('Plan downloaded. Customer notification hub offline.');
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
        const travelerCount = data.num_people || 1;
        setPassengers(Array.from({ length: travelerCount }).map(() => ({ name: '', age: '', gender: '', proof: '' })));
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
                initialPeople={trip?.num_people || 1}
                tripData={trip}
                onSelect={(val) => { setSelectedTransport(val); setStep(3); }}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#1a0b2e]">Nights Booked: {bookedNights} / {trip.num_days}</h3>
                {bookedNights > 0 && (
                  <Button onClick={() => setStep(4)} className="bg-[#A855F7] text-white rounded-full">Continue to Itinerary</Button>
                )}
              </div>
              <RealStaySearch
                options={stayOptions}
                tripData={trip}
                numDays={trip?.num_days || 1}
                onSelect={(opt) => {
                  setSelectedStays(prev => [...prev, opt]);
                  if (bookedNights + opt.nights >= trip.num_days) {
                    setStep(4);
                  } else {
                    toast.info(`Added ${opt.name}. ${trip.num_days - (bookedNights + opt.nights)} nights remaining.`);
                  }
                }}
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
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 rounded-3xl bg-[#A855F7] text-white flex items-center justify-center font-black text-xl shadow-xl shadow-[#A855F7]/20">D{day.day}</div>
                        <h4 className="text-2xl font-black text-[#1a0b2e]">{day.title}</h4>
                      </div>
                      <div className="space-y-3">
                        {day.activities?.map((act, actIdx) => (
                          <div key={actIdx} className="flex gap-4 items-start bg-white/40 p-4 rounded-2xl border border-white/50">
                            <div className="w-2 h-2 rounded-full bg-[#A855F7] mt-2 shadow-[0_0_8px_#A855F7]" />
                            <p className="text-[#1a0b2e]/80 font-bold text-sm">
                              {typeof act === 'object' ? `${act.time || ''} - ${act.task || act.activity || ''}` : act}
                            </p>
                          </div>
                        ))}
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
              <div className="grid grid-cols-1 gap-8">
                {/* Primary Contacts Section */}
                <div className="glass-card rounded-[2.5rem] p-10 border-[#A855F7]/20 border-2">
                  <h3 className="text-xl font-black text-[#1a0b2e] mb-8">Primary Contact Terminal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#A855F7]">Leader Name</label>
                      <input
                        type="text"
                        placeholder="Enter Name"
                        className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-14 px-6 font-bold"
                        value={primaryContact.name}
                        onChange={(e) => setPrimaryContact({ ...primaryContact, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#A855F7]">Primary Phone (Req)</label>
                      <input
                        type="text"
                        placeholder="+91 XXXX"
                        className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-14 px-6 font-bold"
                        value={primaryContact.phone}
                        onChange={(e) => setPrimaryContact({ ...primaryContact, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#A855F7]">Agency Email (Opt)</label>
                      <input
                        type="email"
                        placeholder="email@agency.com"
                        className="w-full bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-14 px-6 font-bold"
                        value={secondaryContact.email}
                        onChange={(e) => setSecondaryContact({ ...secondaryContact, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Explorer Matrix */}
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
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            type="number"
                            placeholder="Age"
                            className="bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-12 px-6 font-bold text-sm"
                            value={p.age}
                            onChange={(e) => {
                              const newP = [...passengers];
                              newP[idx].age = e.target.value;
                              setPassengers(newP);
                            }}
                          />
                          <select
                            className="bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-12 px-6 font-bold text-sm appearance-none"
                            value={p.gender}
                            onChange={(e) => {
                              const newP = [...passengers];
                              newP[idx].gender = e.target.value;
                              setPassengers(newP);
                            }}
                          >
                            <option value="">Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Aadhar ID"
                            className="bg-white/50 border border-white/50 text-[#1a0b2e] rounded-xl h-12 px-6 font-bold text-sm"
                            value={p.proof}
                            onChange={(e) => {
                              const newP = [...passengers];
                              newP[idx].proof = e.target.value;
                              setPassengers(newP);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center pt-20">
                <Button
                  onClick={async () => {
                    // Validation for Mandatory Fields
                    const incomplete = passengers.some(p => !p.name || !p.age || !p.gender || !p.proof);
                    if (incomplete) {
                      toast.error('Please fill all passenger details, including Aadhar ID.');
                      return;
                    }

                    try {
                      setLoading(true);
                      await tripAPI.updateTouristDetails(tripId, {
                        tourists: passengers.map(p => ({
                          ...p,
                          age: parseInt(p.age) || 0
                        })),
                        contact_phone: primaryContact.phone,
                        contact_email: secondaryContact.email,
                        secondary_phone: secondaryContact.phone,
                        agency_charge: manualAgencyCharge,
                        num_cabs: selectedTransport.num_cabs || 1,
                        number_plate: selectedTransport.number_plate || ''
                      });
                      toast.success('Explorer Matrix Synchronized');
                      setStep(6);
                    } catch (err) {
                      toast.error('Matrix Sync Failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-24 px-20 font-black text-2xl shadow-3xl shadow-[#A855F7]/30"
                >
                  {loading ? 'Synchronizing...' : 'Next: Settle Credits & Checkout'}
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
                  {selectedTransport.cab_mode === 'agency' && selectedTransport.agency_charge > 0 && (
                    <div className="card-3d glass-card rounded-[2rem] p-8 border-[#A855F7]/20">
                      <p className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest mb-4">Cab Charge</p>
                      <h3 className="text-2xl font-black text-[#1a0b2e] mb-4">Agency Cab</h3>
                      <div className="text-3xl font-black text-[#A855F7]">₹{(selectedTransport.agency_charge || 0).toLocaleString()}</div>
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
                amount={Math.round((selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge)}
                tripId={tripId}
                onTransactionIdChange={(val) => setTransactionId(val)}
                onComplete={async () => {
                  toast.success('Mission Complete: Credits Settled.');
                  // Finalizing in Supabase with all relational data
                  const totalAmount = Number(selectedTransport.onward?.price || 0) + Number(selectedTransport.return?.price || 0) + Number(selectedTransport.agency_charge || 0) + Number(selectedStays.reduce((acc, s) => acc + (s.price || 0), 0)) + Number(manualAgencyCharge || 0);

                  await tripAPI.confirmPayment(tripId, {
                    transaction_id: transactionId,
                    total_amount: totalAmount,
                    agency_charge: manualAgencyCharge,
                    primary_phone: primaryContact.phone,
                    email: secondaryContact.email || '',
                    secondary_phone: secondaryContact.phone || ''
                  });
                  const freshTrip = await tripAPI.getTrip(tripId);
                  setTrip(freshTrip);
                  setItinerary(freshTrip.itinerary || []);
                  setStep(7);
                  toast.success('Journey Fully Synchronized.');
                }}
              />
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-[#1a0b2e] tracking-tighter mb-2">Voyage Manifest</h2>
                  <p className="text-[#1a0b2e]/50 font-bold">Your journey has been successfully synthesized across the hub matrix.</p>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={downloadAgencyManifest} 
                    className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] h-14 rounded-2xl px-8 flex items-center gap-3 font-bold"
                  >
                    <ShieldCheck className="w-5 h-5" /> Download Agency Copy
                  </Button>
                  <Button 
                    onClick={downloadCustomerManifest} 
                    className="bg-[#A855F7] text-white hover:bg-[#1a0b2e] h-14 rounded-2xl px-8 flex items-center gap-3 font-bold"
                  >
                    <Send className="w-5 h-5" /> Send Customer Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="glass-card rounded-[3.5rem] p-12 border-white/50 shadow-2xl">
                    <div className="flex items-center gap-8 mb-10 pb-8 border-b border-[#1a0b2e]/5">

                      <div className="w-24 h-24 rounded-[2.5rem] bg-[#1a0b2e] text-white flex items-center justify-center font-black text-4xl shadow-3xl shadow-[#1a0b2e]/20">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-4xl font-black text-[#1a0b2e] mb-2">{day.title}</h3>
                        <div className="flex gap-4">
                          <span className="px-4 py-1 bg-purple-100 rounded-full text-[10px] font-black uppercase text-[#A855F7] tracking-widest">{day.activities?.length || 0} Events Synchronized</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {day.activities?.map((activity, actIdx) => (
                        <div key={actIdx} className="group flex gap-8 p-8 rounded-[2.5rem] bg-white/40 border border-white/60 hover:bg-white hover:shadow-xl transition-all duration-500">
                          <div className="font-black text-[#A855F7] text-xl min-w-[120px] pt-1">
                            {typeof activity === 'string' ? activity.split(' - ')[0] : (activity.time || `E${actIdx + 1}`)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-black text-[#1a0b2e] mb-2 group-hover:text-[#A855F7] transition-colors">
                              {typeof activity === 'string' ? (activity.split(' - ')[1] || activity) : activity.task}
                            </h4>
                            {typeof activity === 'object' && activity.details && (
                              <p className="text-[#1a0b2e]/60 font-bold leading-relaxed">{activity.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
