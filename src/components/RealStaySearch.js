import React from 'react';
import { motion } from 'framer-motion';
import { Home, Star, MapPin, CheckCircle2, Shield } from 'lucide-react';

const RealStaySearch = ({ options, onSelect }) => {
  return (
    <div className="space-y-12 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Sanctuary Nodes</h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">Elite Lodging Synchronizations</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
             <Shield className="w-4 h-4" /> Hub Inspected
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
             <CheckCircle2 className="w-4 h-4" /> Verified Sanctuary
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 card-3d-wrapper">
        {options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option)}
            className="card-3d glass-card rounded-[4rem] p-12 cursor-pointer group relative overflow-hidden flex flex-col md:flex-row gap-10"
          >
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#A855F7]/5 rounded-full blur-[80px] group-hover:bg-[#A855F7]/15 transition-all duration-700" />
            
            <div className="md:w-1/3 flex flex-col items-center justify-center p-8 bg-white/60 rounded-[3rem] group-hover:bg-[#A855F7] transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-[#A855F7]/20">
               <Home className="w-16 h-16 text-[#A855F7] group-hover:text-white mb-6 transition-colors" />
               <div className="flex items-center gap-1">
                 {[1, 2, 3, 4, 5].map((s) => (
                   <Star key={s} className="w-3 h-3 fill-[#A855F7] text-[#A855F7] group-hover:fill-white group-hover:text-white" />
                 ))}
               </div>
            </div>

            <div className="md:w-2/3 flex flex-col justify-between relative z-10">
              <div>
                <div className="flex items-center justify-between mb-6">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A855F7]">Premium Node</span>
                   <span className="text-[10px] font-bold text-[#1a0b2e]/20">Hub Ref: {index + 100}</span>
                </div>
                <h3 className="text-4xl font-black text-[#1a0b2e] mb-4 group-hover:translate-x-2 transition-transform duration-500">{option.name}</h3>
                <div className="flex items-center gap-2 text-[#1a0b2e]/40 font-bold text-sm mb-8">
                   <MapPin className="w-4 h-4 text-[#A855F7]" /> {option.description}
                </div>
              </div>

              <div className="pt-8 border-t border-[#1a0b2e]/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[#1a0b2e]/30 tracking-widest mb-1">Nightly Credits</span>
                  <div className="text-4xl font-black text-[#A855F7]">₹{option.price.toLocaleString()}</div>
                </div>
                <button className="px-8 py-4 bg-[#1a0b2e] text-white rounded-full font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-xl shadow-[#1a0b2e]/20">
                   Select Sanctuary
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RealStaySearch;
