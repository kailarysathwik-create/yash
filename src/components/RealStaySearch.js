import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Hotel, Plus, Trash2, CheckCircle2, Bed, Sparkles, MapPin, Calendar } from 'lucide-react';
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
    <div className="card-3d glass-card rounded-[3.5rem] p-10 md:p-16 border-white/20 shadow-2xl overflow-hidden relative text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9370DB]/10 rounded-full blur-[100px] -mr-32 -mt-32 pulse-bg" />
      
      <div className="flex items-center gap-6 mb-12 relative z-10">
        <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center shadow-2xl border border-white/20 group-hover:bg-[#9370DB] transition-all duration-700">
          <Hotel className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Stay Hub</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Defining Hub Refuges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
        <div className="space-y-10">
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 relative group hover:border-[#9370DB]/30 transition-all duration-500">
            <h3 className="text-[#9370DB] font-black text-[10px] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
               <Sparkles className="w-3 h-3" /> Hub AI Retreat Curation
            </h3>
            <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed italic">
              Explore premium sanctuary options for {tripDetails.destination}. <br/> Hub AI has synchronized your operational timeline for a seamless stay.
            </p>
            <a href={getSearchUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setShowForm(true)}>
              <Button className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-2xl h-20 text-lg font-black shadow-2xl shadow-black/50">
                Explore Stays Hub <ExternalLink className="w-5 h-5 ml-3" />
              </Button>
            </a>
          </div>

          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-between group hover:border-[#9370DB]/20 transition-all">
             <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Operational Timeline</span>
               <span className="text-white font-black text-xl">{tripDetails.num_days} Hub Days</span>
             </div>
             <Calendar className="w-8 h-8 text-[#9370DB]/30" />
          </div>
        </div>

        <div className="space-y-8">
          {(showForm || bookedStays[0].hotel_name) ? (
            <div className="space-y-10 border-l-2 border-white/5 pl-10 pb-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-white font-black text-3xl tracking-tight">Stay Manifest</h3>
                <Button size="sm" onClick={addStay} className="bg-white/5 text-[#9370DB] border border-white/10 hover:bg-white/10 rounded-xl px-4 py-6 font-black uppercase text-[10px] tracking-widest shadow-xl">
                  <Plus className="w-4 h-4 mr-2" /> Add Hub
                </Button>
              </div>

              <div className="space-y-8 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                <AnimatePresence>
                  {bookedStays.map((stay, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="p-8 bg-white/5 rounded-[3rem] border border-white/10 space-y-6 relative group hover:border-[#9370DB]/30 transition-all duration-500">
                      {bookedStays.length > 1 && (
                        <button onClick={() => removeStay(idx)} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-2xl rotate-12">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Name of Sanctuary</Label>
                        <Input placeholder="Resort or Hotel Name" value={stay.hotel_name} onChange={(e) => updateStay(idx, 'hotel_name', e.target.value)} className="glass-input h-14" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Arrival</Label>
                          <Input type="date" value={stay.check_in} onChange={(e) => updateStay(idx, 'check_in', e.target.value)} className="glass-input h-14 text-[10px] font-black text-[#9370DB]" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Departure</Label>
                          <Input type="date" value={stay.check_out} onChange={(e) => updateStay(idx, 'check_out', e.target.value)} className="glass-input h-14 text-[10px] font-black text-[#9370DB]" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-10 border-t border-white/5 flex gap-6">
                <Button onClick={onBack} variant="ghost" className="text-white/20 hover:text-white font-black uppercase text-[10px] tracking-widest px-8">Back</Button>
                <Button onClick={onNext} className="flex-1 bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-full h-20 font-black text-xl shadow-2xl shadow-black/50">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-[#9370DB]" /> Finalize Protocol
                </Button>
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] p-20 text-center bg-white/5 group hover:border-[#9370DB]/30 transition-all duration-500">
               <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
                <Hotel className="w-10 h-10 text-white/10 group-hover:animate-bounce" />
               </div>
               <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.4em] leading-loose max-w-[250px]">
                 Discover Hub Refuges... <br/>
                 <span className="text-[#9370DB]/40 font-bold block mt-4">Initiate Hub Search to continue</span>
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealStaySearch;