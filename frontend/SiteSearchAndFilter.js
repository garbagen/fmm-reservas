import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SiteSearchAndFilter = () => {
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  // Fetch sites when component mounts
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch('https://fmm-reservas-api.onrender.com/api/sites');
        const data = await response.json();
        setSites(data);
        setFilteredSites(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sites:', error);
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let results = sites;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(site => 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      results = results.filter(site => 
        site.timeSlots.some(slot => {
          const hour = parseInt(slot.time.split(':')[0]);
          switch(timeFilter) {
            case 'morning': return hour >= 6 && hour < 12;
            case 'afternoon': return hour >= 12 && hour < 17;
            case 'evening': return hour >= 17;
            default: return true;
          }
        })
      );
    }

    setFilteredSites(results);
  }, [searchTerm, timeFilter, sites]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search heritage sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Times</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSites.map((site) => (
          <div 
            key={site._id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{site.name}</h3>
            <p className="text-gray-600 mb-4">{site.description}</p>
            <div className="space-y-1">
              <p className="text-sm font-medium">Available Times:</p>
              <div className="flex flex-wrap gap-2">
                {site.timeSlots.map((slot, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {slot.time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredSites.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No heritage sites found matching your criteria
        </div>
      )}
    </div>
  );
};

export default SiteSearchAndFilter;