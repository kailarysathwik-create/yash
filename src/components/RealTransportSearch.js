import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Car, Globe, Train, Plane, CheckCircle2, Navigation, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Hub Fallback Dictionary (Static - move outside component)
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
  'leh': 'Leh', // Leh has an airport
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
    if (!bookedTransport.booking_id) {
      return;
    }
    onNext();
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/60 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#9370DB]/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 rounded-3xl bg-[#9370DB]/10 flex items-center justify-center shadow-inner">
          <Plane className="w-7 h-7 text-[#9370DB]" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Transport Hub</h2>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Securing Access Hub</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-inner relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#9370DB]/5 rounded-full blur-2xl" />
            
            <h3 className="text-[#9370DB] font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
               <Sparkles className="w-3 h-3" /> Hub AI Routing
            </h3>
            
            {isFallback && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-[#9370DB]/5 border border-[#9370DB]/20 rounded-2xl flex items-start gap-3"
              >
                <Navigation className="w-5 h-5 text-[#9370DB] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#9370DB] font-bold leading-relaxed">
                  Smart Routing: Direct transport to <span className="underline">{tripDetails.destination}</span> is limited. we are routing via the closest major Hub: <span className="text-[#9370DB] uppercase">{activeDestination}</span>.
                </p>
              </motion.div>
            )}

            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
               Access the Hub-curated Ixigo search. <br/> AI has pre-configured your source, destination, and personnel for a seamless booking.
            </p>
            
            <a 
              href={getSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setShowBookingForm(true)}
            >
              <Button className="w-full bg-[#9370DB] text-white hover:scale-[1.02] transition-all rounded-2xl h-16 font-black shadow-xl shadow-[#9370DB]/20">
                Search via {activeDestination} Hub <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-white/30 rounded-2xl border border-white/50 text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Origin Point</p>
               <p className="text-sm font-black text-gray-700">{tripDetails.from_location}</p>
             </div>
             <div className="p-5 bg-white/30 rounded-2xl border border-white/50 text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Hub Finish</p>
               <p className="text-sm font-black text-gray-700">{activeDestination}</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {(showBookingForm || bookedTransport.booking_id) ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-white/20 p-8 rounded-[2rem] border-l-4 border-[#9370DB]">
              <div className="space-y-2">
                <h3 className="text-gray-800 font-black text-2xl tracking-tight">Deployment Verification</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Hub AI will sync with your Reference ID</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9370DB]">Reference ID (PNR/Flight No)</Label>
                  <Input 
                    value={bookedTransport.booking_id} 
                    onChange={(e) => setBookedTransport({...bookedTransport, booking_id: e.target.value})} 
                    placeholder="Enter Reference ID" 
                    className="bg-white/50 border-gray-100 h-16 rounded-2xl font-black text-lg focus:border-[#9370DB] shadow-sm text-gray-700" 
                  />
                  <p className="text-[9px] text-gray-400 font-medium">Service provider and and arrival details will be auto-synced by Hub Concierge.</p>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleConfirm} className="w-full bg-gray-800 text-white hover:bg-black rounded-2xl h-16 font-black shadow-lg transition-transform active:scale-95">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-[#9370DB]" /> Synchronize Stay Hub
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#9370DB]/20 rounded-[2.5rem] p-12 text-center bg-white/10">
               <div className="w-16 h-16 rounded-full bg-[#9370DB]/5 flex items-center justify-center mb-6 animate-pulse">
                <Navigation className="w-7 h-7 text-[#9370DB]/30" />
               </div>
               <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-[200px]">
                 Waiting for Deployment Authorization... <br/>
                 Initiate Ixigo Hub Search to proceed.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTransportSearch;