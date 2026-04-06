import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
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
  const [transactionId, setTransactionId] = useState('');

  const bookedNights = selectedStays.reduce((acc, s) => acc + (s.nights || 0), 0);
  const remainingNights = (trip?.num_days || 0) - bookedNights;

  const maskAadhar = (val) => {
    if (!val) return 'N/A';
    if (val.length < 4) return val;
    return `XXXX-XXXX-${val.slice(-4)}`;
  };

  const generateAgencyManifest = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Block (Navy)
    doc.setFillColor(26, 11, 46);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Y.A.S.H AGENCY COMMAND', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(200);
    doc.text(`INTERNAL MASTER RECORD • REF: ${tripId.toUpperCase()}`, pageWidth / 2, 35, { align: 'center' });
    
    // Status Badge
    doc.setFillColor(168, 85, 247);
    doc.roundedRect(pageWidth - 60, 15, 50, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('AUTHENTICATED', pageWidth - 35, 21.5, { align: 'center' });

    // metadata
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 60);
    doc.line(20, 65, 190, 65);

    // Primary Contacts
    doc.setFontSize(14);
    doc.setTextColor(168, 85, 247);
    doc.text('[MISSION LEADS]', 20, 75);
    
    doc.setFontSize(10);
    doc.setTextColor(26, 11, 46);
    const primaryP = passengers.filter(p => p.is_primary);
    primaryP.forEach((pp, i) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${i+1}. ${pp.name || 'N/A'}`, 25, 85 + (i * 12));
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Contact: ${pp.phone || 'N/A'} | Email: ${pp.email || 'N/A'}`, 25, 90 + (i * 12));
        doc.setTextColor(26, 11, 46);
    });

    const paxY = 90 + (primaryP.length * 12) + 15;
    
    // Passenger Matrix Table
    doc.setFillColor(245, 243, 255);
    doc.rect(20, paxY, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('ID', 25, paxY + 6.5);
    doc.text('PASSENGER NAME', 40, paxY + 6.5);
    doc.text('AGE', 120, paxY + 6.5);
    doc.text('PROOF', 140, paxY + 6.5);

    doc.setFont('helvetica', 'normal');
    passengers.forEach((p, i) => {
      const rowY = paxY + 10 + (i * 8);
      if (i % 2 === 0) {
        doc.setFillColor(250, 249, 255);
        doc.rect(20, rowY, 170, 8, 'F');
      }
      doc.text(`${i + 1}`, 25, rowY + 5.5);
      doc.text(`${p.name || 'Anonymous'}`, 40, rowY + 5.5);
      doc.text(`${p.age || '0'}`, 120, rowY + 5.5);
      doc.text(`${p.proof || 'N/A'}`, 140, rowY + 5.5);
    });

    const financeY = paxY + 10 + (passengers.length * 8) + 15;
    doc.setFontSize(14);
    doc.setTextColor(168, 85, 247);
    doc.text('[FINANCIAL RECONCILIATION]', 20, financeY);
    
    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(0.5);
    doc.line(20, financeY + 2, 190, financeY + 2);
    
    doc.setFontSize(10);
    doc.setTextColor(26, 11, 46);
    const totalAmount = (selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge;
    
    doc.text(`Agency Service Fee: Rs. ${manualAgencyCharge.toLocaleString()}`, 25, financeY + 12);
    doc.text(`Payment Vector: ${transactionId ? 'BLOCKCHAIN_VERIFIED' : 'PENDING_SETTLEMENT'}`, 25, financeY + 19);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL SETTLEMENT: Rs. ${totalAmount.toLocaleString()}`, 20, financeY + 32);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('CONFIDENTIAL • SYSTEM GENERATED MASTER RECORD', 105, 285, { align: 'center' });

    doc.save(`AGENCY_COPY_${tripId}.pdf`);
    toast.success('Internal Master Record Saved.');
  };

  const generateCustomerManifest = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fetch latest agency stats
    let agencyName = "Y.A.S.H Agency";
    let agencyContact = "N/A";
    try {
        const userRes = await tripAPI.auth.getMe();
        agencyName = userRes.organization || agencyName;
        agencyContact = userRes.phone || agencyContact;
    } catch(e) {}

    // Header Block (Branded Purple)
    doc.setFillColor(168, 85, 247);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Y.A.S.H', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(230, 230, 230);
    doc.setFont('helvetica', 'normal');
    doc.text(`MISSION: ${trip.destination.toUpperCase()} • EXPLORER BLUEPRINT`, pageWidth / 2, 42, { align: 'center' });

    // Voyage Overview Box
    doc.setFillColor(250, 248, 255);
    doc.roundedRect(20, 70, 170, 25, 4, 4, 'F');
    doc.setFontSize(10);
    doc.setTextColor(168, 85, 247);
    doc.setFont('helvetica', 'bold');
    doc.text('VOYAGE OVERVIEW', 25, 78);
    doc.setTextColor(26, 11, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(`Origin: ${trip.from_location} | Duration: ${trip.num_days} Days | Travelers: ${trip.num_people}`, 25, 85);

    // Itinerary Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('THE JOURNEY PATH', 20, 110);
    doc.line(20, 113, 60, 113);

    itinerary.forEach((day, i) => {
      const boxY = 120 + (i * 22);
      if (boxY > 260) return; // Basic page overflow check

      doc.setFillColor(252, 250, 255);
      doc.roundedRect(25, boxY, 160, 18, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(168, 85, 247);
      doc.setFont('helvetica', 'bold');
      doc.text(`D${day.day}`, 30, boxY + 11);
      
      doc.setTextColor(26, 11, 46);
      doc.setFontSize(10);
      doc.text(`${day.title}`, 45, boxY + 7);
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text(`${day.summary || 'Strategic travel sync complete.'}`, 45, boxY + 13);
    });

    const totalAmount = (selectedTransport.onward?.price || 0) + (selectedTransport.return?.price || 0) + (selectedTransport.agency_charge || 0) + selectedStays.reduce((acc, s) => acc + (s.price || 0), 0) + manualAgencyCharge;
    
    // Settlement Footer
    doc.setFillColor(26, 11, 46);
    doc.rect(0, 250, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`PACKAGE VALUATION: Rs. ${totalAmount.toLocaleString()}`, 20, 265);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200);
    doc.text(`Official Agency: ${agencyName}`, 20, 275);
    doc.text(`Support Vector: ${agencyContact}`, 20, 280);
    
    doc.setFontSize(10);
    doc.setTextColor(168, 85, 247);
    doc.text('Y.A.S.H', pageWidth - 40, 278);

    doc.save(`VOYAGE_PLAN_${tripId}.pdf`);
    toast.success('Customer Blueprint Saved.');
  };

  const downloadAgencyManifest = () => {
    generateAgencyManifest();
  };

  const downloadCustomerManifest = async () => {
    generateCustomerManifest();
    try {
      // Mock sending or actually hitting manifest endpoint
      await tripAPI.sendManifest({ trip_id: tripId, type: 'customer' });
      toast.success('Customer Blueprint Dispatched.');
    } catch (err) {
      toast.info('Blueprint saved. Notification relay offline.');
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
        setPassengers(Array.from({ length: travelerCount }).map(() => ({ 
          name: '', 
          age: '', 
          gender: '', 
          proof: '', 
          is_primary: false,
          phone: '',
          email: '' 
        })));
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
                {/* Explorer Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/50 bg-white/30 relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[#A855F7]/10">
                      <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
                         <label className="text-[10px] font-black uppercase text-[#A855F7]/40 group-hover:text-[#A855F7] transition-colors cursor-pointer">Official Primary</label>
                         <input 
                           type="checkbox"
                           className="w-5 h-5 accent-[#A855F7] cursor-pointer"
                           checked={p.is_primary}
                           onChange={(e) => {
                             const newP = [...passengers];
                             newP[idx].is_primary = e.target.checked;
                             setPassengers(newP);
                           }}
                         />
                      </div>

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

                        {/* Dynamic Contact Sector */}
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
                                    value={p.phone}
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
                                    value={p.email}
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
              </div>
              <div className="flex justify-center pt-20">
                <Button
                  onClick={async () => {
                    const incomplete = passengers.some(p => !p.name || !p.age || !p.gender || !p.proof);
                    const primaries = passengers.filter(p => p.is_primary);
                    const missingPhone = primaries.some(p => !p.phone);

                    if (incomplete) {
                      toast.error('Manifest Incomplete: All traveler data required.');
                      return;
                    }
                    if (primaries.length === 0) {
                      toast.error('Identity Protocol: Please mark at least one "Official Primary" contact.');
                      return;
                    }
                    if (missingPhone) {
                      toast.error('Identity Protocol: Primary traveler requires a valid phone number.');
                      return;
                    }

                    try {
                      setLoading(true);
                      const leadPrimary = primaries[0];
                      await tripAPI.updateTouristDetails(tripId, {
                        tourists: passengers.map(p => ({
                          ...p,
                          age: parseInt(p.age) || 0
                        })),
                        contact_phone: leadPrimary.phone,
                        contact_email: leadPrimary.email || '',
                        secondary_phone: primaries[1]?.phone || '',
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

                  const leadPrimary = passengers.find(p => p.is_primary) || passengers[0];
                  await tripAPI.confirmPayment(tripId, {
                    transaction_id: transactionId,
                    total_amount: totalAmount,
                    agency_charge: manualAgencyCharge,
                    primary_phone: leadPrimary.phone || '',
                    email: leadPrimary.email || '',
                    secondary_phone: passengers.filter(p => p.is_primary)[1]?.phone || ''
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
