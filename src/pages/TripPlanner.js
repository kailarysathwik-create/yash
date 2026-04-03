import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2, Users, MapPin, Plane, Hotel, Sparkles, CreditCard, Waves } from 'lucide-react';
import RealTransportSearch from '@/components/RealTransportSearch';
import RealStaySearch from '@/components/RealStaySearch';
import UPIPayment from '@/components/UPIPayment';
import { tripAPI } from '@/api/tripAPI';

const TripPlanner = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [agencyCharges, setAgencyCharges] = useState('');
  
  const [bookedTransport, setBookedTransport] = useState({
    type: '',
    provider: '',
    booking_id: '',
    departure_time: '',
    arrival_time: ''
  });

  const [bookedStays, setBookedStays] = useState([
    { hotel_name: '', location: '', check_in: '', check_out: '' }
  ]);

  const [touristDetails, setTouristDetails] = useState({
    tourists: [],
    contact_phone: '',
    contact_email: '',
    additional_phones: []
  });

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const data = await tripAPI.getTrip(tripId);
        setTrip(data);

        if (data.details) {
          const numPeople = data.details.num_people;
          setTouristDetails(prev => ({
            ...prev,
            tourists: Array(numPeople).fill(null).map(() => ({
              name: '',
              age: '',
              gender: 'male'
            }))
          }));
        }
      } catch (error) {
        console.error('Failed to load trip:', error);
        toast.error('Failed to load trip');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      loadTrip();
    }
  }, [tripId, navigate]);

  const handleGenerateItinerary = async () => {
    setGenerating(true);
    setStep(3);
    try {
      const result = await tripAPI.generateItinerary(tripId, {
        transport: bookedTransport,
        stays: bookedStays
      });
      setTrip(prev => ({ ...prev, itinerary: result.itinerary }));
      toast.success('Your Hub Itinerary is Ready!');
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      toast.error('Failed to generate itinerary');
    } finally {
      setGenerating(false);
    }
  };

  const saveTouristDetails = async () => {
    try {
      await tripAPI.updateTouristDetails(tripId, touristDetails);
      toast.success('Passenger details saved!');
      setStep(5);
    } catch (error) {
      console.error('Failed to save tourist details:', error);
      toast.error('Failed to save tourist details');
    }
  };

  const saveAgencyChargesData = async () => {
    if (!agencyCharges) {
      toast.error('Please enter agency fees');
      return;
    }
    try {
      await tripAPI.saveAgencyCharges(tripId, parseFloat(agencyCharges));
      toast.success('Fees finalized!');
    } catch (error) {
      console.error('Failed to save agency charges:', error);
      toast.error('Failed to save agency charges');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Waves className="w-12 h-12 text-[#00BCD4] animate-bounce mx-auto mb-4" />
          <p className="text-[#00BCD4] font-bold tracking-widest uppercase text-xs">Yatra And Stay Hub...</p>
        </div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex justify-center mb-12 gap-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
            step >= s ? 'bg-[#00BCD4] shadow-[0_0_15px_rgba(0,188,212,0.4)]' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 selection:bg-[#00BCD4]/30">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center relative">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-black text-[#00BCD4] mb-2 tracking-tight flex items-center justify-center gap-3"
          >
            <Waves className="w-10 h-10" />
            Yatra And Stay Hub
          </motion.h1>
          <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">
             Smart Travel Planning for {trip?.details.from_location} → {trip?.details.destination}
          </p>
        </header>

        <StepIndicator />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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
                onNext={handleGenerateItinerary} 
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-gray-800">Your Fresh Hub Plan</h2>
                {!generating && (
                  <Button onClick={() => setStep(4)} className="bg-icy-aqua hover:scale-105 transition-transform rounded-full px-8 py-6 font-bold uppercase tracking-wider text-xs">
                    Confirm Itinerary <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {generating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-[#00BCD4]" />
                    <Waves className="w-6 h-6 absolute top-0 right-0 animate-pulse text-[#00BCD4]" />
                  </div>
                  <p className="text-[#00BCD4] font-bold tracking-[0.2em] uppercase text-[11px] text-center">
                    Hub AI mapping your<br/>exclusive journey...
                  </p>
                </div>
              ) : (
                <div className="space-y-6 card-3d-wrapper">
                  {trip?.itinerary?.days?.map((day, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-3d bg-white/80 border border-white/50 rounded-3xl p-8 hover:border-[#00BCD4]/30"
                    >
                      <h3 className="text-xl font-extrabold text-[#00BCD4] mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-[#00BCD4]/10 flex items-center justify-center text-sm font-black">
                          {day.day}
                        </span>
                        {day.title}
                      </h3>
                      <div className="space-y-4 ml-13">
                        {day.places && (
                          <div className="flex flex-wrap gap-2">
                            {day.places.map((place, pIdx) => (
                              <span key={pIdx} className="text-[11px] font-bold text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full border border-gray-200">
                                {place}
                              </span>
                            ))}
                          </div>
                        )}
                        {day.activities && (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {day.activities.map((act, aIdx) => (
                              <li key={aIdx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] mt-1.5 shrink-0" />
                                {act}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-[2.5rem] p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#00BCD4]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#00BCD4]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">Hub Passengers</h2>
                  <p className="text-gray-400 text-sm font-medium">Plan shared with these contacts</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-gray-100">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00BCD4]">Hub Email</Label>
                    <Input type="email" value={touristDetails.contact_email} onChange={(e) => setTouristDetails({ ...touristDetails, contact_email: e.target.value })} className="bg-white/50 border-gray-200 rounded-2xl h-14" placeholder="travel@hub.com" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00BCD4]">Contact Number</Label>
                    <Input type="tel" value={touristDetails.contact_phone} onChange={(e) => setTouristDetails({ ...touristDetails, contact_phone: e.target.value })} className="bg-white/50 border-gray-200 rounded-2xl h-14" placeholder="+91" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {touristDetails.tourists.map((tourist, idx) => (
                    <div key={idx} className="p-6 bg-white/40 rounded-3xl border border-white/50 space-y-4 hover:shadow-lg transition-all">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Passenger {idx + 1}</p>
                      <Input type="text" value={tourist.name} onChange={(e) => {
                          const updated = [...touristDetails.tourists];
                          updated[idx].name = e.target.value;
                          setTouristDetails({ ...touristDetails, tourists: updated });
                        }} placeholder="Full Name" className="bg-transparent border-b-2 border-gray-100 rounded-none h-10 px-0 focus:border-[#00BCD4] transition-all font-bold" />
                      <div className="flex gap-4">
                        <Input type="number" value={tourist.age} onChange={(e) => {
                            const updated = [...touristDetails.tourists];
                            updated[idx].age = e.target.value;
                            setTouristDetails({ ...touristDetails, tourists: updated });
                          }} placeholder="Age" className="bg-transparent border-b-2 border-gray-100 rounded-none h-10 px-0 focus:border-[#00BCD4] font-bold" />
                         <select value={tourist.gender} onChange={(e) => {
                             const updated = [...touristDetails.tourists];
                             updated[idx].gender = e.target.value;
                             setTouristDetails({ ...touristDetails, tourists: updated });
                           }} className="bg-transparent border-b-2 border-gray-100 text-gray-500 font-bold text-xs focus:border-[#00BCD4] outline-none flex-1">
                           <option value="male">Male</option>
                           <option value="female">Female</option>
                           <option value="other">Other</option>
                         </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex justify-between gap-4">
                <Button onClick={() => setStep(3)} variant="ghost" className="text-gray-400 hover:text-[#00BCD4]">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Modify Plan
                </Button>
                <Button onClick={saveTouristDetails} className="bg-icy-aqua rounded-full px-12 py-7 font-black shadow-2xl">
                  Save & Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-[3rem] p-10 md:p-16 text-center">
               <h2 className="text-3xl font-black text-gray-800 mb-4">Ready to Depart?</h2>
               <p className="text-gray-400 text-sm mb-12 font-medium">Finalize your pricing and secure your hub access</p>
               
               <div className="max-w-sm mx-auto space-y-5 mb-12 bg-[#00BCD4]/5 p-8 rounded-[2rem] border border-[#00BCD4]/10">
                 <div className="flex justify-between text-xs font-black uppercase text-gray-400">
                   <span>Base Hub Package</span>
                   <span className="text-gray-800">Confirmed</span>
                 </div>
                 <div className="flex justify-between text-[#00BCD4] text-2xl font-black border-t border-gray-100 pt-5">
                   <span>Fee</span>
                   <span>₹{agencyCharges || '0'}</span>
                 </div>
               </div>

               <Input type="number" min="0" value={agencyCharges} onChange={(e) => setAgencyCharges(e.target.value)} placeholder="Enter Hub Service Fee (₹)" className="max-w-xs mx-auto mb-10 bg-white border-gray-200 text-center font-bold text-xl h-16 rounded-2xl shadow-sm" />

               {agencyCharges ? (
                  <UPIPayment tripId={tripId} onSuccess={() => { toast.success('Yatra Hub Confirmed!'); navigate('/dashboard'); }} />
                ) : (
                  <Button onClick={saveAgencyChargesData} className="bg-gray-800 text-white rounded-full px-16 py-7 font-black hover:scale-105 transition-transform shadow-xl">
                    Lock Price
                  </Button>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TripPlanner;