import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Car, MapPin, Navigation, IndianRupee, Clock, ArrowRight, CheckCircle2, Star, Users, Briefcase, ShieldCheck, ExternalLink, Info, LoaderCircle, Sparkles, Plus, Minus, Phone, Mail, X, History, Trash2, Edit2, Save, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useUI } from '../context/UIContext';

const RealTransportSearch = ({ options, onSelect, initialPeople = 1 }) => {
  const { setTaskbarSlid } = useUI();
  const [activeTab, setActiveTab] = useState('onward');
  const [selections, setSelections] = useState({ onward: null, return: null });
  const [cabMode, setCabMode] = useState(null); // 'agency' or 'self'
  const [agencyCabCharge, setAgencyCabCharge] = useState('');
  const [bookingOverlay, setBookingOverlay] = useState(null); // { option, type }
  const [editPeople, setEditPeople] = useState(initialPeople);

  // Detect transport type from first onward option
  const onwardOptions = options?.onward || [];
  const returnOptions = options?.return || [];
  const transportType = onwardOptions[0]?.type?.toLowerCase() || 'train';
  const isCab = transportType === 'car' || transportType === 'taxi' || transportType === 'cab';

  const handleCabSelect = (option) => {
    if (cabMode === 'agency' && agencyCabCharge) {
      onSelect({ onward: option, return: null, cab_mode: 'agency', agency_charge: parseFloat(agencyCabCharge) });
    } else if (cabMode === 'self') {
      onSelect({ onward: option, return: null, cab_mode: 'self', agency_charge: 0 });
    }
  };

  const handleBookingClick = (option, type) => {
    setBookingOverlay({ option, type });
    setEditPeople(initialPeople);
    setTaskbarSlid(true);
  };

  const confirmBooking = () => {
    if (!bookingOverlay) return;
    const finalOption = { 
      ...bookingOverlay.option, 
      num_people: editPeople, 
      total_price: bookingOverlay.option.price * editPeople 
    };
    setSelections(prev => ({ ...prev, [bookingOverlay.type]: finalOption }));
    setBookingOverlay(null);
    setTaskbarSlid(false);
    if (bookingOverlay.type === 'onward' && returnOptions.length > 0) {
      setActiveTab('return');
    }
  };

  const closeOverlay = () => {
    setBookingOverlay(null);
    setTaskbarSlid(false);
  };

  const handleFinalContinue = () => {
    if (selections.onward) {
      onSelect({ onward: selections.onward, return: selections.return, cab_mode: null, agency_charge: 0 });
    }
  };

  // ─── TRAIN CARD (IRCTC Style) ───
  const TrainCard = ({ option, index, type }) => {
    const isSelected = selections[type]?.option_id === option.option_id;
    return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className={`glass-card rounded-[2rem] p-0 group transition-all duration-500 overflow-hidden ${isSelected ? 'border-[#A855F7] shadow-lg shadow-[#A855F7]/20 border-2' : 'hover:border-[#A855F7]/30 border-white/50'}`}
    >
      <div className="bg-[#A855F7]/5 px-8 py-4 flex items-center justify-between border-b border-[#A855F7]/10">
        <div className="flex items-center gap-3">
          <Train className="w-5 h-5 text-[#A855F7]" />
          <span className="font-black text-[#1a0b2e] text-sm">{option.provider || 'Indian Railways'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#A855F7] px-3 py-1 rounded-full">{option.class || 'SL'}</span>
          {option.seats_hint && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
              option.seats_hint.toLowerCase().includes('avail') ? 'bg-green-100 text-green-600' : 
              option.seats_hint.toLowerCase().includes('wl') ? 'bg-red-100 text-red-500' : 
              'bg-yellow-100 text-yellow-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                option.seats_hint.toLowerCase().includes('avail') ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-[9px] font-black uppercase tracking-widest">{option.seats_hint}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.departure_time?.split(' ')[1] || '06:00'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.from_location}</p>
            <p className="text-[9px] text-[#1a0b2e]/30 mt-0.5">{option.departure_time?.split(' ')[0] || ''}</p>
          </div>
          <div className="flex-1 px-6 flex flex-col items-center">
            <p className="text-[9px] font-black text-[#A855F7]/60 uppercase tracking-widest mb-2">{option.duration || 'Direct'}</p>
            <div className="w-full flex items-center">
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#A855F7]/20 to-[#A855F7]/60" />
              <ArrowRight className="w-4 h-4 text-[#A855F7] mx-1 shrink-0" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.arrival_time?.split(' ')[1] || '14:00'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.to_location}</p>
            <p className="text-[9px] text-[#1a0b2e]/30 mt-0.5">{option.arrival_time?.split(' ')[0] || ''}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-[#1a0b2e]/5">
          <div className="text-3xl font-black text-[#A855F7]">₹{(option.price || 0).toLocaleString()}</div>
          <Button onClick={() => handleBookingClick(option, type)} variant={isSelected ? "default" : "outline"} className={`rounded-full px-6 font-bold uppercase tracking-wider text-[10px] ${isSelected ? 'bg-[#A855F7] text-white' : 'border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7] hover:text-white'}`}>
             {isSelected ? 'Selected' : 'Book Now'}
          </Button>
        </div>
      </div>
    </motion.div>
  )};

  // ─── FLIGHT CARD ───
  const FlightCard = ({ option, index, type }) => {
    const isSelected = selections[type]?.option_id === option.option_id;
    return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className={`glass-card rounded-[2rem] p-0 group transition-all duration-500 overflow-hidden ${isSelected ? 'border-[#A855F7] shadow-lg shadow-[#A855F7]/20 border-2' : 'hover:border-[#A855F7]/30 border-white/50'}`}
    >
      <div className="bg-[#A855F7]/5 px-8 py-4 flex items-center justify-between border-b border-[#A855F7]/10">
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5 text-[#A855F7]" />
          <span className="font-black text-[#1a0b2e] text-sm">{option.provider || 'Airline'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#A855F7] px-3 py-1 rounded-full">{option.class || 'Economy'}</span>
          {option.seats_hint && <span className="text-[9px] font-bold text-[#A855F7]/60 bg-[#A855F7]/10 px-3 py-1 rounded-full">{option.seats_hint}</span>}
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.departure_time?.split(' ')[1] || '08:00'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.from_location}</p>
          </div>
          <div className="flex-1 px-6 flex flex-col items-center">
            <p className="text-[9px] font-black text-[#A855F7]/60 uppercase tracking-widest mb-2">{option.duration || 'Non-stop'}</p>
            <div className="w-full flex items-center">
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#A855F7]/20 to-[#A855F7]/60" />
              <Plane className="w-4 h-4 text-[#A855F7] mx-1 shrink-0 -rotate-45" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.arrival_time?.split(' ')[1] || '10:30'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.to_location}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-[#1a0b2e]/5">
          <div className="text-3xl font-black text-[#A855F7]">₹{(option.price || 0).toLocaleString()}</div>
          <Button onClick={() => handleBookingClick(option, type)} variant={isSelected ? "default" : "outline"} className={`rounded-full px-6 font-bold uppercase tracking-wider text-[10px] ${isSelected ? 'bg-[#A855F7] text-white' : 'border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7] hover:text-white'}`}>
             {isSelected ? 'Selected' : 'Book Now'}
          </Button>
        </div>
      </div>
    </motion.div>
  )};

  // ─── CAB SECTION ───
  if (isCab) {
    return (
      <div className="space-y-12 py-10">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Ground Transport</h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">Select your cab arrangement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setCabMode('agency')}
            className={`glass-card rounded-[2.5rem] p-10 cursor-pointer transition-all duration-500 ${cabMode === 'agency' ? 'border-[#A855F7] shadow-xl shadow-[#A855F7]/20' : 'border-white/50 hover:border-[#A855F7]/30'}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${cabMode === 'agency' ? 'bg-[#A855F7] text-white' : 'bg-[#A855F7]/10 text-[#A855F7]'}`}>
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1a0b2e]">Agency Cab</h3>
                <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider">We arrange the cab for you</p>
              </div>
            </div>
            {cabMode === 'agency' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]/60 mb-3 block">Cab Charge (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={agencyCabCharge}
                  onChange={(e) => setAgencyCabCharge(e.target.value)}
                  placeholder="Enter cab charge"
                  className="w-full bg-white/50 border-2 border-[#A855F7]/20 text-[#1a0b2e] rounded-2xl h-16 px-6 font-black text-xl placeholder:text-[#A855F7]/30 placeholder:font-medium focus:border-[#A855F7] focus:outline-none transition-all"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setCabMode('self')}
            className={`glass-card rounded-[2.5rem] p-10 cursor-pointer transition-all duration-500 ${cabMode === 'self' ? 'border-[#A855F7] shadow-xl shadow-[#A855F7]/20' : 'border-white/50 hover:border-[#A855F7]/30'}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${cabMode === 'self' ? 'bg-[#A855F7] text-white' : 'bg-[#A855F7]/10 text-[#A855F7]'}`}>
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1a0b2e]">Self Arranged</h3>
                <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider">You'll arrange your own transport</p>
              </div>
            </div>
          </motion.div>
        </div>

        {cabMode === 'agency' && onwardOptions.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1a0b2e]">Available Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {onwardOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                  onClick={() => handleCabSelect(option)}
                  className="glass-card rounded-[2rem] p-8 cursor-pointer group hover:border-[#A855F7]/30 transition-all duration-500"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Car className="w-6 h-6 text-[#A855F7]" />
                    <span className="font-black text-[#1a0b2e]">{option.provider || 'Cab Service'}</span>
                  </div>
                  <p className="text-[#1a0b2e]/40 text-sm font-medium mb-4">{option.from_location} → {option.to_location}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#1a0b2e]/5">
                    <div className="text-2xl font-black text-[#A855F7]">₹{(option.price || 0).toLocaleString()}</div>
                    <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center group-hover:bg-[#A855F7] transition-all duration-500">
                      <ArrowRight className="w-5 h-5 text-[#A855F7] group-hover:text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {cabMode === 'self' && (
          <div className="flex justify-center">
            <Button
              onClick={() => onSelect({ onward: { type: 'car', cab_mode: 'self', price: 0, provider: 'Self Arranged', agency_charge: 0 } })}
              className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] hover:scale-105 transition-all duration-500 rounded-full h-20 px-16 font-black text-xl shadow-2xl shadow-[#A855F7]/20"
            >
              Continue Without Cab Booking
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ─── TRAIN / FLIGHT LIST ───
  const activeList = activeTab === 'onward' ? onwardOptions : returnOptions;

  return (
    <div className="space-y-8 py-10 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">
            {transportType === 'train' ? 'Live Train Booking' : 'Live Flight Booking'}
          </h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Secure your transit manifest
          </p>
        </div>
        <div className="flex items-center bg-white/50 backdrop-blur border border-white/50 p-2 rounded-full">
          <button
            onClick={() => setActiveTab('onward')}
            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'onward' ? 'bg-[#A855F7] text-white shadow-lg' : 'text-[#1a0b2e]/60 hover:text-[#1a0b2e]'}`}
          >
            Onward
          </button>
          <button
            onClick={() => setActiveTab('return')}
            disabled={returnOptions.length === 0}
            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'return' ? 'bg-[#A855F7] text-white shadow-lg' : 'text-[#1a0b2e]/60 hover:text-[#1a0b2e]'} ${returnOptions.length === 0 && 'opacity-30 cursor-not-allowed'}`}
          >
            Return
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
        {activeList.map((option, index) => (
          transportType === 'train'
            ? <TrainCard key={index} option={option} index={index} type={activeTab} />
            : <FlightCard key={index} option={option} index={index} type={activeTab} />
        ))}
      </div>

      {activeList.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {transportType === 'train' ? <Train className="w-10 h-10 text-[#A855F7]" /> : <Plane className="w-10 h-10 text-[#A855F7]" />}
          </div>
          <p className="text-[#1a0b2e]/40 font-bold">Scanning live network...</p>
        </div>
      )}

      {/* STICKY CONTINUE FOOTER */}
      <AnimatePresence>
        {selections.onward && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <div className="glass-card shadow-2xl rounded-full p-3 pl-8 flex items-center gap-6 pointer-events-auto border-[#A855F7]/30 border-2 bg-white/90 backdrop-blur-xl">
               <div>
                  <p className="text-[10px] font-black tracking-widest text-[#A855F7] uppercase">Onward Selected</p>
                  <p className="font-bold text-[#1a0b2e] text-sm">{selections.onward.provider}</p>
               </div>
               {selections.return && (
                 <div className="pl-4 border-l border-[#1a0b2e]/10">
                    <p className="text-[10px] font-black tracking-widest text-[#A855F7] uppercase">Return Selected</p>
                    <p className="font-bold text-[#1a0b2e] text-sm">{selections.return.provider}</p>
                 </div>
               )}
               <Button onClick={handleFinalContinue} className="bg-[#1a0b2e] text-white hover:bg-[#A855F7] h-14 px-10 rounded-full font-black text-sm uppercase tracking-widest transition-all">
                  Book & Continue To Stays
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEEP BOOKING OVERLAY */}
      <AnimatePresence>
        {bookingOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0b2e]/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative"
            >
              <button 
                onClick={closeOverlay} 
                className="absolute top-8 right-8 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-[#1a0b2e] font-black"
              >X</button>
              
              <div className="w-16 h-16 bg-[#A855F7]/10 text-[#A855F7] rounded-3xl flex items-center justify-center mb-6">
                {transportType === 'train' ? <Train className="w-8 h-8" /> : <Plane className="w-8 h-8" />}
              </div>
              
              <h3 className="text-3xl font-black text-[#1a0b2e] mb-2">Review Reservation</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a0b2e]/40 mb-8">Confirm passenger and pricing rules</p>
              
              <div className="space-y-4 mb-8">
                <div className="glass-card rounded-[2rem] p-6 border-dashed border-2 border-[#1a0b2e]/10">
                   <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-[#1a0b2e]/50">Carrier</span>
                      <span className="font-black text-[#1a0b2e]">{bookingOverlay.option.provider}</span>
                   </div>
                   <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-[#1a0b2e]/50">Route</span>
                      <span className="font-black text-[#1a0b2e]">{bookingOverlay.option.from_location} → {bookingOverlay.option.to_location}</span>
                   </div>
                   <div className="flex justify-between items-center mb-4 border-t border-[#1a0b2e]/10 pt-4">
                      <span className="font-bold text-[#1a0b2e]/50">Base Price (Per Person)</span>
                      <span className="font-black text-[#1a0b2e]">₹{bookingOverlay.option.price.toLocaleString()}</span>
                   </div>
                </div>

                <div className="glass-card rounded-[2rem] p-6 bg-[#A855F7]/5 border-2 border-[#A855F7]/20">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-[#A855F7] tracking-widest">Number of Travelers</span>
                      <div className="flex items-center gap-4 bg-white rounded-full p-1 border border-[#A855F7]/20">
                         <button onClick={() => setEditPeople(Math.max(1, editPeople - 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold">-</button>
                         <span className="font-black text-[#1a0b2e] w-4 text-center">{editPeople}</span>
                         <button onClick={() => setEditPeople(editPeople + 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold">+</button>
                      </div>
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t border-[#A855F7]/10">
                      <span className="font-black text-[#1a0b2e]">Total Segment Price</span>
                      <span className="font-black text-[#A855F7] text-3xl">₹{(bookingOverlay.option.price * editPeople).toLocaleString()}</span>
                   </div>
                </div>
              </div>
              
              <Button onClick={confirmBooking} className="w-full bg-[#1a0b2e] hover:bg-[#A855F7] text-white h-20 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-[#A855F7]/20">
                Confirm & Add to Manifest
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTransportSearch;
