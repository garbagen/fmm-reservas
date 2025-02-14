// src/components/HeritageGrid.jsx
import React, { useState, useEffect } from 'react';
import HeritageCard from './HeritageCard';

const HeritageGrid = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sites from your API
    fetch('https://fmm-reservas-api.onrender.com/api/sites')
      .then(res => res.json())
      .then(data => {
        setSites(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sites:', error);
        setLoading(false);
      });
  }, []);

  const handleBooking = (site) => {
    // Implement your booking logic here
    console.log('Booking site:', site);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search heritage sites..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white">
            <option>All Times</option>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white">
            <option>All Sites</option>
            <option>Museums</option>
            <option>Historical Buildings</option>
            <option>Archaeological Sites</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <HeritageCard 
            key={site.id} 
            site={{
              ...site,
              onBook: handleBooking
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeritageGrid;