import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Car, Globe, Train, Plane, CheckCircle2, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const RealTransportSearch = ({ tripDetails, bookedTransport, setBookedTransport, onNext }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeDestination, setActiveDestination] = useState(tripDetails.destination);
  const [isFallback, setIsFallback] = useState(false);

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
    'leh': 'Leh', // Leh has an airport
    'ladakh': 'Leh',
    'hampi': 'Hospet',
    'ajanta': 'Aurangabad',
    'ellora': 'Aurangabad'
  };

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
    if (!bookedTransport.booking_id || !bookedTransport.provider) {
      return;
    }
    onNext();
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/60 shadow-xl">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 rounded-3xl bg-[#00BCD4]/10 flex items-center justify-center shadow-inner">
          <Plane className="w-7 h-7 text-[#00BCD4]" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Hub Transport</h2>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Securing Hub Access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-inner relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#00BCD4]/5 rounded-full blur-2xl" />
            
            <h3 className="text-[#00BCD4] font-black text-xs uppercase tracking-widest mb-6">Hub AI Routing</h3>
            
            {isFallback && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-[#00BCD4]/5 border border-[#00BCD4]/20 rounded-2xl flex items-start gap-3"
              >
                <Navigation className="w-5 h-5 text-[#00BCD4] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#00838F] font-bold leading-relaxed">
                  Smart Routing: Direct transport to <span className="underline">{tripDetails.destination}</span> is limited. we are routing via the closest major Hub: <span className="text-[#00BCD4] uppercase">{activeDestination}</span>.
                </p>
              </motion.div>
            )}

            <p className="text-gray-500 text-sm font-medium mb-8">
              Open the Hub-curated search for your preferred {tripDetails.transport_mode} and arrival date.
            </p>
            
            <a 
              href={getSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setShowBookingForm(true)}
            >
              <Button className="w-full bg-icy-aqua hover:scale-[1.02] transition-all rounded-2xl h-16 font-black shadow-xl shadow-[#00BCD4]/20">
                Search via {activeDestination} Hub <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-white/30 rounded-2xl border border-white/50 text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Source</p>
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-white/20 p-8 rounded-[2rem] border-l-4 border-[#00BCD4]">
              <h3 className="text-gray-800 font-black text-xl tracking-tight">Hub Confirmation</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00BCD4]">Reference ID (PNR/Flight No)</Label>
                  <Input value={bookedTransport.booking_id} onChange={(e) => setBookedTransport({...bookedTransport, booking_id: e.target.value})} placeholder="e.g. 123456789" className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold focus:border-[#00BCD4] shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00BCD4]">Hub Carrier</Label>
                  <Input value={bookedTransport.provider} onChange={(e) => setBookedTransport({...bookedTransport, provider: e.target.value})} placeholder="e.g. Indigo, Vistara" className="bg-white/50 border-gray-100 h-14 rounded-2xl font-bold focus:border-[#00BCD4] shadow-sm" />
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleConfirm} className="w-full bg-gray-800 text-white hover:bg-black rounded-2xl h-16 font-black shadow-lg transition-transform active:scale-95">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-[#00BCD4]" /> Access Stay Hub
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#00BCD4]/20 rounded-[2.5rem] p-12 text-center bg-white/10">
               <Navigation className="w-12 h-12 text-[#00BCD4]/20 mb-4 animate-pulse" />
               <p className="text-gray-400 text-xs font-bold leading-relaxed">
                 Waiting for Hub AI Verification... <br/>
                 Click the search button to begin routing.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTransportSearch;