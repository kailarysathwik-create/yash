import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2, Users, MapPin } from 'lucide-react';
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

        if (!data.itinerary) {
          setGenerating(true);
          try {
            const result = await tripAPI.generateItinerary(tripId);
            setTrip(prev => ({ ...prev, itinerary: result.itinerary }));
            toast.success('Itinerary generated!');
          } catch (error) {
            console.error('Failed to generate itinerary:', error);
            toast.error('Failed to generate itinerary');
          } finally {
            setGenerating(false);
          }
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

  const saveTouristDetails = async () => {
    try {
      await tripAPI.updateTouristDetails(tripId, touristDetails);
      toast.success('Tourist details saved!');
      setStep(3);
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
      toast.success('Agency charges saved!');
      setStep(5);
    } catch (error) {
      console.error('Failed to save agency charges:', error);
      toast.error('Failed to save agency charges');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          <p className="mt-4 text-gray-400">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 uppercase tracking-tight">
                  {trip?.details.from_location} → {trip?.details.destination}
                </h1>
                <p className="text-gray-400">
                  {trip?.details.num_days} days • {trip?.details.num_people} people • {trip?.details.transport_mode}
                </p>
              </div>
              <Button
                onClick={() => setStep(2)}
                className="bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-full px-8 py-3 font-bold shadow-lg"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {generating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                <span className="ml-3 text-gray-400">Generating luxury itinerary...</span>
              </div>
            ) : trip?.itinerary ? (
              <div className="space-y-4">
                {trip.itinerary.days?.map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border border-[#D4AF37]/10 rounded-xl p-6 bg-black/30 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-4">
                          Day {day.day}: {day.title}
                        </h3>
                        <div className="space-y-3 text-sm text-gray-300">
                          {day.places && day.places.length > 0 && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#D4AF37]" />
                              {day.places.join(', ')}
                            </p>
                          )}
                          {day.activities && day.activities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {day.activities.map((act, i) => (
                                <span key={i} className="bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-xs border border-[#D4AF37]/20">
                                  {act}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No itinerary generated yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button onClick={() => setStep(1)} variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <span className="text-gray-500 text-sm">Step 2 of 5</span>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Tourist Details</h2>
            <div className="space-y-6">
              <div className="pb-6 border-b border-[#D4AF37]/10">
                <h3 className="text-lg font-medium text-white mb-4">Primary Contact</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    type="email"
                    value={touristDetails.contact_email}
                    onChange={(e) => setTouristDetails({ ...touristDetails, contact_email: e.target.value })}
                    placeholder="primary@email.com"
                    className="bg-black/50 border-[#D4AF37]/20 text-white"
                  />
                  <Input
                    type="tel"
                    value={touristDetails.contact_phone}
                    onChange={(e) => setTouristDetails({ ...touristDetails, contact_phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="bg-black/50 border-[#D4AF37]/20 text-white"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Tourists</h3>
                <div className="space-y-4">
                  {touristDetails.tourists.map((tourist, idx) => (
                    <div key={idx} className="p-4 border border-[#D4AF37]/10 rounded-xl bg-black/20">
                      <span className="font-medium text-[#D4AF37]">Tourist {idx + 1}</span>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input
                          type="text"
                          value={tourist.name}
                          onChange={(e) => {
                            const updated = [...touristDetails.tourists];
                            updated[idx].name = e.target.value;
                            setTouristDetails({ ...touristDetails, tourists: updated });
                          }}
                          placeholder="Full Name"
                          className="px-3 py-2 bg-black/50 border border-[#D4AF37]/20 rounded-lg text-sm text-white"
                        />
                        <input
                          type="number"
                          value={tourist.age}
                          onChange={(e) => {
                            const updated = [...touristDetails.tourists];
                            updated[idx].age = e.target.value;
                            setTouristDetails({ ...touristDetails, tourists: updated });
                          }}
                          placeholder="Age"
                          className="px-3 py-2 bg-black/50 border border-[#D4AF37]/20 rounded-lg text-sm text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={saveTouristDetails}
              className="w-full mt-8 bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-full px-8 py-6 font-bold shadow-lg"
            >
              Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Steps 3, 4, 5 follow same pattern
  if (step >= 3) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-4xl mx-auto px-4">
           <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button onClick={() => setStep(step - 1)} variant="ghost" className="text-gray-400">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <span className="text-gray-500 text-sm">Step {step} of 5</span>
            </div>
          </div>
          
          {step === 3 && <RealTransportSearch tripDetails={trip.details} onNext={() => setStep(4)} />}
          {step === 4 && <RealStaySearch tripDetails={trip.details} onNext={() => setStep(5)} />}
          {step === 5 && (
            <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Agency Service Charges</h2>
              <Input
                type="number"
                min="0"
                value={agencyCharges}
                onChange={(e) => setAgencyCharges(e.target.value)}
                placeholder="e.g., 5000"
                className="mb-6 bg-black/50 border-[#D4AF37]/20 text-white"
              />
              <Button
                onClick={saveAgencyChargesData}
                className="w-full bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-full px-8 py-6 font-bold mb-6 shadow-lg"
              >
                Proceed to Payment
              </Button>
              {agencyCharges && (
                <div className="mt-8 border-t border-[#D4AF37]/10 pt-8">
                  <UPIPayment
                    tripId={tripId}
                    onSuccess={() => {
                      toast.success('Trip booked successfully!');
                      navigate('/dashboard');
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default TripPlanner;