import React, { useState, useEffect } from 'react';
import HeritageCard from './HeritageCard';
import BookingModal from './BookingModal';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const HeritageGrid = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page

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

  // Filter sites based on search query
  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSites = filteredSites.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Add first page
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          Error: {error}. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search heritage sites..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg
            border border-gray-300 
            text-gray-900 
            bg-white
            placeholder-gray-500
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Sites Grid */}
          {currentSites.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              {searchQuery 
                ? 'No heritage sites found matching your search.'
                : 'No heritage sites available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSites.map((site) => (
                <HeritageCard 
                  key={site._id || site.id} 
                  site={site} 
                  onBooking={handleBooking}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-1">
              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (typeof pageNum === 'number') {
                      handlePageChange(pageNum);
                    }
                  }}
                  disabled={pageNum === '...'}
                  className={`px-3 py-1 rounded-md border ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : pageNum === '...'
                      ? 'cursor-default'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      {selectedSite && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedSite(null);
          }}
          site={selectedSite}
        />
      )}
    </div>
  );
};

export default HeritageGrid;