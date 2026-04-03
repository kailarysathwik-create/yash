import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Loader2, Users, MapPin, Plane, Hotel, Sparkles, CreditCard, Waves, CheckCircle2, Navigation, IndianRupee } from 'lucide-react';
import RealTransportSearch from '@/components/RealTransportSearch';
import RealStaySearch from '@/components/RealStaySearch';
import { tripAPI } from '@/api/tripAPI';
import UPIPayment from '@/components/UPIPayment';

const TripPlanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  // Selection States
  const [bookedTransport, setBookedTransport] = useState({ provider: '', booking_id: '', type: 'flight' });
  const [bookedStays, setBookedStays] = useState([{ hotel_name: '', location: '', check_in: '', check_out: '' }]);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripAPI.getTrip(id);
        setTrip(data);
        if (data.itinerary) setItinerary(data.itinerary);
        if (data.selected_transport) setBookedTransport({ ...bookedTransport, booking_id: data.selected_transport });
      } catch (error) {
        console.error('Fetch trip error:', error);
        toast.error('Failed to load hub parameters');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const generateAIitinerary = async () => {
    setGenerating(true);
    try {
      const result = await tripAPI.generateItinerary(id, {
        transport: bookedTransport,
        stays: bookedStays
      });
      setItinerary(result.itinerary);
      setStep(3);
      toast.success('Purple Hub Itinerary Synchronized!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Hub AI timing out. Retrying...');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#9370DB]" />
            <div className="absolute inset-0 blur-2xl bg-[#9370DB]/20 rounded-full" />
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-white/20">
      {/* Step Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <motion.div 
               whileHover={{ scale: 1.1, rotate: 180 }}
               className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 cursor-pointer" 
               onClick={() => navigate('/')}
             >
               <Waves className="w-5 h-5 text-white" />
             </motion.div>
             <h1 className="text-lg font-black text-white tracking-tight">Deployment Planner</h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-10 bg-[#9370DB]' : 'w-4 bg-white/5'}`} />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/5">
             <Sparkles className="w-3 h-3 text-[#9370DB]" /> Protocol {step} of 5
           </div>
           <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
             {step === 1 && "Transit Synchronizer"}
             {step === 2 && "Stay Hub Selection"}
             {step === 3 && "Itinerary Refinement"}
             {step === 4 && "Personnel Manifest"}
             {step === 5 && "Financial Settlement"}
           </h2>
           <p className="text-[#9370DB] font-black uppercase tracking-[0.3em] text-[11px] flex items-center gap-2">
              <Navigation className="w-3 h-3" /> {trip?.details.from_location} <ArrowRight className="w-3 h-3 opacity-30" /> {trip?.details.destination}
           </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <RealTransportSearch 
                tripDetails={trip.details} 
                bookedTransport={bookedTransport} 
                setBookedTransport={setBookedTransport}
                onNext={() => setStep(2)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <RealStaySearch 
                tripDetails={trip.details}
                bookedStays={bookedStays}
                setBookedStays={setBookedStays}
                onNext={generateAIitinerary}
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {step === 3 && itinerary && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 card-3d-wrapper">
                 {itinerary.days.map((day, idx) => (
                   <motion.div 
                     key={idx} 
                     className="card-3d glass-card p-12 rounded-[3.5rem] border-white/20 relative group"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx * 0.1 }}
                   >
                     <div className="absolute top-10 left-10 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white font-black border border-white/10 group-hover:bg-[#9370DB] transition-all duration-500">
                       {day.day}
                     </div>
                     <div className="ml-20">
                        <h3 className="text-2xl font-black text-white mb-6 group-hover:text-[#9370DB] transition-colors leading-tight">{day.title}</h3>
                        <div className="space-y-5">
                           {day.activities.map((act, i) => (
                             <div key={i} className="flex gap-4 text-sm text-white/40 font-bold leading-relaxed group-hover:text-white/70 transition-colors">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#9370DB] mt-2 shrink-0 shadow-[0_0_10px_#9370DB]" />
                               {act}
                             </div>
                           ))}
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </div>

               <div className="flex gap-6 pt-16 border-t border-white/5">
                  <Button onClick={() => setStep(2)} variant="ghost" className="text-white/30 hover:text-white font-black uppercase text-[10px] tracking-widest px-10">Back to Stays</Button>
                  <Button onClick={() => setStep(4)} className="flex-1 bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-full h-24 text-2xl font-black shadow-2xl shadow-black/50">
                     Authorize Personnel <ArrowRight className="w-7 h-7 ml-3" />
                  </Button>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto glass-card rounded-[4rem] p-16 border-white/20 shadow-2xl text-center">
              <Users className="w-20 h-20 text-[#9370DB] mx-auto mb-10" />
              <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Personnel Validation</h3>
              <p className="text-white/40 font-medium mb-12">Synchronizing primary passenger details for automated T-2h and T-1h concierge alerts.</p>
              <Button onClick={() => setStep(5)} className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-full h-20 text-xl font-black shadow-2xl shadow-black/50">
                Proceed to Settlement
              </Button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <UPIPayment tripId={id} onSuccess={() => navigate('/')} />
            </motion.div>
          )}

          {generating && (
            <div className="fixed inset-0 glass-dark z-[100] flex flex-col items-center justify-center">
               <div className="relative mb-12">
                 <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce border border-white/20 relative z-10">
                    <Sparkles className="w-16 h-16 text-[#1a0b2e]" />
                 </div>
                 <div className="absolute inset-0 bg-[#9370DB]/30 blur-[80px] animate-pulse rounded-full" />
               </div>
               <h3 className="text-4xl font-black text-white tracking-tighter">Hub AI Synchronizing...</h3>
               <p className="text-[#9370DB] font-black uppercase tracking-[0.4em] text-xs mt-4">Optimizing premium orchestration protocol</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed bottom-0 left-0 w-full -z-50 pointer-events-none opacity-10">
        <Sparkles className="w-[1000px] h-[1000px] text-white" strokeWidth={0.2} />
      </div>
    </div>
  );
};

export default TripPlanner;