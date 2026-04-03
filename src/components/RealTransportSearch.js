import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Car, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const RealTransportSearch = ({ options, onSelect }) => {
  return (
    <div className="space-y-12 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#1a0b2e] tracking-tight">Transit Matrix</h2>
          <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">Optimal Routing Solutions</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
             <ShieldCheck className="w-4 h-4" /> Hub Verified
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A855F7]">
             <Zap className="w-4 h-4" /> Fast-Path
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 card-3d-wrapper">
        {options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option)}
            className="card-3d glass-card rounded-[3rem] p-10 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A855F7]/5 rounded-full blur-[60px] group-hover:bg-[#A855F7]/15 transition-all duration-700" />
            
            <div className="mb-10 relative z-10 flex items-center justify-between">
              <div className="w-16 h-16 rounded-[2rem] bg-white/60 flex items-center justify-center group-hover:bg-[#A855F7] group-hover:shadow-xl group-hover:shadow-[#A855F7]/20 transition-all duration-500">
                {option.type === 'flight' && <Plane className="w-8 h-8 text-[#A855F7] group-hover:text-white" />}
                {option.type === 'train' && <Train className="w-8 h-8 text-[#A855F7] group-hover:text-white" />}
                {(option.type === 'car' || option.type === 'taxi') && <Car className="w-8 h-8 text-[#A855F7] group-hover:text-white" />}
              </div>
              <span className="text-[10px] font-black text-[#1a0b2e]/30 uppercase tracking-[0.2em]">Tier {index + 1}</span>
            </div>

            <h3 className="text-3xl font-black text-[#1a0b2e] mb-2 group-hover:translate-x-2 transition-transform duration-500">{option.type} Protocol</h3>
            <p className="text-[#1a0b2e]/40 font-bold mb-10 min-h-[3rem]">{option.details}</p>

            <div className="pt-8 border-t border-[#1a0b2e]/5 flex items-center justify-between group-hover:border-[#A855F7]/20 transition-colors">
              <div className="text-3xl font-black text-[#A855F7] tracking-tighter">₹{option.price.toLocaleString()}</div>
              <div className="w-12 h-12 rounded-full bg-[#1a0b2e] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 shadow-lg shadow-[#1a0b2e]/20">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RealTransportSearch;
