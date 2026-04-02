import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Globe } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    phone: '',
    website: '',
    upi_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API}/onboarding`,
        formData,
        { withCredentials: true }
      );

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl tracking-tight font-medium text-[#1C2B23] mb-2">
              Complete Your Profile
            </h2>
            <p className="text-sm text-[#5A6B5D]">
              Tell us about your organization to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization */}
            <div>
              <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#7BA4A8]" />
                  Organization Name
                </div>
              </Label>
              <Input
                data-testid="organization-input"
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20 transition-all duration-200 placeholder:text-[#5A6B5D]/50"
                placeholder="Your Travel Agency"
              />
            </div>

            {/* Phone */}
            <div>
              <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#7BA4A8]" />
                  Phone Number
                </div>
              </Label>
              <Input
                data-testid="phone-input"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20 transition-all duration-200 placeholder:text-[#5A6B5D]/50"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Website */}
            <div>
              <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#7BA4A8]" />
                  Website <span className="text-[#5A6B5D]/70">(Optional)</span>
                </div>
              </Label>
              <Input
                data-testid="website-input"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20 transition-all duration-200 placeholder:text-[#5A6B5D]/50"
                placeholder="https://youragency.com"
              />
            </div>

            {/* Payment Setup Section */}
            <div className="pt-4 border-t border-[#E8E6E1]">
              <h3 className="text-lg font-medium text-[#1C2B23] mb-4">Payment Setup</h3>
              <p className="text-sm text-[#5A6B5D] mb-4">
                Add your UPI ID to receive payments directly from customers. This is a one-time setup.
              </p>

              {/* UPI ID */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
                  UPI ID
                </Label>
                <Input
                  data-testid="upi-id-input"
                  type="text"
                  required
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#1C2B23] focus:border-[#7BA4A8] focus:ring-2 focus:ring-[#7BA4A8]/20 transition-all duration-200 placeholder:text-[#5A6B5D]/50"
                  placeholder="yourname@paytm or 9876543210@ybl"
                />
                <p className="text-xs text-[#5A6B5D] mt-1.5">
                  Customers will pay directly to this UPI ID via QR code
                </p>
              </div>
            </div>

            <Button
              data-testid="complete-profile-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-8 py-6 font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;