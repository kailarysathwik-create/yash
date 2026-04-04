import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Car, ArrowRight, Clock, MapPin, IndianRupee, Users, ChevronDown, ShieldCheck, Zap, Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RealTransportSearch = ({ options, onSelect }) => {
  const [cabMode, setCabMode] = useState(null); // 'agency' or 'self'
  const [agencyCabCharge, setAgencyCabCharge] = useState('');

  // Detect transport type from first option
  const transportType = options?.[0]?.type?.toLowerCase() || 'train';
  const isCab = transportType === 'car' || transportType === 'taxi' || transportType === 'cab';

  const handleCabSelect = (option) => {
    if (cabMode === 'agency' && agencyCabCharge) {
      onSelect({ ...option, cab_mode: 'agency', agency_charge: parseFloat(agencyCabCharge) });
    } else if (cabMode === 'self') {
      onSelect({ ...option, cab_mode: 'self', agency_charge: 0 });
    }
  };

  // ─── TRAIN CARD (IRCTC Style) ───
  const TrainCard = ({ option, index }) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => onSelect(option)}
      className="glass-card rounded-[2rem] p-0 cursor-pointer group hover:border-[#A855F7]/30 transition-all duration-500 overflow-hidden"
    >
      <div className="bg-[#A855F7]/5 px-8 py-4 flex items-center justify-between border-b border-[#A855F7]/10">
        <div className="flex items-center gap-3">
          <Train className="w-5 h-5 text-[#A855F7]" />
          <span className="font-black text-[#1a0b2e] text-sm">{option.provider || 'Indian Railways'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#A855F7] px-3 py-1 rounded-full">
            {option.class || 'SL'}
          </span>
          {option.seats_hint && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              option.seats_hint?.toLowerCase().includes('avail') ? 'bg-green-100 text-green-600' :
              option.seats_hint?.toLowerCase().includes('rac') ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-500'
            }`}>{option.seats_hint}</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          {/* Departure */}
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.departure_time?.split(' ')[1] || '06:00'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.from_location}</p>
            <p className="text-[9px] text-[#1a0b2e]/30 mt-0.5">{option.departure_time?.split(' ')[0] || ''}</p>
          </div>

          {/* Duration Arrow */}
          <div className="flex-1 px-6 flex flex-col items-center">
            <p className="text-[9px] font-black text-[#A855F7]/60 uppercase tracking-widest mb-2">
              {option.duration || 'Direct'}
            </p>
            <div className="w-full flex items-center">
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#A855F7]/20 to-[#A855F7]/60" />
              <ArrowRight className="w-4 h-4 text-[#A855F7] mx-1 shrink-0" />
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.arrival_time?.split(' ')[1] || '14:00'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.to_location}</p>
            <p className="text-[9px] text-[#1a0b2e]/30 mt-0.5">{option.arrival_time?.split(' ')[0] || ''}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-[#1a0b2e]/5">
          <div className="text-3xl font-black text-[#A855F7]">₹{(option.price || 0).toLocaleString()}</div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-[#1a0b2e]/30 uppercase">per person</span>
            <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center group-hover:bg-[#A855F7] group-hover:text-white transition-all duration-500">
              <ArrowRight className="w-5 h-5 text-[#A855F7] group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ─── FLIGHT CARD ───
  const FlightCard = ({ option, index }) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => onSelect(option)}
      className="glass-card rounded-[2rem] p-0 cursor-pointer group hover:border-[#A855F7]/30 transition-all duration-500 overflow-hidden"
    >
      <div className="bg-[#A855F7]/5 px-8 py-4 flex items-center justify-between border-b border-[#A855F7]/10">
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5 text-[#A855F7]" />
          <span className="font-black text-[#1a0b2e] text-sm">{option.provider || 'Airline'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#A855F7] px-3 py-1 rounded-full">
            {option.class || 'Economy'}
          </span>
          {option.seats_hint && (
            <span className="text-[9px] font-bold text-[#A855F7]/60 bg-[#A855F7]/10 px-3 py-1 rounded-full">{option.seats_hint}</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <p className="text-2xl font-black text-[#1a0b2e]">{option.departure_time?.split(' ')[1] || '08:00'}</p>
            <p className="text-[10px] font-bold text-[#1a0b2e]/40 uppercase tracking-wider mt-1">{option.from_location}</p>
          </div>

          <div className="flex-1 px-6 flex flex-col items-center">
            <p className="text-[9px] font-black text-[#A855F7]/60 uppercase tracking-widest mb-2">
              {option.duration || 'Non-stop'}
            </p>
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
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-[#1a0b2e]/30 uppercase">per person</span>
            <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center group-hover:bg-[#A855F7] transition-all duration-500">
              <ArrowRight className="w-5 h-5 text-[#A855F7] group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ─── CAB SECTION ───
  if (isCab) {
    return (
      <div className="space-y-12 py-10">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Ground Transport</h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">Select your cab arrangement</p>
        </div>

        {/* Cab Mode Selection */}
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

        {/* Available options list (if agency) */}
        {cabMode === 'agency' && options.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1a0b2e]">Available Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
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

        {/* Self arranged - just proceed */}
        {cabMode === 'self' && (
          <div className="flex justify-center">
            <Button
              onClick={() => onSelect({ type: 'car', cab_mode: 'self', price: 0, provider: 'Self Arranged', agency_charge: 0 })}
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
  return (
    <div className="space-y-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">
            {transportType === 'train' ? 'Available Trains' : 'Available Flights'}
          </h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {options.length} option{options.length !== 1 ? 's' : ''} found • Select to book
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
            <ShieldCheck className="w-4 h-4" /> Verified
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
            <Zap className="w-4 h-4" /> Best Price
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {options.map((option, index) => (
          transportType === 'train'
            ? <TrainCard key={index} option={option} index={index} />
            : <FlightCard key={index} option={option} index={index} />
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {transportType === 'train' ? <Train className="w-10 h-10 text-[#A855F7]" /> : <Plane className="w-10 h-10 text-[#A855F7]" />}
          </div>
          <p className="text-[#1a0b2e]/40 font-bold">Loading available options...</p>
        </div>
      )}
    </div>
  );
};

export default RealTransportSearch;
