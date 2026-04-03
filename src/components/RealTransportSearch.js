import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Car, Globe, Train, Plane, CheckCircle2, Navigation, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Hub Fallback Dictionary
const hubMapping = {
  'munnar': 'Kochi',
  'manali': 'Chandigarh',
  'shimla': 'Chandigarh',
  'ooty': 'Coimbatore',
  'wayanad': 'Kozhikode',
  'gulmarg': 'Srinagar',
  'pahalgam': 'Srinagar',
  'kasol': 'Chandigarh',
  'dharamshala': 'Pathankot',
  'mcledoganj': 'Pathankot',
  'leh': 'Leh',
  'ladakh': 'Leh',
  'hampi': 'Hospet',
  'ajanta': 'Aurangabad',
  'ellora': 'Aurangabad'
};

const RealTransportSearch = ({ tripDetails, bookedTransport, setBookedTransport, onNext }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeDestination, setActiveDestination] = useState(tripDetails.destination);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const dest = tripDetails.destination.toLowerCase().trim();
    if (hubMapping[dest]) {
      setActiveDestination(hubMapping[dest]);
      setIsFallback(true);
    }
  }, [tripDetails.destination]);

  const getSearchUrl = () => {
    const { from_location, start_date, num_people, transport_mode } = tripDetails;
    const destCity = activeDestination;
    const formattedDate = start_date.replace(/-/g, '');
    
    if (transport_mode === 'flight') {
      const fromCode = getAirportCode(from_location);
      const toCode = getAirportCode(destCity);
      return `https://www.ixigo.com/search/result/flight/${fromCode}-${toCode}/${formattedDate}/${num_people}/0/0/E`;
    } else if (transport_mode === 'train') {
      const fromSlug = from_location.toLowerCase().replace(/\s+/g, '-');
      const toSlug = destCity.toLowerCase().replace(/\s+/g, '-');
      const dateFormatted = new Date(start_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).toLowerCase().replace(/\s+/g, '-');
      return `https://www.ixigo.com/trains/${fromSlug}-to-${toSlug}/${dateFormatted}`;
    }
    return `https://www.google.com/search?q=luxury+cab+from+${from_location}+to+${destCity}`;
  };

  const getAirportCode = (city) => {
    const codes = { 
      'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR', 'goa': 'GOI',
      'kochi': 'COK', 'chandigarh': 'IXC', 'coimbatore': 'CJB', 'srinagar': 'SXR',
      'hyderabad': 'HYD', 'pune': 'PNQ', 'chennai': 'MAA', 'kolkata': 'CCU'
    };
    return codes[city.toLowerCase().trim()] || 'DEL';
  };

  const handleConfirm = () => {
    if (!bookedTransport.booking_id) return;
    onNext();
  };

  return (
    <div className="card-3d glass-card rounded-[3.5rem] p-10 md:p-16 border-white/20 shadow-2xl relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9370DB]/10 rounded-full blur-[100px] -mr-32 -mt-32 pulse-bg" />
      
      <div className="flex items-center gap-6 mb-12 relative z-10">
        <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center shadow-2xl border border-white/20 group-hover:bg-[#9370DB] transition-all duration-700">
          <Plane className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Transport Hub</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Secure Protocol v3.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
        <div className="space-y-10">
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group hover:border-[#9370DB]/30 transition-all duration-500">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#9370DB]/10 rounded-full blur-[80px]" />
            
            <h3 className="text-[#9370DB] font-black text-[10px] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
               <Sparkles className="w-3 h-3" /> Hub AI Smart Routing
            </h3>
            
            {isFallback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-start gap-4"
              >
                <Navigation className="w-6 h-6 text-[#9370DB] shrink-0 mt-1" />
                <p className="text-xs text-white/60 font-medium leading-relaxed">
                  Smart Routing: Direct transport to <span className="text-white font-black underline decoration-[#9370DB] underline-offset-4">{tripDetails.destination}</span> is limited. We are routing via the major Hub: <span className="text-white font-black uppercase">{activeDestination}</span>.
                </p>
              </motion.div>
            )}

            <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed italic">
               Access the Hub-curated Ixigo search orchestration. AI has calibrated your source, destination, and personnel for a premium booking experience.
            </p>
            
            <a 
              href={getSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setShowBookingForm(true)}
            >
              <Button className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-2xl h-20 text-lg font-black shadow-2xl shadow-black/50">
                Search via {activeDestination} Hub <ExternalLink className="w-5 h-5 ml-3" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center">
               <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Origin Node</p>
               <p className="text-base font-black text-white">{tripDetails.from_location}</p>
             </div>
             <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center">
               <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Target Node</p>
               <p className="text-base font-black text-white">{activeDestination}</p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {(showBookingForm || bookedTransport.booking_id) ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-10 bg-white/5 p-10 rounded-[3.5rem] border border-white/10 relative group"
            >
              <div className="space-y-3">
                <h3 className="text-white font-black text-3xl tracking-tight">Deployment Verification</h3>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Hub AI will synchronize via Reference ID</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9370DB]">Reference ID (PNR/Flight No)</Label>
                  <Input 
                    value={bookedTransport.booking_id} 
                    onChange={(e) => setBookedTransport({...bookedTransport, booking_id: e.target.value})} 
                    placeholder="Enter Reference ID" 
                    className="glass-input h-20 text-center font-black text-2xl uppercase tracking-widest placeholder:text-white/10" 
                  />
                  <p className="text-[9px] text-white/20 font-bold italic leading-loose">Service provider and arrival time auto-synced by Hub Concierge protocol.</p>
                </div>
                
                <div className="pt-6">
                  <Button onClick={handleConfirm} className="w-full bg-[#9370DB] text-white hover:bg-[#B19CD9] hover:scale-105 transition-all duration-500 rounded-3xl h-20 font-black text-xl shadow-2xl shadow-[#9370DB]/30">
                    <CheckCircle2 className="w-6 h-6 mr-3" /> Synchronize Stay Hub
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] p-16 text-center bg-white/5 group hover:border-[#9370DB]/30 transition-all duration-500">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
                <Navigation className="w-10 h-10 text-white/10 group-hover:text-[#9370DB] transition-colors" />
               </div>
               <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.4em] leading-loose max-w-[250px]">
                 Waiting for Deployment Authorization... <br/>
                 <span className="text-[#9370DB]/40 font-bold block mt-4">Initiate Hub Search to continue</span>
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTransportSearch;