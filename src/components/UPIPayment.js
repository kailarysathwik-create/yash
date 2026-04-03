import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, IndianRupee, Sparkles, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { tripAPI } from '@/api/tripAPI';

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
      const upiString = `upi://pay?pa=${data.upi_id}&pn=${encodeURIComponent(data.agency_name)}&am=${data.total_amount}&cu=INR&tn=Hub%20Concierge%20Settlement`;
      const qr = await QRCode.toDataURL(upiString, { width: 300 });
      setQrCodeUrl(qr);
    } catch (error) {
      toast.error('Failed to load settlement information');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { loadPaymentInfo(); }, [loadPaymentInfo]);

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      await tripAPI.confirmPayment(tripId, transactionId);
      toast.success('Settlement confirmed! Hub deployment authorized.');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to confirm settlement');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#9370DB]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-[3rem] p-10 border-white/60 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#9370DB]/5 rounded-full blur-3xl" />

        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-[#9370DB]/10 rounded-3xl flex items-center justify-center">
            <IndianRupee className="w-7 h-7 text-[#9370DB]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Financial Settlement</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hub Concierge Charges</p>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-8 p-6 bg-[#9370DB]/5 rounded-3xl border border-[#9370DB]/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
            <p className="text-4xl font-black text-gray-800">₹{paymentInfo?.total_amount?.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payable To</p>
            <p className="text-lg font-black text-[#9370DB]">{paymentInfo?.agency_name}</p>
            <p className="text-xs font-mono text-gray-400">{paymentInfo?.upi_id}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-8 flex flex-col items-center">
          <div className="p-5 bg-white rounded-3xl shadow-xl border border-gray-50 mb-4">
            {qrCodeUrl && <img src={qrCodeUrl} alt="UPI QR Code" className="w-56 h-56" />}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9370DB]/5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#9370DB]" />
            <span className="text-[10px] font-black text-[#9370DB] uppercase tracking-widest">GPay • PhonePe • Paytm • BHIM</span>
          </div>
        </div>

        {/* Manual UPI */}
        <div className="mb-8 p-5 bg-white/40 rounded-2xl border border-white/60 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Manual UPI ID</p>
            <code className="text-sm font-mono font-black text-gray-700">{paymentInfo?.upi_id}</code>
          </div>
          <Button onClick={() => { navigator.clipboard.writeText(paymentInfo?.upi_id); toast.success('UPI ID copied!'); }}
            variant="outline" className="rounded-xl border-[#9370DB]/20 text-[#9370DB] hover:bg-[#9370DB]/5 font-bold text-xs">
            <Copy className="w-3 h-3 mr-1" /> Copy
          </Button>
        </div>

        {/* Confirm */}
        <div className="border-t border-gray-100 pt-8 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9370DB]">Transaction ID (Optional)</Label>
            <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
              className="bg-white/60 border-gray-100 h-14 rounded-2xl font-bold focus:border-[#9370DB]"
              placeholder="Enter UPI transaction ID" />
          </div>
          <Button data-testid="confirm-payment-btn" onClick={handleConfirmPayment} disabled={confirming}
            className="w-full bg-[#9370DB] text-white hover:scale-[1.02] transition-all rounded-full h-20 text-xl font-black shadow-2xl shadow-[#9370DB]/20 disabled:opacity-50">
            {confirming ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Confirming...</> : (
              <><CheckCircle2 className="w-6 h-6 mr-3" /> Authorize Hub Deployment</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;