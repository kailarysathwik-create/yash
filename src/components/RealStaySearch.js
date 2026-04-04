import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Star, MapPin, CheckCircle2, Shield, Wifi, Coffee, Car, Waves, Dumbbell, Utensils, Phone, Mail, Calendar, ArrowRight, IndianRupee, Users, Filter, SortAsc } from 'lucide-react';

const RealStaySearch = ({ options, onSelect }) => {
  const [sortBy, setSortBy] = useState('price'); // 'price' | 'rating'
  const [expandedCard, setExpandedCard] = useState(null);
  const [bookingOverlay, setBookingOverlay] = useState(null);

  // Sort options
  const sorted = [...options].sort((a, b) => {
    if (sortBy === 'price') return (a.price_per_night || a.price || 0) - (b.price_per_night || b.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Amenity icon mapper
  const getAmenityIcon = (amenity) => {
    const lower = amenity?.toLowerCase() || '';
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-3.5 h-3.5" />;
    if (lower.includes('breakfast') || lower.includes('food') || lower.includes('restaurant')) return <Coffee className="w-3.5 h-3.5" />;
    if (lower.includes('parking') || lower.includes('car')) return <Car className="w-3.5 h-3.5" />;
    if (lower.includes('pool') || lower.includes('swim')) return <Waves className="w-3.5 h-3.5" />;
    if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell className="w-3.5 h-3.5" />;
    if (lower.includes('dining') || lower.includes('kitchen')) return <Utensils className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  // Star rating component
  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating || 0)
            ? 'fill-[#A855F7] text-[#A855F7]'
            : 'fill-none text-[#A855F7]/20'}`}
        />
      ))}
      <span className="text-[11px] font-black text-[#1a0b2e]/50 ml-1">{rating || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Available Stays</h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {options.length} propert{options.length !== 1 ? 'ies' : 'y'} found • Select to book
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
              <Shield className="w-4 h-4" /> Verified
            </div>
          </div>
          {/* Sort Buttons */}
          <button
            onClick={() => setSortBy('price')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              sortBy === 'price' ? 'bg-[#A855F7] text-white' : 'bg-white/40 text-[#1a0b2e]/40 hover:bg-[#A855F7]/10'
            }`}
          >
            <span className="flex items-center gap-1.5"><SortAsc className="w-3 h-3" /> Price</span>
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              sortBy === 'rating' ? 'bg-[#A855F7] text-white' : 'bg-white/40 text-[#1a0b2e]/40 hover:bg-[#A855F7]/10'
            }`}
          >
            <span className="flex items-center gap-1.5"><Star className="w-3 h-3" /> Rating</span>
          </button>
        </div>
      </div>

      {/* Hotel Cards List */}
      <div className="space-y-6">
        {sorted.map((option, index) => {
          const price = option.price_per_night || option.price || 0;
          const totalNights = (option.check_out_day || 2) - (option.check_in_day || 1);
          const totalPrice = price * (totalNights > 0 ? totalNights : 1);
          const isExpanded = expandedCard === index;
          const amenities = option.amenities || [];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card rounded-[2rem] overflow-hidden cursor-pointer group hover:border-[#A855F7]/30 transition-all duration-500"
            >
              {/* Main Row */}
              <div className="flex flex-col md:flex-row">
                {/* Left: Hotel Icon / Image Area */}
                <div className="md:w-56 bg-gradient-to-br from-[#A855F7]/5 to-[#A855F7]/10 flex items-center justify-center p-8 shrink-0">
                  <div className="w-20 h-20 rounded-3xl bg-white/60 flex items-center justify-center group-hover:bg-[#A855F7] group-hover:shadow-xl group-hover:shadow-[#A855F7]/20 transition-all duration-500">
                    <Home className="w-10 h-10 text-[#A855F7] group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Center: Hotel Details */}
                <div className="flex-1 p-8">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-black text-[#1a0b2e] mb-1 group-hover:text-[#A855F7] transition-colors duration-300">
                        {option.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-[#A855F7]" />
                        <span className="text-sm text-[#1a0b2e]/50 font-medium">{option.location || option.description}</span>
                      </div>
                      <StarRating rating={option.rating} />
                    </div>
                  </div>

                  {/* Amenities Row */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {amenities.slice(0, isExpanded ? amenities.length : 4).map((amenity, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A855F7]/5 text-[#A855F7] rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {getAmenityIcon(amenity)} {amenity}
                      </span>
                    ))}
                    {!isExpanded && amenities.length > 4 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setExpandedCard(index); }}
                        className="inline-flex items-center px-3 py-1.5 bg-[#1a0b2e]/5 text-[#1a0b2e]/40 rounded-full text-[10px] font-bold cursor-pointer hover:bg-[#A855F7]/10 hover:text-[#A855F7] transition-all"
                      >
                        +{amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Check-in / Check-out */}
                  <div className="flex items-center gap-6 mt-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#1a0b2e]/40">
                      <Calendar className="w-3.5 h-3.5 text-[#A855F7]" />
                      Check-in: Day {option.check_in_day || 1}
                    </div>
                    <div className="text-[#1a0b2e]/20">→</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#1a0b2e]/40">
                      <Calendar className="w-3.5 h-3.5 text-[#A855F7]" />
                      Check-out: Day {option.check_out_day || 2}
                    </div>
                  </div>
                </div>

                {/* Right: Price & Book */}
                <div className="md:w-64 p-8 flex flex-col items-end justify-between border-l border-[#1a0b2e]/5 shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#1a0b2e]/30 mb-1">Per Night</p>
                    <p className="text-3xl font-black text-[#A855F7]">₹{price.toLocaleString()}</p>
                  </div>

                  <div className="text-right mt-4">
                    <p className="text-[9px] font-bold text-[#1a0b2e]/30 mb-1">
                      {totalNights > 0 ? totalNights : 1} night{totalNights !== 1 ? 's' : ''} total
                    </p>
                    <p className="text-xl font-black text-[#1a0b2e]">₹{totalPrice.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingOverlay({ ...option, price: totalPrice, nights: totalNights > 0 ? totalNights : 1 });
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1a0b2e] text-white rounded-2xl font-black text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:bg-[#A855F7] transition-all duration-500 shadow-lg"
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Section: Contact Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#1a0b2e]/5 overflow-hidden"
                  >
                    <div className="p-8 flex items-center gap-8 bg-[#A855F7]/[0.02]">
                      {option.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-[#1a0b2e]/50">
                          <Phone className="w-4 h-4 text-[#A855F7]" />
                          <span className="font-bold">{option.contact_phone}</span>
                        </div>
                      )}
                      {option.contact_email && (
                        <div className="flex items-center gap-2 text-sm text-[#1a0b2e]/50">
                          <Mail className="w-4 h-4 text-[#A855F7]" />
                          <span className="font-bold">{option.contact_email}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedCard(null); }}
                        className="ml-auto text-[10px] font-black uppercase tracking-widest text-[#A855F7] hover:text-[#1a0b2e] transition-colors"
                      >
                        Collapse
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click to expand hint */}
              {!isExpanded && (option.contact_phone || option.contact_email) && (
                <div
                  onClick={(e) => { e.stopPropagation(); setExpandedCard(index); }}
                  className="px-8 py-3 border-t border-[#1a0b2e]/5 text-center text-[9px] font-black uppercase tracking-widest text-[#1a0b2e]/20 hover:text-[#A855F7] hover:bg-[#A855F7]/[0.02] transition-all cursor-pointer"
                >
                  View contact details & more amenities
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {options.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-[#A855F7]" />
          </div>
          <p className="text-[#1a0b2e]/40 font-bold">Scanning live properties...</p>
        </div>
      )}

      {/* DEEP BOOKING OVERLAY */}
      <AnimatePresence>
        {bookingOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0b2e]/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setBookingOverlay(null); }} 
                className="absolute top-8 right-8 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-[#1a0b2e] font-black"
              >X</button>
              
              <div className="w-16 h-16 bg-[#A855F7]/10 text-[#A855F7] rounded-3xl flex items-center justify-center mb-6">
                <Home className="w-8 h-8" />
              </div>
              
              <h3 className="text-3xl font-black text-[#1a0b2e] mb-2">Review Reservation</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a0b2e]/40 mb-8">Confirm details and pricing rules</p>
              
              <div className="glass-card rounded-[2rem] p-6 mb-8 border-dashed border-2 border-[#1a0b2e]/10">
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#1a0b2e]/50">Property</span>
                    <span className="font-black text-[#1a0b2e] text-right max-w-[60%]">{bookingOverlay.name}</span>
                 </div>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#1a0b2e]/50">Check-in</span>
                    <span className="font-black text-[#1a0b2e]">Day {bookingOverlay.check_in_day || 1}</span>
                 </div>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#1a0b2e]/50">Check-out</span>
                    <span className="font-black text-[#1a0b2e]">Day {bookingOverlay.check_out_day || 2}</span>
                 </div>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#1a0b2e]/50">Duration</span>
                    <span className="font-black text-[#1a0b2e]">{bookingOverlay.nights} Night{bookingOverlay.nights !== 1 ? 's' : ''}</span>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t border-[#1a0b2e]/10">
                    <span className="font-bold text-[#1a0b2e]">Total Price</span>
                    <span className="font-black text-[#A855F7] text-2xl">₹{bookingOverlay.price.toLocaleString()}</span>
                 </div>
              </div>
              
              <button onClick={() => onSelect(bookingOverlay)} className="w-full bg-[#1a0b2e] flex items-center justify-center hover:bg-[#A855F7] text-white h-16 rounded-2xl font-black text-lg transition-all">
                Confirm & Add to Manifest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealStaySearch;
