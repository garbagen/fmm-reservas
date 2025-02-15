import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EnhancedAdminTable from './Table';
import { Plus, X, Image } from 'lucide-react';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setBookings(data);
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete booking');
      
      await fetchBookings();
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
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (booking) => {
    // Implement edit functionality
    console.log('Edit booking:', booking);
  };

  const columns = [
    {
      key: 'visitorName',
      header: 'Visitor',
      render: (value) => value
    },
    {
      key: 'siteName',
      header: 'Site',
      render: (value) => value
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <EnhancedAdminTable
        data={bookings}
        columns={columns}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onBulkDelete={handleBulkDelete}
        filename="bookings"
      />
    </div>
  );
};

export default BookingList;