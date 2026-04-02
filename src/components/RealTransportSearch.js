import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RealTransportSearch = ({ tripDetails, onNext }) => {
  const [searchUrl, setSearchUrl] = useState('');
  const [showCabDialog, setShowCabDialog] = useState(false);
  const [cabChoice, setCabChoice] = useState('');

  const generateSearchUrl = useCallback(() => {
    const { from_location, destination, start_date, num_people, transport_mode } = tripDetails;
    
    // Format date for URLs (YYYYMMDD or YYYY-MM-DD depending on platform)
    const formattedDate = start_date.replace(/-/g, '');
    
    let url = '';
    
    if (transport_mode === 'flight') {
      // Ixigo flights URL structure
      const fromCode = getAirportCode(from_location);
      const toCode = getAirportCode(destination);
      url = `https://www.ixigo.com/search/result/flight/${fromCode}-${toCode}/${formattedDate}/${num_people}/0/0/E`;
    } else if (transport_mode === 'train') {
      // Ixigo trains URL structure  
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
      'mumbai': 'BOM',
      'delhi': 'DEL',
      'bangalore': 'BLR',
      'goa': 'GOI',
      'kolkata': 'CCU',
      'chennai': 'MAA',
      'hyderabad': 'HYD',
      'pune': 'PNQ',
      'jaipur': 'JAI',
      'ahmedabad': 'AMD'
    };
    
    const cityLower = city.toLowerCase().trim();
    return airportCodes[cityLower] || 'DEL';
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
      // Generate Ola/Uber style search URL
      const url = `https://www.google.com/search?q=cab+from+${tripDetails.from_location}+to+${tripDetails.destination}`;
      setSearchUrl(url);
    }
  };

  if (showCabDialog) {
    return (
      <Dialog open={showCabDialog} onOpenChange={setShowCabDialog}>
        <DialogContent className="bg-white border border-[#E8E6E1] rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium text-[#1C2B23] mb-4">
              Choose Cab Option
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              data-testid="cab-by-agency-btn"
              onClick={() => handleCabChoice('agency')}
              className="w-full bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-lg py-6 text-lg"
            >
              By Agency
              <p className="text-sm opacity-90 mt-1">Agency will provide cab service</p>
            </Button>
            <Button
              data-testid="cab-search-btn"
              onClick={() => handleCabChoice('search')}
              variant="outline"
              className="w-full border-2 border-[#E8E6E1] hover:border-[#7BA4A8] rounded-lg py-6 text-lg"
            >
              Search Cabs
              <p className="text-sm opacity-70 mt-1">Search available cab options online</p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (cabChoice === 'agency') {
    return (
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center">
        <h3 className="text-xl font-medium text-[#1C2B23] mb-4">Cab by Agency</h3>
        <p className="text-[#5A6B5D] mb-6">
          The travel agency will arrange cab service for your journey from {tripDetails.from_location} to {tripDetails.destination}.
        </p>
        <p className="text-sm text-[#5A6B5D] mb-6">
          Cab details and pricing will be included in your final package.
        </p>
        <Button
          onClick={onNext}
          className="bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-full px-8 py-3"
        >
          Continue to Stays
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
        <h3 className="text-lg font-medium text-[#1C2B23] mb-4">
          {tripDetails.transport_mode === 'flight' ? 'Search Flights' : 'Search Trains'}
        </h3>
        <p className="text-sm text-[#5A6B5D] mb-4">
          We'll open Ixigo with your travel details pre-filled. View real-time prices and availability.
        </p>
        
        <div className="bg-[#F7F5F0] rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">From:</span>
            <span className="font-medium text-[#1C2B23]">{tripDetails.from_location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">To:</span>
            <span className="font-medium text-[#1C2B23]">{tripDetails.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Date:</span>
            <span className="font-medium text-[#1C2B23]">
              {new Date(tripDetails.start_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Passengers:</span>
            <span className="font-medium text-[#1C2B23]">{tripDetails.num_people}</span>
          </div>
        </div>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-lg py-6 text-lg font-medium">
            Search on Ixigo
            <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </a>

        <p className="text-xs text-[#5A6B5D] mt-3 text-center">
          Opens in a new tab. Book directly on Ixigo and return here to continue.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          className="bg-[#7BA4A8] text-white hover:bg-[#658D91] rounded-full px-8 py-3"
        >
          I've Checked Options - Continue to Stays
        </Button>
      </div>
    </div>
  );
};

export default RealTransportSearch;