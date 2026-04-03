import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Car, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RealTransportSearch = ({ tripDetails, onNext }) => {
  const [searchUrl, setSearchUrl] = useState('');
  const [showCabDialog, setShowCabDialog] = useState(false);
  const [cabChoice, setCabChoice] = useState('');

  const generateSearchUrl = useCallback(() => {
    const { from_location, destination, start_date, num_people, transport_mode } = tripDetails;
    const formattedDate = start_date.replace(/-/g, '');
    let url = '';
    
    if (transport_mode === 'flight') {
      const fromCode = getAirportCode(from_location);
      const toCode = getAirportCode(destination);
      url = `https://www.ixigo.com/search/result/flight/${fromCode}-${toCode}/${formattedDate}/${num_people}/0/0/E`;
    } else if (transport_mode === 'train') {
      const fromSlug = from_location.toLowerCase().replace(/\s+/g, '-');
      const toSlug = destination.toLowerCase().replace(/\s+/g, '-');
      const dateFormatted = new Date(start_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toLowerCase().replace(/\s+/g, '-');
      url = `https://www.ixigo.com/trains/${fromSlug}-to-${toSlug}/${dateFormatted}`;
    }
    setSearchUrl(url);
  }, [tripDetails]);

  const getAirportCode = (city) => {
    const airportCodes = {
      'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR', 'goa': 'GOI',
      'kolkata': 'CCU', 'chennai': 'MAA', 'hyderabad': 'HYD', 'pune': 'PNQ',
      'jaipur': 'JAI', 'ahmedabad': 'AMD'
    };
    return airportCodes[city.toLowerCase().trim()] || 'DEL';
  };

  useEffect(() => {
    if (tripDetails.transport_mode === 'car') {
      setShowCabDialog(true);
    } else {
      generateSearchUrl();
    }
  }, [tripDetails.transport_mode, generateSearchUrl]);

  const handleCabChoice = (choice) => {
    setCabChoice(choice);
    setShowCabDialog(false);
    if (choice === 'search') {
      const url = `https://www.google.com/search?q=cab+from+${tripDetails.from_location}+to+${tripDetails.destination}`;
      setSearchUrl(url);
    }
  };

  if (showCabDialog) {
    return (
      <Dialog open={showCabDialog} onOpenChange={setShowCabDialog}>
        <DialogContent className="bg-[#121212] border border-[#D4AF37]/20 rounded-2xl p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#D4AF37] mb-4">
              Luxury Transport Options
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleCabChoice('agency')}
              className="w-full bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-lg py-8 text-lg font-bold"
            >
              <div className="text-center">
                <p>Private VIP Chauffeur</p>
                <p className="text-xs font-normal opacity-80 mt-1">Agency provided luxury transport</p>
              </div>
            </Button>
            <Button
              onClick={() => handleCabChoice('search')}
              variant="outline"
              className="w-full border-[#D4AF37]/20 hover:border-[#D4AF37] rounded-lg py-8 text-lg text-gray-400 hover:text-[#D4AF37]"
            >
              <div className="text-center">
                <p>Search On-Demand</p>
                <p className="text-xs font-normal opacity-70 mt-1">Find premium rentals online</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Transport Concierge
        </h3>
        
        <div className="bg-black/40 rounded-xl p-6 mb-8 border border-[#D4AF37]/10 space-y-4 text-sm text-gray-300">
          <div className="flex justify-between border-b border-[#D4AF37]/5 pb-2">
            <span>Route:</span>
            <span className="font-bold text-white">{tripDetails.from_location} → {tripDetails.destination}</span>
          </div>
          <div className="flex justify-between border-b border-[#D4AF37]/5 pb-2">
            <span>Departure:</span>
            <span className="font-bold text-white">{new Date(tripDetails.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="font-bold text-[#D4AF37] uppercase">{tripDetails.transport_mode}</span>
          </div>
        </div>

        <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-xl py-8 text-lg font-bold shadow-lg">
            Search Premium Options
            <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </a>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Secure bookings via our global travel partners.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          className="text-gray-400 hover:text-[#D4AF37] transition-colors font-medium border-b border-transparent hover:border-[#D4AF37] rounded-none px-0 bg-transparent hover:bg-transparent"
        >
          Options Reviewed - Continue to Stays
        </Button>
      </div>
    </div>
  );
};

export default RealTransportSearch;