import React, { useState } from 'react';
import { X } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, site }) => {
  const [formData, setFormData] = useState({
    visitorName: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Log the request data for debugging
      console.log('Sending booking request:', {
        siteName: site.name, // Changed from site._id to site.name
        ...formData
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: site.name, // Changed from site._id to site.name
          ...formData,
        }),
      });

      const data = await response.json();
      console.log('Response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create booking');
      }

      alert('Booking successful!');
      onClose();
      setFormData({ visitorName: '', date: '', time: '' }); // Reset form
    } catch (error) {
      console.error('Booking error:', error); // Debug log
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const getAvailableTimeSlots = () => {
    return site.timeSlots?.filter(slot => slot.time && slot.capacity > 0) || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Book {site.name}</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="visitorName"
                required
                value={formData.visitorName}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                min={today}
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slot
              </label>
              <select
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a time slot</option>
                {getAvailableTimeSlots().map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {slot.time} (Capacity: {slot.capacity})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;