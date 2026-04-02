import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const RealStaySearch = ({ tripDetails, onNext }) => {
  const [searchUrl, setSearchUrl] = useState('');

  const generateSearchUrl = useCallback(() => {
    const { destination, start_date, num_days, num_people } = tripDetails;
    
    // Calculate check-out date
    const checkInDate = new Date(start_date);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + num_days);
    
    // Format dates for MakeMyTrip (MMDDYYYY)
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}${day}${year}`;
    };
    
    const checkIn = formatDate(checkInDate);
    const checkOut = formatDate(checkOutDate);
    
    // MakeMyTrip URL structure
    const citySlug = destination.toLowerCase().replace(/\s+/g, '-');
    
    const url = `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${checkIn}&checkout=${checkOut}&city=${citySlug}&roomStayQualifier=${num_people}e0e&searchText=${destination}`;
    
    setSearchUrl(url);
  }, [tripDetails]);

  useEffect(() => {
    generateSearchUrl();
  }, [generateSearchUrl]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
        <h3 className="text-lg font-medium text-[#1C2B23] mb-4">
          Search Accommodations
        </h3>
        <p className="text-sm text-[#5A6B5D] mb-4">
          We'll open MakeMyTrip with your stay details pre-filled. View real hotels with actual pricing and availability.
        </p>
        
        <div className="bg-[#F7F5F0] rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Location:</span>
            <span className="font-medium text-[#1C2B23]">{tripDetails.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Check-in:</span>
            <span className="font-medium text-[#1C2B23]">
              {new Date(tripDetails.start_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Check-out:</span>
            <span className="font-medium text-[#1C2B23]">
              {new Date(new Date(tripDetails.start_date).getTime() + tripDetails.num_days * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Guests:</span>
            <span className="font-medium text-[#1C2B23]">{tripDetails.num_people}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5A6B5D]">Duration:</span>
            <span className="font-medium text-[#1C2B23]">{tripDetails.num_days} nights</span>
          </div>
        </div>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full bg-[#D96C4A] text-white hover:bg-[#C55B39] rounded-lg py-6 text-lg font-medium">
            Search on MakeMyTrip
            <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </a>

        <p className="text-xs text-[#5A6B5D] mt-3 text-center">
          Opens in a new tab. Browse hotels and return here to continue with booking.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          className="bg-[#7BA4A8] text-white hover:bg-[#658D91] rounded-full px-8 py-3"
        >
          I've Checked Hotels - Continue to Checkout
        </Button>
      </div>
    </div>
  );
};

export default RealStaySearch;