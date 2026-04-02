import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Edit2, Check, Loader2, MapPin, Plane, Home, Users, Mail, Phone, Plus, X, IndianRupee } from 'lucide-react';
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
  const [editingDay, setEditingDay] = useState(null);
  const [agencyCharges, setAgencyCharges] = useState('');
  const [touristDetails, setTouristDetails] = useState({
    tourists: [],
    contact_phone: '',
    contact_email: '',
    additional_phones: []
  });

  const loadTrip = useCallback(async () => {
    try {
      const data = await tripAPI.getTrip(tripId);
      setTrip(data);

      if (data.details && !touristDetails.tourists.length) {
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
        await generateItinerary(data);
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
      toast.error('Failed to load trip');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [tripId, navigate, touristDetails.tourists.length]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const generateItinerary = async (tripData = trip) => {
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
  };

  const updateItinerary = async (updatedItinerary) => {
    try {
      await tripAPI.updateItinerary(tripId, updatedItinerary);
      setTrip(prev => ({ ...prev, itinerary: updatedItinerary }));
      toast.success('Itinerary updated!');
    } catch (error) {
      console.error('Failed to update itinerary:', error);
      toast.error('Failed to update itinerary');
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E8E6E1] border-t-[#D96C4A]" />
          <p className="mt-4 text-[#5A6B5D]">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Step 1: View Itinerary
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-white border border-[#E8E6E1] rounded-3xl p-8 shadow-lg mb-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-medium text-[#1C2B23] mb-2">
                  {trip?.details.from_location} → {trip?.details.destination}
                </h1>
                <p className="text-[#5A6B5D]">
                  {trip?.details.num_days} days • {trip?.details.num_people} people • {trip?.details.transport_mode}
                </p>
              </div>
              <Button
                onClick={() => setStep(2)}
                className="bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-8 py-3"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {generating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#D96C4A]" />
                <span className="ml-3 text-[#5A6B5D]">Generating itinerary...</span>
              </div>
            ) : trip?.itinerary ? (
              <div className="space-y-4">
                {trip.itinerary.days?.map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border border-[#E8E6E1] rounded-lg p-4 hover:border-[#7BA4A8] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[#1C2B23] mb-2">
                          Day {day.day}: {day.title}
                        </h3>
                        <div className="space-y-2 text-sm text-[#5A6B5D]">
                          {day.places && day.places.length > 0 && (
                            <p><MapPin className="w-4 h-4 inline mr-2" />
                              {day.places.join(', ')}
                            </p>
                          )}
                          {day.activities && day.activities.length > 0 && (
                            <p>📍 {day.activities.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingDay(idx)}
                        className="text-[#7BA4A8] hover:text-[#D96C4A]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#5A6B5D] mb-4">No itinerary generated yet</p>
                <Button
                  onClick={() => generateItinerary()}
                  className="bg-[#7BA4A8] text-white hover:bg-[#658D91]"
                >
                  Generate Itinerary
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Tourist Details
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setStep(1)}
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-[#5A6B5D] text-sm">Step 2 of 5</span>
            </div>
          </div>

          <div className="bg-white border border-[#E8E6E1] rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-medium text-[#1C2B23] mb-6">Tourist Details</h2>

            <div className="space-y-6">
              {/* Contact Details */}
              <div className="pb-6 border-b border-[#E8E6E1]">
                <h3 className="text-lg font-medium text-[#1C2B23] mb-4">Primary Contact</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#7BA4A8]" />
                        Email
                      </div>
                    </Label>
                    <Input
                      type="email"
                      value={touristDetails.contact_email}
                      onChange={(e) => setTouristDetails({ ...touristDetails, contact_email: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3"
                      placeholder="primary@email.com"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#7BA4A8]" />
                        Phone
                      </div>
                    </Label>
                    <Input
                      type="tel"
                      value={touristDetails.contact_phone}
                      onChange={(e) => setTouristDetails({ ...touristDetails, contact_phone: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Tourist Details */}
              <div>
                <h3 className="text-lg font-medium text-[#1C2B23] mb-4">Tourists</h3>
                <div className="space-y-4">
                  {touristDetails.tourists.map((tourist, idx) => (
                    <div key={idx} className="p-4 border border-[#E8E6E1] rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-[#1C2B23]">Tourist {idx + 1}</span>
                        <Users className="w-4 h-4 text-[#7BA4A8]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={tourist.name}
                          onChange={(e) => {
                            const updated = [...touristDetails.tourists];
                            updated[idx].name = e.target.value;
                            setTouristDetails({ ...touristDetails, tourists: updated });
                          }}
                          placeholder="Full Name"
                          className="px-3 py-2 border border-[#E8E6E1] rounded text-sm"
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
                          className="px-3 py-2 border border-[#E8E6E1] rounded text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={saveTouristDetails}
              className="w-full mt-8 bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-8 py-6 font-medium"
            >
              Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Transport
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setStep(2)}
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-[#5A6B5D] text-sm">Step 3 of 5</span>
            </div>
          </div>

          <RealTransportSearch
            tripDetails={trip.details}
            onNext={() => setStep(4)}
          />
        </div>
      </div>
    );
  }

  // Step 4: Stays
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setStep(3)}
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-[#5A6B5D] text-sm">Step 4 of 5</span>
            </div>
          </div>

          <RealStaySearch
            tripDetails={trip.details}
            onNext={() => setStep(5)}
          />
        </div>
      </div>
    );
  }

  // Step 5: Agency Charges & Payment
  if (step === 5) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setStep(4)}
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-[#5A6B5D] text-sm">Step 5 of 5</span>
            </div>
          </div>

          <div className="bg-white border border-[#E8E6E1] rounded-3xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-medium text-[#1C2B23] mb-6">Agency Service Charges</h2>
            
            <div>
              <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#7BA4A8]" />
                  Service Charges (₹)
                </div>
              </Label>
              <Input
                type="number"
                min="0"
                value={agencyCharges}
                onChange={(e) => setAgencyCharges(e.target.value)}
                className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 mb-6"
                placeholder="e.g., 5000"
              />
              
              <Button
                onClick={saveAgencyChargesData}
                className="w-full bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-8 py-6 font-medium mb-6"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>

          {agencyCharges && (
            <UPIPayment
              tripId={tripId}
              onSuccess={() => {
                toast.success('Trip booked successfully!');
                navigate('/dashboard');
              }}
            />
          )}
        </div>
      </div>
    );
  }
};

export default TripPlanner;