import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Car, Globe, Train, Plane, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RealTransportSearch = ({ tripDetails, bookedTransport, setBookedTransport, onNext }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const getSearchUrl = () => {
    const { from_location, destination, start_date, num_people, transport_mode } = tripDetails;
    const formattedDate = start_date.replace(/-/g, '');
    
    if (transport_mode === 'flight') {
      const fromCode = getAirportCode(from_location);
      const toCode = getAirportCode(destination);
      return `https://www.ixigo.com/search/result/flight/${fromCode}-${toCode}/${formattedDate}/${num_people}/0/0/E`;
    } else if (transport_mode === 'train') {
      const fromSlug = from_location.toLowerCase().replace(/\s+/g, '-');
      const toSlug = destination.toLowerCase().replace(/\s+/g, '-');
      const dateFormatted = new Date(start_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).toLowerCase().replace(/\s+/g, '-');
      return `https://www.ixigo.com/trains/${fromSlug}-to-${toSlug}/${dateFormatted}`;
    }
    return `https://www.google.com/search?q=cab+from+${from_location}+to+${destination}`;
  };

  const getAirportCode = (city) => {
    const codes = { 'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR', 'goa': 'GOI' };
    return codes[city.toLowerCase().trim()] || 'DEL';
  };

  const handleConfirm = () => {
    if (!bookedTransport.booking_id || !bookedTransport.provider) {
      toast.error("Please enter booking details");
      return;
    }
    onNext();
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 md:p-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
          <Plane className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Transport Concierge</h2>
          <p className="text-gray-500 text-sm">Secure your passage to {tripDetails.destination}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Search & Recommendations */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h3 className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-4">Live Search</h3>
            <p className="text-gray-400 text-sm mb-6">
              We've prepared a direct link to book your {tripDetails.transport_mode} using your preferred date.
            </p>
            <a 
              href={getSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setShowBookingForm(true)}
            >
              <Button className="w-full bg-gold-sparkle text-black rounded-xl h-14 font-bold shadow-lg">
                Book on Ixigo <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-3">
             <div className="flex justify-between text-xs tracking-widest uppercase">
               <span className="text-gray-500">Route</span>
               <span className="text-white text-right font-bold">{tripDetails.from_location} → {tripDetails.destination}</span>
             </div>
             <div className="flex justify-between text-xs tracking-widest uppercase">
               <span className="text-gray-500">Date</span>
               <span className="text-white text-right font-bold">{tripDetails.start_date}</span>
             </div>
          </div>
        </div>

        {/* Right: Manual Booking Entry */}
        <div className="space-y-6">
          {(showBookingForm || bookedTransport.booking_id) ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 border-l-2 border-[#D4AF37]/20 pl-8"
            >
              <h3 className="text-white font-bold text-lg mb-4">Enter Booking Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                    {tripDetails.transport_mode === 'train' ? 'PNR or Train Name' : 'Flight Number'}
                  </Label>
                  <Input 
                    value={bookedTransport.booking_id}
                    onChange={(e) => setBookedTransport({...bookedTransport, booking_id: e.target.value})}
                    placeholder={tripDetails.transport_mode === 'train' ? "e.g., 22446 or Kerala Exp" : "e.g., AI-101"}
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Service Provider</Label>
                  <Input 
                    value={bookedTransport.provider}
                    onChange={(e) => setBookedTransport({...bookedTransport, provider: e.target.value})}
                    placeholder="e.g., Indigo, Air India, IRCTC"
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-[#D4AF37]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Arrival Time</Label>
                    <Input 
                      type="time"
                      value={bookedTransport.arrival_time}
                      onChange={(e) => setBookedTransport({...bookedTransport, arrival_time: e.target.value})}
                      className="bg-white/5 border-white/10 h-12 rounded-xl"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleConfirm}
                  className="w-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black rounded-xl h-14 mt-4 font-bold transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Transport
                </Button>
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-12 text-center">
               <p className="text-gray-600 text-sm italic">
                 Click "Book on Ixigo" to open searching results. <br/> Then come back here to enter your booking info.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTransportSearch;