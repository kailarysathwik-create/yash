import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { QrCode, ShieldCheck, Wallet, CheckCircle2, LoaderCircle, ArrowRight } from 'lucide-react';
import { tripAPI } from '@/api/tripAPI';

const UPIPayment = ({ amount, tripId, onComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('qr'); // qr, verifying, success

  const handleVerify = async () => {
    setProcessing(true);
    setStep('verifying');
    try {
      // Simulate Hub Ledger Settlement
      await new Promise(resolve => setTimeout(resolve, 3000));
      await tripAPI.updateTripStatus(tripId, 'orchestrated');
      setStep('success');
      toast.success('Credits Settled via Lavender Protocol');
      setTimeout(onComplete, 2000);
    } catch (error) {
      toast.error('Financial Handshake Failed');
      setStep('qr');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-[4rem] p-12 border-white/50 shadow-[0_50px_100px_-20px_rgba(147,112,219,0.2)] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#9370DB]/30 to-transparent" />
        
        {step === 'qr' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 rounded-2xl bg-[#9370DB]/10 flex items-center justify-center mb-6">
                 <Wallet className="w-8 h-8 text-[#9370DB]" />
               </div>
               <h2 className="text-3xl font-black text-[#1a0b2e] tracking-tight">Credit Settlement</h2>
               <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px] mt-2">Hub Financial Protocol</p>
            </div>

            <div className="bg-white/60 p-8 rounded-[3rem] border border-white/50 shadow-inner relative group">
               <div className="w-64 h-64 mx-auto bg-white rounded-[2rem] p-6 flex items-center justify-center border-2 border-dashed border-[#9370DB]/20 group-hover:border-[#9370DB]/40 transition-colors">
                  <QrCode className="w-full h-full text-[#1a0b2e]/80" />
               </div>
               <div className="mt-8">
                  <p className="text-[10px] font-black uppercase text-[#1a0b2e]/30 tracking-[0.3em] mb-2">Total Managed Credits</p>
                  <div className="text-5xl font-black text-[#1a0b2e] tracking-tighter">₹{amount.toLocaleString()}</div>
               </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-[#1a0b2e]/30 font-black text-[9px] uppercase tracking-[0.25em]">
               <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#9370DB]" /> Encrypted</div>
               <div className="w-1 h-1 bg-[#1a0b2e]/10 rounded-full" />
               <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#9370DB]" /> Verified Hub</div>
            </div>

            <Button 
              onClick={handleVerify}
              disabled={processing}
              className="w-full bg-[#1a0b2e] text-white hover:bg-[#9370DB] hover:scale-[1.02] transition-all duration-700 rounded-full h-20 font-black text-xl shadow-2xl shadow-[#1a0b2e]/10 group"
            >
              Verify Settlement <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        )}

        {step === 'verifying' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 space-y-10">
            <div className="relative">
               <LoaderCircle className="w-20 h-20 text-[#9370DB] animate-spin mx-auto" />
               <div className="absolute inset-0 blur-2xl bg-[#9370DB]/20 rounded-full" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-[#1a0b2e] mb-2">Audit Synchronization</h3>
               <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px]">Validating Credit Transfer Node...</p>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 space-y-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
               <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div>
               <h3 className="text-4xl font-black text-[#1a0b2e] tracking-tight mb-2">Settlement Finalized</h3>
               <p className="text-[#1a0b2e]/40 font-bold uppercase tracking-widest text-[10px]">Deployment Authorized</p>
            </div>
            <p className="text-[#1a0b2e]/60 font-medium max-w-xs mx-auto">Your journey has been officially recorded in the Hub Archive.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UPIPayment;