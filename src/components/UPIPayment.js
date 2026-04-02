import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import { tripAPI } from '@/api/tripAPI'; // Use new API client

const UPIPayment = ({ tripId, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [confirming, setConfirming] = useState(false);

  const loadPaymentInfo = useCallback(async () => {
    try {
      const data = await tripAPI.getPaymentInfo(tripId);
      setPaymentInfo(data);
      
      // Generate UPI QR code
      const upiString = `upi://pay?pa=${data.upi_id}&pn=${encodeURIComponent(data.agency_name)}&am=${data.total_amount}&cu=INR&tn=Trip%20Payment`;
      const qr = await QRCode.toDataURL(upiString, { width: 300 });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error('Failed to load payment info:', error);
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadPaymentInfo();
  }, [loadPaymentInfo]);

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      await tripAPI.confirmPayment(tripId, transactionId);
      
      toast.success('Payment confirmed! Trip booked successfully.');
      onSuccess();
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#D96C4A]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-medium text-[#1C2B23] mb-6 text-center">
          Complete Your Payment
        </h2>

        {/* Payment Breakdown */}
        <div className="mb-6 p-4 bg-[#F7F5F0] rounded-lg">
          <div className="flex justify-between text-lg font-semibold text-[#1C2B23]">
            <span>Agency Service Charges</span>
            <span className="text-2xl text-[#D96C4A]">₹{paymentInfo?.total_amount?.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-xs text-[#5A6B5D] mt-2 text-center">
            {paymentInfo?.plan_name}
          </p>
        </div>

        {/* Agency Details */}
        <div className="mb-6 text-center">
          <p className="text-sm text-[#5A6B5D] mb-1">Pay to</p>
          <p className="text-lg font-medium text-[#1C2B23]">{paymentInfo?.agency_name}</p>
          <p className="text-sm text-[#7BA4A8] font-mono">{paymentInfo?.upi_id}</p>
        </div>

        {/* QR Code */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white border-2 border-[#E8E6E1] rounded-xl">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="UPI QR Code" 
                className="w-64 h-64"
              />
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-[#5A6B5D] mb-2">
            📱 Scan QR code with any UPI app
          </p>
          <div className="flex justify-center gap-3 text-xs text-[#5A6B5D]">
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>Paytm</span>
            <span>•</span>
            <span>BHIM</span>
          </div>
        </div>

        {/* Manual UPI ID Display */}
        <div className="mb-6 p-4 bg-[#F7F5F0] rounded-lg">
          <p className="text-xs text-[#5A6B5D] mb-2">Or manually enter UPI ID:</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-[#1C2B23]">{paymentInfo?.upi_id}</code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(paymentInfo?.upi_id);
                toast.success('UPI ID copied!');
              }}
              variant="outline"
              className="text-xs"
            >
              Copy
            </Button>
          </div>
        </div>

        {/* After Payment */}
        <div className="border-t border-[#E8E6E1] pt-6">
          <h3 className="text-lg font-medium text-[#1C2B23] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
            After Payment
          </h3>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-[#1C2B23] mb-1.5">
              UPI Transaction ID (Optional)
            </Label>
            <Input
              data-testid="transaction-id-input"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="bg-white border border-[#E8E6E1] rounded-lg"
              placeholder="Enter transaction ID for faster confirmation"
            />
            <p className="text-xs text-[#5A6B5D] mt-1.5">
              You can find this in your UPI app after payment
            </p>
          </div>

          <Button
            data-testid="confirm-payment-btn"
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="w-full bg-[#4A7C59] text-white hover:bg-[#3D6649] rounded-full px-8 py-6 font-medium transition-all duration-200 disabled:opacity-50"
          >
            {confirming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'I Have Completed the Payment'
            )}
          </Button>

          <p className="text-xs text-[#5A6B5D] mt-3 text-center">
            Click above after completing the UPI payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;