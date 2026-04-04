import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Wallet, CheckCircle2, LoaderCircle, ArrowRight, CreditCard, Copy } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI';
import QRCode from 'qrcode';

const UPIPayment = ({ amount, tripId, onComplete, onTransactionIdChange }) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('qr'); // qr, verifying, success
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const user = await tripAPI.auth.getMe();
        const agencyUpi = user.upi_id || 'yash@okaxis'; // Fallback just in case
        setUpiId(agencyUpi);
        
        // UPI URI format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=TRIP_ID
        const upiUri = `upi://pay?pa=${agencyUpi}&pn=YASH_Agency&am=${amount}&cu=INR&tn=YASH_${tripId}`;
        
        const url = await QRCode.toDataURL(upiUri, {
          width: 400,
          margin: 2,
          color: {
            dark: '#1a0b2e',
            light: '#ffffff'
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate secure payment node:', err);
        toast.error('Financial matrix sync failed');
      }
    };
    fetchAgencyData();
  }, [amount, tripId]);

  const handleVerify = async () => {
    if (!transactionId) {
      toast.error('Transaction ID is mandatory for settlement');
      return;
    }
    
    setProcessing(true);
    setStep('verifying');
    try {
      // Simulate Hub Ledger Settlement
      await new Promise(resolve => setTimeout(resolve, 3000));
      await tripAPI.confirmPayment(tripId, transactionId);
      setStep('success');
      toast.success('Credits Settled via Y.A.S.H Protocol');
      setTimeout(onComplete, 2000);
    } catch (error) {
      toast.error('Financial Handshake Failed');
      setStep('qr');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to terminal');
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-[4rem] p-12 border-white/50 shadow-[0_50px_100px_-20px_rgba(147,112,219,0.2)] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent" />
        
        <AnimatePresence mode="wait">
          {step === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center mb-6">
                   <Wallet className="w-8 h-8 text-[#A855F7]" />
                 </div>
                 <h2 className="text-3xl font-black text-[#1a0b2e] tracking-tight">Credit Settlement</h2>
                 <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">Secure Hub Financial Protocol</p>
              </div>

              <div className="bg-white/80 p-8 rounded-[3rem] border border-white/50 shadow-inner relative group">
                 <div className="w-64 h-64 mx-auto bg-white rounded-[2.5rem] p-4 flex items-center justify-center border-2 border-[#A855F7]/10 shadow-xl overflow-hidden">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <LoaderCircle className="w-10 h-10 text-[#A855F7] animate-spin" />
                    )}
                 </div>
                 <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase text-[#1a0b2e]/30 tracking-[0.3em]">Total Managed Credits</p>
                    <div className="text-5xl font-black text-[#1a0b2e] tracking-tighter">₹{amount.toLocaleString()}</div>
                    <button 
                      onClick={copyToClipboard}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#A855F7]/5 rounded-full text-[10px] font-black text-[#A855F7] uppercase tracking-widest hover:bg-[#A855F7]/10 transition-all"
                    >
                      <Copy className="w-3 h-3" /> {upiId}
                    </button>
                 </div>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] ml-4">Terminal Transaction ID</label>
                <div className="relative">
                   <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a0b2e]/30" />
                   <input 
                      type="text" 
                      placeholder="Enter 12-digit UPI Ref/UTR" 
                      className="w-full h-16 bg-white/50 border-2 border-transparent focus:border-[#A855F7]/30 rounded-[2rem] pl-16 pr-8 font-bold text-[#1a0b2e] transition-all outline-none"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        onTransactionIdChange(e.target.value);
                      }}
                   />
                </div>
              </div>

              <Button 
                onClick={handleVerify}
                disabled={!transactionId || processing}
                className="w-full h-20 bg-[#1a0b2e] hover:bg-[#A855F7] text-white rounded-full font-black text-xl shadow-2xl shadow-[#A855F7]/20 transition-all group"
              >
                {processing ? 'Verifying Node...' : 'Verify Settlement'}
                {!processing && <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />}
              </Button>
            </motion.div>
          )}

          {step === 'verifying' && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center space-y-8">
              <div className="relative">
                <LoaderCircle className="w-24 h-24 text-[#A855F7] animate-spin" />
                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-[#A855F7]" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#1a0b2e]">Verifying Handshake</h2>
                <p className="text-[#1a0b2e]/50 font-medium mt-2">Synchronizing with multi-chain payment ledger...</p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-20 flex flex-col items-center space-y-8">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#1a0b2e]">Settlement Authorized</h2>
                <p className="text-[#1a0b2e]/50 font-medium mt-2">Credits merged successfully. Generating manifest...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-center gap-6 text-[#1a0b2e]/30 font-black text-[9px] uppercase tracking-[0.25em]">
           <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#A855F7]" /> Encrypted</div>
           <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#A855F7]" /> Verified VPA</div>
        </div>
      </motion.div>
    </div>
  );
};

export default UPIPayment;
