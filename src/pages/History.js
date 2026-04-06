import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { History, RefreshCw, Calendar, Users, Plane, Train, Car, ArrowRight, ExternalLink, LoaderCircle, Sparkles, ShieldCheck, Send, Download } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      console.log('Hub: Accessing trip archives...');
      const data = await tripAPI.getTrips();
      const tripsArray = Array.isArray(data) ? data : (data?.trips || []);
      setTrips(tripsArray);
    } catch (error) {
      console.error('Hub Archive Error:', error);
      toast.error('Failed to access trip archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const downloadManifest = (trip, type) => {
    const doc = new jsPDF();
    
    if (type === 'agency') {
      // Agency Copy (Internal)
      doc.setFontSize(22);
      doc.setTextColor(26, 11, 46);
      doc.text('Y.A.S.H AGENCY MANIFEST (INTERNAL)', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Manifest ID: ${trip.trip_id}`, 20, 35);
      doc.text(`Archived: ${new Date().toLocaleString()}`, 20, 40);
      doc.line(20, 45, 190, 45);

      doc.setFontSize(14);
      doc.setTextColor(168, 85, 247);
      doc.text('[CONTACT DATA]', 20, 55);
      doc.setFontSize(11);
      doc.setTextColor(26, 11, 46);
      doc.text(`Phone: ${trip.contact_phone || 'N/A'}`, 25, 65);
      doc.text(`Email: ${trip.contact_email || 'N/A'}`, 25, 72);

      doc.setFontSize(14);
      doc.setTextColor(168, 85, 247);
      doc.text('[PASSENGER MATRIX]', 20, 85);
      doc.setFontSize(10);
      doc.setTextColor(26, 11, 46);
      const pax = trip.passengers || [];
      if (pax.length > 0) {
        pax.forEach((p, i) => {
          doc.text(`${i + 1}. ${p.name || 'Anon'} | Age: ${p.age} | Proof: ${p.proof}`, 25, 95 + (i * 8));
        });
      } else {
        doc.text(`Sync Count: ${trip.num_people} Personnel`, 25, 95);
      }

      const currentY = pax.length > 0 ? (95 + (pax.length * 8) + 10) : 115;
      doc.setFontSize(14);
      doc.setTextColor(168, 85, 247);
      doc.text('[FINANCIAL SETTLEMENT]', 20, currentY);
      doc.setFontSize(11);
      doc.setTextColor(26, 11, 46);
      doc.text(`Agency Markup: Rs. ${trip.agency_charge || 0}`, 25, currentY + 10);
      doc.text(`Deployment Status: ${trip.status.toUpperCase()}`, 25, currentY + 17);
      
      doc.save(`AGENCY_ARCHIVE_${trip.trip_id.slice(0, 8)}.pdf`);
    } else {
      // Customer Copy
      doc.setFontSize(26);
      doc.setTextColor(168, 85, 247);
      doc.text('Y.A.S.H', 105, 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`VOYAGE ARCHIVE: ${trip.destination.toUpperCase()}`, 105, 35, { align: 'center' });
      doc.line(20, 45, 190, 45);

      doc.setFontSize(16);
      doc.setTextColor(26, 11, 46);
      doc.text('Itinerary Overview', 20, 60);
      doc.setFontSize(10);
      doc.setTextColor(50);
      const days = trip.itinerary?.days || [];
      days.slice(0, 10).forEach((day, i) => {
        doc.text(`Day ${day.day}: ${day.title}`, 25, 75 + (i * 8));
      });

      doc.setFontSize(16);
      doc.setTextColor(26, 11, 46);
      const costY = 75 + (Math.min(days.length, 10) * 8) + 15;
      doc.text('Voyage Logistics', 20, costY);
      doc.setFontSize(12);
      doc.text(`Vector: ${trip.from_location} to ${trip.destination}`, 25, costY + 12);
      doc.text(`Transport Vector: ${trip.transport_mode.toUpperCase()}`, 25, costY + 22);

      doc.setTextColor(150);
      doc.setFontSize(8);
      doc.text('Archived via Y.A.S.H Hub Protocol', 105, 285, { align: 'center' });

      doc.save(`VOYAGE_PLAN_${trip.trip_id.slice(0, 8)}.pdf`);
    }
    toast.success(`${type === 'agency' ? 'Archive Matrix' : 'Journey Blueprint'} Synchronized.`);
  };

  return (
    <div className="min-h-screen pb-32">
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <header className="mb-20">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-[2rem] glass flex items-center justify-center shadow-xl shadow-[#A855F7]/10">
                <History className="w-8 h-8 text-[#A855F7]" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-[#1a0b2e] tracking-tight">Hub Archive</h1>
                <p className="text-[#A855F7]/40 text-sm font-bold uppercase tracking-[0.2em] mt-2">Chronicles of Yatra And Stay Hub</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button 
                onClick={fetchHistory}
                className="flex items-center gap-3 px-8 py-4 glass rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all duration-500"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Synchronizing...' : 'Sync Archive'}
              </button>
            </motion.div>
          </div>
        </header>

        {/* content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <LoaderCircle className="w-12 h-12 animate-spin text-[#A855F7]" />
              <div className="absolute inset-0 blur-xl bg-[#A855F7]/20 rounded-full" />
            </div>
            <p className="mt-8 text-[#1a0b2e]/30 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Protocols...</p>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 card-3d-wrapper">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.trip_id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  onClick={() => navigate(`/trip/${trip.trip_id}`)}
                  className="card-3d glass-card rounded-[3rem] p-10 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A855F7]/10 rounded-full blur-[60px] group-hover:bg-[#A855F7]/20 transition-all duration-700" />
                  
                  <div className="flex items-center justify-between mb-10 relative z-10">
                     <span className="text-[10px] font-black text-[#1a0b2e] bg-white/40 px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-[#A855F7]/20 group-hover:bg-[#A855F7] group-hover:text-white transition-all duration-500">
                       {trip.status}
                     </span>
                     <span className="text-[11px] font-bold text-[#1a0b2e]/20 group-hover:text-[#1a0b2e]/50 transition-colors">
                       {new Date(trip.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </span>
                  </div>

                  <h3 className="text-3xl font-black text-[#1a0b2e] mb-8 group-hover:translate-x-2 transition-transform duration-500 relative z-10 leading-tight">
                    {trip.from_location} <ArrowRight className="inline w-5 h-5 mx-2 text-[#A855F7]/30" /> {trip.destination}
                  </h3>

                  <div className="space-y-5 mb-10 relative z-10">
                    <div className="flex items-center gap-4 text-sm font-bold text-[#1a0b2e]/40 group-hover:text-[#1a0b2e]/70 transition-colors">
                      <Calendar className="w-5 h-5 text-[#A855F7]" />
                      {trip.start_date} • {trip.num_days} Deployment Days
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-[#1a0b2e]/40 group-hover:text-[#1a0b2e]/70 transition-colors">
                      <Users className="w-5 h-5 text-[#A855F7]" />
                      {trip.num_people} Personnel Synchronized
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#1a0b2e]/5 flex items-center justify-between group-hover:border-[#A855F7]/20 transition-all duration-500 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="bg-white/60 p-3 rounded-2xl group-hover:bg-[#A855F7] transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#A855F7]/20">
                          {trip.transport_mode === 'flight' && <Plane className="w-5 h-5 text-[#A855F7] group-hover:text-white" />}
                          {trip.transport_mode === 'train' && <Train className="w-5 h-5 text-[#A855F7] group-hover:text-white" />}
                          {trip.transport_mode === 'car' && <Car className="w-5 h-5 text-[#A855F7] group-hover:text-white" />}
                        </div>
                        <span className="text-[11px] font-black uppercase text-[#1a0b2e]/30 group-hover:text-[#1a0b2e] tracking-widest">{trip.transport_mode === 'car' ? 'Ground Cab' : trip.transport_mode}</span>
                     </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); downloadManifest(trip, 'agency'); }}
                          className="w-10 h-10 rounded-xl border border-[#1a0b2e]/10 flex items-center justify-center hover:bg-[#1a0b2e] hover:text-white transition-all shadow-sm group/btn"
                          title="Agency Copy"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#1a0b2e] group-hover/btn:text-white" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); downloadManifest(trip, 'customer'); }}
                          className="w-10 h-10 rounded-xl border border-[#A855F7]/10 flex items-center justify-center hover:bg-[#A855F7] hover:text-white transition-all shadow-sm group/btn"
                          title="Send to Customer"
                        >
                          <Send className="w-4 h-4 text-[#A855F7] group-hover/btn:text-white" />
                        </button>
                        <div className="w-10 h-10 rounded-xl border border-[#1a0b2e]/10 flex items-center justify-center group-hover:bg-[#1a0b2e] group-hover:border-[#1a0b2e] transition-all duration-500 shadow-sm">
                          <ExternalLink className="w-4 h-4 text-[#1a0b2e] group-hover:text-white" />
                        </div>
                      </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 glass rounded-[4rem] border-dashed border-2 border-[#A855F7]/10 relative overflow-hidden"
          >
            <History className="w-24 h-24 text-[#A855F7]/10 mx-auto mb-10" />
            <p className="text-[#1a0b2e]/20 font-black uppercase tracking-[0.4em] text-[12px] mb-6">Archive Empty</p>
            <p className="text-[#1a0b2e]/40 font-bold max-w-xs mx-auto italic">No prior deployments detected in the Hub records. Start your first journey to begin the chronicle.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/dashboard')}
              className="mt-12 px-10 py-5 bg-[#A855F7] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-[#A855F7]/20"
            >
              Initiate Deployment
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Decorative BG elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-[#A855F7]/5 rounded-full blur-[140px] pulse-bg" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[700px] h-[700px] bg-[#f3e8ff] rounded-full blur-[150px] animate-float opacity-50" />
      </div>
    </div>
  );
};

export default HistoryPage;
