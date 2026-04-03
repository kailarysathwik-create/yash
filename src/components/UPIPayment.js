import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, IndianRupee, Sparkles, Copy, ShieldCheck, Wallet } from 'lucide-react';
import QRCode from 'qrcode';
import { tripAPI } from '@/api/tripAPI';
import { motion } from 'framer-motion';

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
      const qr = await QRCode.toDataURL(upiString, { width: 400, margin: 2, color: { dark: '#1a0b2e', light: '#ffffff' } });
      setQrCodeUrl(qr);
    } catch (error) {
      toast.error('Failed to load settlement protocol');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { loadPaymentInfo(); }, [loadPaymentInfo]);

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      await tripAPI.confirmPayment(tripId, transactionId);
      toast.success('Settlement synchronized! Hub deployment authorized.');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to authorize settlement');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="w-16 h-16 animate-spin text-[#9370DB]" />
        <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Initializing Settlement Protocol</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d glass-card rounded-[4rem] p-12 md:p-20 border-white/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#9370DB]/10 rounded-full blur-[120px] -mr-40 -mt-40 pulse-bg" />

        <div className="flex items-center gap-6 mb-16 relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl">
            <IndianRupee className="w-10 h-10 text-[#9370DB]" />
          </div>
          <div>
            <h2 className="text-5xl font-black tracking-tighter mb-2">Financial Settlement</h2>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Secure Hub Protocol v3.0</p>
          </div>
        </div>

        {/* Amount Banner */}
        <div className="mb-12 p-10 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-between group hover:border-[#9370DB]/30 transition-all duration-500 relative z-10">
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">Total Hub Credits Required</p>
            <p className="text-6xl font-black tracking-tighter text-white">₹{paymentInfo?.total_amount?.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9370DB]/20 rounded-full text-[#9370DB] text-[9px] font-black uppercase tracking-widest border border-[#9370DB]/30">
              <ShieldCheck className="w-3 h-3" /> VERIFIED AGENT
            </div>
            <p className="text-xl font-black text-white/80">{paymentInfo?.agency_name}</p>
            <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{paymentInfo?.upi_id}</p>
          </div>
        </div>

        {/* QR Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="p-8 bg-white rounded-[3.5rem] shadow-[0_0_100px_rgba(147,112,219,0.3)] border border-white/20 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
              {qrCodeUrl && <img src={qrCodeUrl} alt="UPI QR Code" className="w-64 h-64" />}
            </div>
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/10">
              <Wallet className="w-4 h-4 text-[#9370DB]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Universal UPI Gateway</span>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8">
             <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight text-white/80">Protocol Authorization</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed italic">Scan the encrypted Hub QR code to authorize the deployment credits. Deployment proceeds immediately upon verification.</p>
             </div>

             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4 group hover:bg-white/10 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Direct UPI Node</p>
                  <Button onClick={() => { navigator.clipboard.writeText(paymentInfo?.upi_id); toast.success('UPI Node copied!'); }}
                    variant="ghost" className="h-8 rounded-xl text-[#9370DB] hover:text-white font-black text-[9px] uppercase tracking-widest p-0">
                    <Copy className="w-3 h-3 mr-2" /> Copy Node
                  </Button>
                </div>
                <code className="text-xl font-black text-white block truncate tracking-tight">{paymentInfo?.upi_id}</code>
             </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-12 border-t border-white/5 relative z-10 space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9370DB]">Hub Transaction ID (Audit Trail)</Label>
            <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
              className="glass-input h-20 text-center font-black text-2xl tracking-[0.2em] uppercase placeholder:text-white/10"
              placeholder="XXXXXXXXXXXX" />
          </div>
          
          <Button 
            onClick={handleConfirmPayment} 
            disabled={confirming}
            className="w-full bg-white text-[#1a0b2e] hover:bg-[#9370DB] hover:text-white hover:scale-[1.02] transition-all duration-500 rounded-full h-24 text-2xl font-black shadow-2xl shadow-black/50 disabled:opacity-50"
          >
            {confirming ? (
              <><Loader2 className="w-8 h-8 mr-4 animate-spin" /> Authorizing...</>
            ) : (
              <><CheckCircle2 className="w-8 h-8 mr-4 text-[#9370DB]" /> Authorize Hub Deployment</>
            )}
          </Button>
          
          <p className="text-center text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
            Automated Settlement Engine • Secure Hub Connection
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UPIPayment;