// src/components/BookingModal.jsx
import React, { useState } from 'react';
import { X, Loader, User } from 'lucide-react';
import Alert from './Alert';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker from './TimeSlotPicker';

const BookingModal = ({ isOpen, onClose, site }) => {
  const [formData, setFormData] = useState({
    visitorName: '',
    date: '',
    time: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const validateName = () => {
    if (!formData.visitorName.trim()) {
      setErrors({ visitorName: 'Name is required' });
      return false;
    }
    if (formData.visitorName.length < 2) {
      setErrors({ visitorName: 'Name must be at least 2 characters' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateName()) {
      setStep(2);
    }
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({ ...prev, date }));
    setErrors(prev => ({ ...prev, booking: '' }));
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, time }));
    setErrors(prev => ({ ...prev, booking: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!formData.date || !formData.time) {
      setErrors({ booking: 'Please select both date and time' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: site.name,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create booking');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ visitorName: '', date: '', time: '' });
        setSuccess(false);
        setStep(1);
      }, 2000);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-tertiary hover:text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          {/* Header */}
          <h2 className="heading-primary text-2xl mb-4">Book {site.name}</h2>
          
          {/* Alerts */}
          {submitError && (
            <Alert variant="error" className="mb-4">{submitError}</Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-4">Booking successful! Redirecting...</Alert>
          )}

          {/* Step 1: Name Input */}
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="text-secondary block mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitorName: e.target.value }))}
                    className="input-primary pl-10"
                    placeholder="Enter your name"
                  />
                </div>
                {errors.visitorName && (
                  <p className="mt-1 text-red-600 text-sm">{errors.visitorName}</p>
                )}
              </div>

              <button
                onClick={handleNextStep}
                className="btn-primary w-full"
              >
                Continue to Booking
              </button>
            </div>
          ) : (
            /* Step 2: Date and Time Selection */
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <h3 className="heading-secondary mb-3">Select Date</h3>
                <CalendarPicker
                  selectedDate={formData.date}
                  onDateSelect={handleDateSelect}
                  site={site}
                />
              </div>

              {/* Time Slots */}
              {formData.date && (
  <div>
    <h3 className="heading-secondary mb-3">Select Time</h3>
    <TimeSlotPicker
      slots={site.timeSlots || []}
      selectedTime={formData.time}
      onTimeSelect={handleTimeSelect}
      selectedDate={formData.date}  // Add this line
    />
  </div>
)}

              {errors.booking && (
                <p className="text-red-600 text-sm">{errors.booking}</p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.date || !formData.time}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;