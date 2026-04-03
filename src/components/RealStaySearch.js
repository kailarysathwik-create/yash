import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Hotel } from 'lucide-react';

const RealStaySearch = ({ tripDetails, onNext }) => {
  const [searchUrl, setSearchUrl] = useState('');

  const generateSearchUrl = useCallback(() => {
    const { destination, start_date, num_days, num_people } = tripDetails;
    const checkInDate = new Date(start_date);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + num_days);
    
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}${day}${year}`;
    };
    
    const checkIn = formatDate(checkInDate);
    const checkOut = formatDate(checkOutDate);
    const citySlug = destination.toLowerCase().replace(/\s+/g, '-');
    
    const url = `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${checkIn}&checkout=${checkOut}&city=${citySlug}&roomStayQualifier=${num_people}e0e&searchText=${destination}`;
    setSearchUrl(url);
  }, [tripDetails]);

  useEffect(() => {
    generateSearchUrl();
  }, [generateSearchUrl]);

  return (
    <div className="space-y-6">
      <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
          <Hotel className="w-5 h-5" />
          Stay Concierge
        </h3>
        
        <p className="text-sm text-gray-400 mb-6">
          Explore elite accommodations hand-picked for your journey. We've curated a selection of premium stays in {tripDetails.destination}.
        </p>
        
        <div className="bg-black/40 rounded-xl p-6 mb-8 border border-[#D4AF37]/10 space-y-4 text-sm text-gray-300">
          <div className="flex justify-between border-b border-[#D4AF37]/5 pb-2">
            <span>Location:</span>
            <span className="font-bold text-white">{tripDetails.destination}</span>
          </div>
          <div className="flex justify-between border-b border-[#D4AF37]/5 pb-2">
            <span>Check-in:</span>
            <span className="font-bold text-white">{new Date(tripDetails.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Guests:</span>
            <span className="font-bold text-[#D4AF37]">{tripDetails.num_people}</span>
          </div>
        </div>

        <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#FFD700] rounded-xl py-8 text-lg font-bold shadow-lg">
            Find Luxury Stays
            <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </a>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Compare exclusive properties via our global hotel partners.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          className="text-gray-400 hover:text-[#D4AF37] transition-colors font-medium border-b border-transparent hover:border-[#D4AF37] rounded-none px-0 bg-transparent hover:bg-transparent"
        >
          Options Reviewed - Continue to Checkout
        </Button>
      </div>
    </div>
  );
};

export default RealStaySearch;