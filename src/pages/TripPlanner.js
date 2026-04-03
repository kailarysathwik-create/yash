import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Loader2, Users, MapPin, Plane, Hotel, Sparkles, CreditCard, Waves, CheckCircle2, Navigation } from 'lucide-react';
import RealTransportSearch from '@/components/RealTransportSearch';
import RealStaySearch from '@/components/RealStaySearch';
import { tripAPI } from '@/api/tripAPI';

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
        toast.error('Failed to load trip parameters');
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
      toast.success('Lavender Hub Itinerary Synchronized!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Hub AI timing out. Retrying...');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#9370DB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] pb-20 selection:bg-[#9370DB]/20">
      {/* Step Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-[#9370DB] rounded-xl flex items-center justify-center shadow-lg shadow-[#9370DB]/20 cursor-pointer" onClick={() => navigate('/')}>
               <Waves className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-lg font-black text-gray-800 tracking-tight">Deployment Planner</h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-[#9370DB]' : 'w-4 bg-gray-100'}`} />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-16">
        <div className="mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9370DB]/10 rounded-full text-[#9370DB] text-[9px] font-black uppercase tracking-[0.2em] mb-4">
             <Sparkles className="w-3 h-3" /> Step {step} of 5
           </div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">
             {step === 1 && "Transit Hub Synchronization"}
             {step === 2 && "Stay Hub Selection"}
             {step === 3 && "Itinerary Refinement"}
             {step === 4 && "Personnel Manifest"}
             {step === 5 && "Financial Settlement"}
           </h2>
           <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">
              Orchestrating {trip?.details.from_location} → {trip?.details.destination}
           </p>
        </div>

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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 card-3d-wrapper">
                 {itinerary.days.map((day, idx) => (
                   <motion.div 
                     key={idx} 
                     className="card-3d glass-card p-10 rounded-[3rem] border-white/60 relative group"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx * 0.1 }}
                   >
                     <div className="absolute top-8 left-8 w-12 h-12 bg-[#9370DB]/10 rounded-2xl flex items-center justify-center text-[#9370DB] font-black">
                       {day.day}
                     </div>
                     <div className="ml-16">
                        <h3 className="text-2xl font-black text-gray-800 mb-6 group-hover:text-[#9370DB] transition-colors">{day.title}</h3>
                        <div className="space-y-4">
                           {day.activities.map((act, i) => (
                             <div key={i} className="flex gap-3 text-sm text-gray-500 font-medium leading-relaxed">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#9370DB] mt-2 shrink-0" />
                               {act}
                             </div>
                           ))}
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </div>

               <div className="flex gap-4 pt-10 border-t border-gray-100">
                  <Button onClick={() => setStep(2)} variant="ghost" className="text-gray-400 font-bold uppercase text-xs tracking-widest px-10">Back to Hub</Button>
                  <Button onClick={() => setStep(4)} className="flex-1 bg-[#9370DB] text-white hover:scale-[1.02] transition-all rounded-full h-20 text-xl font-black shadow-2xl shadow-[#9370DB]/20">
                     Authorize Personnel <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
               </div>
            </motion.div>
          )}

          {generating && (
            <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
               <div className="w-24 h-24 bg-[#9370DB] rounded-[2rem] flex items-center justify-center shadow-2xl animate-bounce mb-8">
                  <Sparkles className="w-12 h-12 text-white" />
               </div>
               <h3 className="text-2xl font-black text-gray-800 tracking-tight">Hub AI Synchronizing...</h3>
               <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Optimizing luxury protocol</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TripPlanner;