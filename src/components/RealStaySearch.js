import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Hotel, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RealStaySearch = ({ tripDetails, bookedStays, setBookedStays, onNext, onBack }) => {
  const [showForm, setShowForm] = useState(false);

  const getSearchUrl = (dayOffset = 0) => {
    const { destination, start_date, num_people } = tripDetails;
    const checkInDate = new Date(start_date);
    checkInDate.setDate(checkInDate.getDate() + dayOffset);
    
    // Default to 1 day as requested
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}${day}${date.getFullYear()}`;
    };
    
    const checkIn = formatDate(checkInDate);
    const checkOut = formatDate(checkOutDate);
    const citySlug = destination.toLowerCase().replace(/\s+/g, '-');
    
    return `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${checkIn}&checkout=${checkOut}&city=${citySlug}&roomStayQualifier=${num_people}e0e&searchText=${destination}`;
  };

  const addStay = () => {
    setBookedStays([...bookedStays, { hotel_name: '', location: '', check_in: '', check_out: '' }]);
  };

  const removeStay = (index) => {
    const updated = bookedStays.filter((_, i) => i !== index);
    setBookedStays(updated);
  };

  const updateStay = (index, field, value) => {
    const updated = [...bookedStays];
    updated[index][field] = value;
    setBookedStays(updated);
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 md:p-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
          <Hotel className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Stay Concierge</h2>
          <p className="text-gray-500 text-sm">Select your exclusive retreats in {tripDetails.destination}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Recommendation & Search */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-4">Real-time Options</h3>
            <p className="text-gray-400 text-sm mb-6">
              Search premium stays on MakeMyTrip. We've defaulted the search to 1 day for maximum flexibility.
            </p>
             <a 
              href={getSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setShowForm(true)}
            >
              <Button className="w-full bg-gold-sparkle text-black rounded-xl h-14 font-bold shadow-lg">
                Explore Stays <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-3">
             <div className="flex justify-between text-xs tracking-widest uppercase mb-2">
               <span className="text-[#D4AF37] font-bold">Planned Duration</span>
               <span className="text-white text-right font-bold">{tripDetails.num_days} Days</span>
             </div>
             <p className="text-[10px] text-gray-500 italic">
               * You can add multiple stays if you plan to move during your trip.
             </p>
          </div>
        </div>

        {/* Right: Manual Stay Entry */}
        <div className="space-y-6">
          {(showForm || bookedStays[0].hotel_name) ? (
            <div className="space-y-6 border-l-2 border-[#D4AF37]/20 pl-8">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Your Selected Stays</h3>
                <Button 
                  size="sm" 
                  onClick={addStay}
                  className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Stay
                </Button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {bookedStays.map((stay, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 relative group"
                    >
                      {bookedStays.length > 1 && (
                        <button 
                          onClick={() => removeStay(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      
                      <Input 
                        placeholder="Hotel Name"
                        value={stay.hotel_name}
                        onChange={(e) => updateStay(idx, 'hotel_name', e.target.value)}
                        className="bg-transparent border-b border-white/10 rounded-none h-10 px-0 focus:border-[#D4AF37] text-white"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          placeholder="Check-in Date"
                          type="date"
                          value={stay.check_in}
                          onChange={(e) => updateStay(idx, 'check_in', e.target.value)}
                          className="bg-transparent border-b border-white/10 rounded-none h-10 px-0 text-xs text-gray-400"
                        />
                        <Input 
                          placeholder="Check-out Date"
                          type="date"
                          value={stay.check_out}
                          onChange={(e) => updateStay(idx, 'check_out', e.target.value)}
                          className="bg-transparent border-b border-white/10 rounded-none h-10 px-0 text-xs text-gray-400"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <Button 
                  onClick={onBack}
                  variant="ghost"
                  className="text-gray-500 hover:text-white"
                >
                  Back
                </Button>
                <Button 
                  onClick={onNext}
                  className="flex-1 bg-gold-sparkle text-black rounded-xl h-14 font-bold shadow-xl shadow-[#D4AF37]/10"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Craft Luxury Plan
                </Button>
              </div>
            </div>
          ) : (
             <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-12 text-center">
               <p className="text-gray-600 text-sm italic">
                 Explore luxury accommodations. <br/> Then lock in your selected retreats here.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealStaySearch;