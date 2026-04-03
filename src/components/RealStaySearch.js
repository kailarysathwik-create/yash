import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Hotel, Plus, Trash2, CheckCircle2, Bed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RealStaySearch = ({ tripDetails, bookedStays, setBookedStays, onNext, onBack }) => {
  const [showForm, setShowForm] = useState(false);

  const getSearchUrl = (dayOffset = 0) => {
    const { destination, start_date, num_people } = tripDetails;
    const checkInDate = new Date(start_date);
    checkInDate.setDate(checkInDate.getDate() + dayOffset);
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

  const addStay = () => setBookedStays([...bookedStays, { hotel_name: '', location: '', check_in: '', check_out: '' }]);
  const removeStay = (idx) => setBookedStays(bookedStays.filter((_, i) => i !== idx));

  const updateStay = (index, field, value) => {
    const updated = [...bookedStays];
    updated[index][field] = value;
    setBookedStays(updated);
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/60 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00BCD4]/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center gap-5 mb-12">
        <div className="w-14 h-14 rounded-3xl bg-[#00BCD4]/10 flex items-center justify-center shadow-inner">
          <Bed className="w-7 h-7 text-[#00BCD4]" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Stay Hub</h2>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Defining Hub Sanctuaries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-inner">
            <h3 className="text-[#00BCD4] font-black text-xs uppercase tracking-widest mb-6">Hub Curated Accommodations</h3>
            <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed">
              Explore retreat options for {tripDetails.destination}. <br/> Hub AI has synchronized your dates for a seamless stay.
            </p>
            <a href={getSearchUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setShowForm(true)}>
              <Button className="w-full bg-icy-aqua hover:scale-[1.02] transition-all rounded-2xl h-16 font-black shadow-xl shadow-[#00BCD4]/20">
                Explore Stays Hub <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>

          <div className="p-6 bg-white/20 rounded-2xl border border-white/40">
             <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
               <span>Planned Duration</span>
               <span className="text-[#00BCD4] text-sm">{tripDetails.num_days} Days</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {(showForm || bookedStays[0].hotel_name) ? (
            <div className="space-y-8 border-l-4 border-gray-100 pl-8 pb-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-gray-800 font-extrabold text-xl tracking-tight">Access Hub Stays</h3>
                <Button size="sm" onClick={addStay} className="bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/10 hover:bg-[#00BCD4]/20 rounded-xl px-4 font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Add Retreat
                </Button>
              </div>

              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                <AnimatePresence>
                  {bookedStays.map((stay, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="p-6 bg-white/30 rounded-3xl border border-white/50 space-y-4 relative group shadow-sm hover:shadow-md transition-all">
                      {bookedStays.length > 1 && (
                        <button onClick={() => removeStay(idx)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-500/20 shadow-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <Input placeholder="Retreat / Hotel Name" value={stay.hotel_name} onChange={(e) => updateStay(idx, 'hotel_name', e.target.value)} className="bg-transparent border-b-2 border-gray-100 rounded-none h-10 px-0 focus:border-[#00BCD4] font-bold text-gray-800" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="date" value={stay.check_in} onChange={(e) => updateStay(idx, 'check_in', e.target.value)} className="bg-transparent border-b-2 border-gray-100 rounded-none h-10 px-0 text-[10px] font-black text-[#00BCD4]" />
                        <Input type="date" value={stay.check_out} onChange={(e) => updateStay(idx, 'check_out', e.target.value)} className="bg-transparent border-b-2 border-gray-100 rounded-none h-10 px-0 text-[10px] font-black text-[#00BCD4]" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-8 border-t border-gray-100 flex gap-4">
                <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-[#00BCD4] font-bold">Back</Button>
                <Button onClick={onNext} className="flex-1 bg-gray-800 text-white rounded-2xl h-16 font-black shadow-xl shadow-gray-200 hover:scale-[1.02] transition-transform">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-[#00BCD4]" /> Generate Hub Plan
                </Button>
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#00BCD4]/20 rounded-[2.5rem] p-12 text-center bg-white/10">
               <Hotel className="w-12 h-12 text-[#00BCD4]/20 mb-4 animate-pulse" />
               <p className="text-gray-400 text-xs font-bold leading-relaxed">
                 Discover Hub Retreats... <br/>
                 Click to open search options.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealStaySearch;