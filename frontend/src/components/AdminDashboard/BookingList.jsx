import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, MapPin, Trash2, Search } from 'lucide-react';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      // Sort bookings by date, most recent first
      const sortedBookings = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBookings(sortedBookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete booking');
      
      await fetchBookings(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter bookings based on search input
  const filteredBookings = bookings.filter(booking => 
    booking.visitorName.toLowerCase().includes(filter.toLowerCase()) ||
    booking.siteName.toLowerCase().includes(filter.toLowerCase()) ||
    formatDate(booking.date).toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 grid grid-cols-5 gap-4">
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</div>
            <div className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
          </div>

          {/* Table Body */}
          <div className="bg-white divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No bookings found
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking._id} className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{booking.visitorName}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{booking.siteName}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{formatDate(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{booking.time}</span>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;