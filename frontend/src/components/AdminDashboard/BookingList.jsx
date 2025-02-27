// src/components/AdminDashboard/BookingList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EnhancedAdminTable from './Table';
import { ChevronDown, ChevronRight, Calendar, MapPin } from 'lucide-react';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSites, setExpandedSites] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'bySite'
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both bookings and sites data
      const [bookingsResponse, sitesResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/sites`)
      ]);
      
      if (!bookingsResponse.ok) throw new Error('Failed to fetch bookings');
      if (!sitesResponse.ok) throw new Error('Failed to fetch sites');
      
      const bookingsData = await bookingsResponse.json();
      const sitesData = await sitesResponse.json();
      
      // Initialize all sites as expanded
      const initialExpandedState = {};
      sitesData.forEach(site => {
        initialExpandedState[site._id || site.id] = true;
      });
      
      setBookings(bookingsData);
      setSites(sitesData);
      setExpandedSites(initialExpandedState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete booking');
      
      // Refresh data after deletion
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async (bookingIds) => {
    try {
      await Promise.all(
        bookingIds.map(id =>
          fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSiteExpansion = (siteId) => {
    setExpandedSites(prev => ({
      ...prev,
      [siteId]: !prev[siteId]
    }));
  };

  const toggleExpandAll = (expand) => {
    const newState = {};
    sites.forEach(site => {
      newState[site._id || site.id] = expand;
    });
    setExpandedSites(newState);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const columns = [
    {
      key: 'visitorName',
      header: 'Visitor',
      render: (value) => value
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'time',
      header: 'Time',
      render: (value) => value
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value).toLocaleString()
    }
  ];

  // Group bookings by site
  const bookingsBySite = sites.map(site => {
    const siteBookings = bookings.filter(booking => 
      booking.siteName === site.name || 
      booking.siteName === site._id || 
      booking.siteName === site.id
    );
    
    return {
      site,
      bookings: siteBookings
    };
  });

  if (loading) return <div className="text-center p-8">Loading bookings data...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
        
        {/* View toggle buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg border ${
              viewMode === 'all' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setViewMode('bySite')}
            className={`px-4 py-2 rounded-lg border ${
              viewMode === 'bySite' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Group by Site
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {viewMode === 'all' ? (
        // Regular table view (all bookings)
        <EnhancedAdminTable
          data={bookings}
          columns={[
            {
              key: 'siteName',
              header: 'Site',
              render: (value) => value
            },
            ...columns
          ]}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          filename="all-bookings"
        />
      ) : (
        // Grouped by site view
        <div className="space-y-6">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => toggleExpandAll(true)}
              className="px-3 py-1 text-sm bg-gray-100 rounded-l-lg border border-gray-300 hover:bg-gray-200"
            >
              Expand All
            </button>
            <button
              onClick={() => toggleExpandAll(false)}
              className="px-3 py-1 text-sm bg-gray-100 rounded-r-lg border border-gray-300 border-l-0 hover:bg-gray-200"
            >
              Collapse All
            </button>
          </div>
          
          {bookingsBySite.map(({ site, bookings }) => (
            <div 
              key={site._id || site.id} 
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              {/* Site Header */}
              <div 
                className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between cursor-pointer"
                onClick={() => toggleSiteExpansion(site._id || site.id)}
              >
                <div className="flex items-center">
                  {expandedSites[site._id || site.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
                  )}
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="font-medium text-lg">{site.name}</h3>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                  {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
                </div>
              </div>
              
              {/* Site Bookings */}
              {expandedSites[site._id || site.id] && (
                <div>
                  {bookings.length > 0 ? (
                    <EnhancedAdminTable
                      data={bookings}
                      columns={columns}
                      onDelete={handleDelete}
                      onBulkDelete={handleBulkDelete}
                      filename={`bookings-${site.name}`}
                    />
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No bookings for this site
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;