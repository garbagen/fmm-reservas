import React, { useState, useEffect } from 'react';
import HeritageCard from './HeritageCard';
import BookingModal from './BookingModal';

const HeritageGrid = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sites`);
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      const data = await response.json();
      setSites(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleBooking = (site) => {
    setSelectedSite(site);
    setIsBookingModalOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error: {error}. Please try again later.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search heritage sites..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="text-center text-gray-600">
          No heritage sites available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <HeritageCard 
              key={site._id || site.id} 
              site={site} 
              onBooking={handleBooking}
            />
          ))}
        </div>
      )}

      {selectedSite && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          site={selectedSite}
        />
      )}
    </div>
  );
};

export default HeritageGrid;