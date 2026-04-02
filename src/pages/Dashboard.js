import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, MapPin, Users, Calendar, IndianRupee, Globe, Plane, Train, Car } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI'; // Use centralized API client

const Dashboard = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_location: '',
    destination: '',
    num_people: 1,
    budget: '',
    num_days: 3,
    transport_mode: 'flight',
    start_date: '',
    places_to_cover: '',
    preferences: ''
  });

  const handleLogout = async () => {
    try {
      await tripAPI.auth.logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        num_people: parseInt(formData.num_people),
        num_days: parseInt(formData.num_days),
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      const result = await tripAPI.createTrip(payload);

      toast.success('Trip created! Generating itinerary...');
      setShowDialog(false);
      navigate(`/trip/${result.trip_id}`);
    } catch (error) {
      console.error('Trip creation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F7F5F0]/80 backdrop-blur-xl border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D96C4A] rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium text-[#1C2B23]">Y.A.S.H</span>
          </div>
          <Button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="text-[#5A6B5D] hover:text-[#1C2B23] hover:bg-[#E8E6E1]/50 rounded-full px-4 py-2 transition-all duration-200"
            variant="ghost"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1518132668962-699f644f0b95?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwbGFuZHNjYXBlJTIwbmF0dXJlJTIwdHJhdmVsfGVufDB8fHx8MTc3NDc0ODYwNnww&ixlib=rb-4.1.0&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F5F0]/60 to-[#F7F5F0]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-light text-[#1C2B23] mb-6">
              Create Unforgettable
              <br />
              <span className="font-medium">Travel Experiences</span>
            </h1>
            <p className="text-base leading-relaxed text-[#5A6B5D] max-w-2xl mx-auto mb-12">
              Design AI-powered itineraries for your clients in minutes. Let our intelligent system handle the details.
            </p>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  data-testid="book-trip-btn"
                  className="bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-10 py-6 text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Book a Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-[#E8E6E1] rounded-3xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl sm:text-3xl tracking-tight font-medium text-[#1C2B23]">
                    Trip Details
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  {/* From Location */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#7BA4A8]" />
                        From
                      </div>
                    </Label>
                    <Input
                      data-testid="from-location-input"
                      type="text"
                      required
                      value={formData.from_location}
                      onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#D96C4A]" />
                        To (Destination)
                      </div>
                    </Label>
                    <Input
                      data-testid="destination-input"
                      type="text"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                      placeholder="e.g., Goa, Manali, Kashmir"
                    />
                  </div>

                  {/* Places to Cover */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      Places to Cover on the Way <span className="text-[#5A6B5D]/70">(Optional)</span>
                    </Label>
                    <Input
                      data-testid="places-to-cover-input"
                      type="text"
                      value={formData.places_to_cover}
                      onChange={(e) => setFormData({ ...formData, places_to_cover: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                      placeholder="e.g., Pune, Lonavala (comma separated)"
                    />
                  </div>

                  {/* Grid for compact fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Number of People */}
                    <div>
                      <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#7BA4A8]" />
                          People
                        </div>
                      </Label>
                      <Input
                        data-testid="people-input"
                        type="number"
                        min="1"
                        required
                        value={formData.num_people}
                        onChange={(e) => setFormData({ ...formData, num_people: e.target.value })}
                        className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                      />
                    </div>

                    {/* Number of Days */}
                    <div>
                      <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#7BA4A8]" />
                          Days
                        </div>
                      </Label>
                      <Input
                        data-testid="days-input"
                        type="number"
                        min="1"
                        max="30"
                        required
                        value={formData.num_days}
                        onChange={(e) => setFormData({ ...formData, num_days: e.target.value })}
                        className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-[#7BA4A8]" />
                        Budget <span className="text-[#5A6B5D]/70">(Optional)</span>
                      </div>
                    </Label>
                    <Input
                      data-testid="budget-input"
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                      placeholder="Total budget in INR (₹)"
                    />
                  </div>

                  {/* Transport Mode */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-2">
                      Transport Mode
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['flight', 'train', 'car'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          data-testid={`transport-${mode}-btn`}
                          onClick={() => setFormData({ ...formData, transport_mode: mode })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.transport_mode === mode
                              ? 'border-[#D96C4A] bg-[#D96C4A]/5'
                              : 'border-[#E8E6E1] hover:border-[#7BA4A8]'
                          }`}
                        >
                          {mode === 'flight' && <Plane className="w-5 h-5" />}
                          {mode === 'train' && <Train className="w-5 h-5" />}
                          {mode === 'car' && <Car className="w-5 h-5" />}
                          <span className="text-xs capitalize">{mode === 'car' ? 'Cab' : mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      Start Date
                    </Label>
                    <Input
                      data-testid="start-date-input"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20"
                    />
                  </div>

                  {/* Preferences */}
                  <div>
                    <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                      Preferences <span className="text-[#5A6B5D]/70">(Optional)</span>
                    </Label>
                    <Textarea
                      data-testid="preferences-input"
                      value={formData.preferences}
                      onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                      className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20 min-h-[80px]"
                      placeholder="e.g., cultural sites, adventure activities, family-friendly..."
                    />
                  </div>

                  <Button
                    data-testid="create-trip-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-8 py-6 font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Trip'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'AI-Powered Planning', description: 'Smart itineraries based on preferences and budget', icon: '🤖' },
              { title: 'Complete Packages', description: 'Transport, stays, and activities all in one place', icon: '📦' },
              { title: 'Instant Generation', description: 'Get customized plans in seconds', icon: '⚡' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#D96C4A]/30 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-[#1C2B23] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#5A6B5D]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;