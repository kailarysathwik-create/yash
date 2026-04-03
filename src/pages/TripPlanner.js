import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2, Users, MapPin, Plane, Hotel, Sparkles, CreditCard } from 'lucide-react';
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
  
  // New State for Bookings
  const [bookedTransport, setBookedTransport] = useState({
    type: '',
    provider: '',
    booking_id: '', // PNR or Flight No
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
      // Send transport and stay data to the generator
      const result = await tripAPI.generateItinerary(tripId, {
        transport: bookedTransport,
        stays: bookedStays
      });
      setTrip(prev => ({ ...prev, itinerary: result.itinerary }));
      toast.success('Luxury Itinerary Crafted!');
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
      toast.success('Tourist details saved!');
      setStep(5);
    } catch (error) {
      console.error('Failed to save tourist details:', error);
      toast.error('Failed to save tourist details');
    }
  };

  const saveAgencyChargesData = async () => {
    if (!agencyCharges) {
      toast.error('Please enter agency charges');
      return;
    }

    try {
      await tripAPI.saveAgencyCharges(tripId, parseFloat(agencyCharges));
      toast.success('Charges finalized!');
      // Move to payment integration
    } catch (error) {
      console.error('Failed to save agency charges:', error);
      toast.error('Failed to save agency charges');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          <p className="mt-4 text-gray-400 font-light tracking-widest uppercase text-xs">Initializing Concierge...</p>
        </div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex justify-center mb-12 gap-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className={`h-1 w-12 rounded-full transition-all duration-500 ${
            step >= s ? 'bg-gold-sparkle shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4 selection:bg-[#D4AF37]/30">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gold-sparkle mb-4 tracking-tighter"
          >
            Y.A.S.H Luxury Concierge
          </motion.h1>
          <p className="text-gray-500 font-light uppercase tracking-[0.3em] text-xs">
            Designing excellence for {trip?.details.from_location} to {trip?.details.destination}
          </p>
        </header>

        <StepIndicator />

        <AnimatePresence mode="wait">
          {/* STEP 1: TRANSPORT */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <RealTransportSearch 
                tripDetails={trip.details} 
                bookedTransport={bookedTransport}
                setBookedTransport={setBookedTransport}
                onNext={() => setStep(2)} 
              />
            </motion.div>
          )}

          {/* STEP 2: STAYS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RealStaySearch 
                tripDetails={trip.details} 
                bookedStays={bookedStays}
                setBookedStays={setBookedStays}
                onNext={handleGenerateItinerary} 
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {/* STEP 3: AI ITINERARY */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32 text-[#D4AF37]" />
              </div>

              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-white">Your Curated Journey</h2>
                {!generating && (
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-gold-sparkle text-black hover:scale-105 transition-transform rounded-full px-8 py-6 font-bold uppercase tracking-wider text-xs shadow-xl"
                  >
                    Approve & Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {generating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-[#D4AF37]" />
                    <Sparkles className="w-6 h-6 absolute top-0 right-0 animate-pulse text-[#D4AF37]" />
                  </div>
                  <p className="text-[#D4AF37] font-medium tracking-[0.2em] uppercase text-sm animate-pulse text-center">
                    AI Concierge is weaving your<br/>exclusive itinerary...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {trip?.itinerary?.days?.map((day, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                    >
                      <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-sm font-mono">
                          {day.day}
                        </span>
                        {day.title}
                      </h3>
                      <div className="space-y-4 ml-11">
                        {day.places && Array.isArray(day.places) && (
                          <div className="flex flex-wrap gap-2">
                            {day.places.map((place, pIdx) => (
                              <span key={pIdx} className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#D4AF37]" /> {place}
                              </span>
                            ))}
                          </div>
                        )}
                        {day.activities && Array.isArray(day.activities) && (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {day.activities.map((act, aIdx) => (
                              <li key={aIdx} className="text-sm text-gray-300 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5" />
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

          {/* STEP 4: PASSENGERS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[2rem] p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Passenger Details</h2>
                  <p className="text-gray-500 text-sm">We'll send the premium itinerary to these contacts</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-white/5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Email for Itinerary</Label>
                    <Input
                      type="email"
                      value={touristDetails.contact_email}
                      onChange={(e) => setTouristDetails({ ...touristDetails, contact_email: e.target.value })}
                      className="bg-black/40 border-white/10 rounded-xl h-14"
                      placeholder="luxury@concierge.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Emergency Contact</Label>
                    <Input
                      type="tel"
                      value={touristDetails.contact_phone}
                      onChange={(e) => setTouristDetails({ ...touristDetails, contact_phone: e.target.value })}
                      className="bg-black/40 border-white/10 rounded-xl h-14"
                      placeholder="+91 99999 00000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {touristDetails.tourists.map((tourist, idx) => (
                    <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Passenger {idx + 1}</p>
                      <Input
                        type="text"
                        value={tourist.name}
                        onChange={(e) => {
                          const updated = [...touristDetails.tourists];
                          updated[idx].name = e.target.value;
                          setTouristDetails({ ...touristDetails, tourists: updated });
                        }}
                        placeholder="Full Legal Name"
                        className="bg-transparent border-b border-white/10 rounded-none h-10 px-0 focus:border-[#D4AF37] transition-all"
                      />
                      <div className="flex gap-4">
                        <Input
                          type="number"
                          value={tourist.age}
                          onChange={(e) => {
                            const updated = [...touristDetails.tourists];
                            updated[idx].age = e.target.value;
                            setTouristDetails({ ...touristDetails, tourists: updated });
                          }}
                          placeholder="Age"
                          className="bg-transparent border-b border-white/10 rounded-none h-10 px-0 focus:border-[#D4AF37]"
                        />
                         <select
                           value={tourist.gender}
                           onChange={(e) => {
                             const updated = [...touristDetails.tourists];
                             updated[idx].gender = e.target.value;
                             setTouristDetails({ ...touristDetails, tourists: updated });
                           }}
                           className="bg-transparent border-b border-white/10 text-gray-400 text-sm focus:border-[#D4AF37] outline-none flex-1"
                         >
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
                <Button 
                  onClick={() => setStep(3)} 
                  variant="ghost" 
                  className="text-gray-500 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Adjust Plan
                </Button>
                <Button
                  onClick={saveTouristDetails}
                  className="bg-gold-sparkle text-black rounded-full px-12 py-6 font-bold shadow-2xl"
                >
                  Confirm & Pay <CreditCard className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: PAYMENT */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[2rem] p-8 md:p-12 text-center"
            >
               <h2 className="text-3xl font-bold text-gold-sparkle mb-8">Secure Your Experience</h2>
               <div className="max-w-md mx-auto space-y-6 mb-12">
                 <div className="flex justify-between text-gray-400">
                   <span>Service Package</span>
                   <span className="text-white">Luxury Travel Planning</span>
                 </div>
                 <div className="flex justify-between text-[#D4AF37] text-xl font-bold border-t border-white/10 pt-4">
                   <span>Total Service Charge</span>
                   <span>₹{agencyCharges || '---'}</span>
                 </div>
               </div>

               <Input
                  type="number"
                  min="0"
                  value={agencyCharges}
                  onChange={(e) => setAgencyCharges(e.target.value)}
                  placeholder="Enter Final Agency Fee (₹)"
                  className="max-w-xs mx-auto mb-8 bg-black/40 border-white/10 text-center text-xl h-14"
                />

               {agencyCharges ? (
                  <div className="p-8 bg-black/40 rounded-3xl border border-[#D4AF37]/10">
                    <UPIPayment
                      tripId={tripId}
                      onSuccess={() => {
                        toast.success('Your Luxury Trip is Confirmed!');
                        navigate('/dashboard');
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    onClick={saveAgencyChargesData}
                    className="bg-white text-black rounded-full px-12 py-6 font-bold hover:bg-gray-200"
                  >
                    Lock in Pricing
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