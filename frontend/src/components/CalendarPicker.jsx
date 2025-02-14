import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPicker = ({ selectedDate, onDateSelect, site }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityCache, setAvailabilityCache] = useState({});

  // Fetch availability for the current month
  useEffect(() => {
    fetchMonthAvailability();
  }, [currentMonth]);

  const fetchMonthAvailability = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/sites/${site.id}/availability/${year}-${month}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailabilityCache(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigation functions
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Format date for comparison
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check availability for a specific date
  const getDateAvailability = (date) => {
    const formattedDate = formatDate(date);
    let hasAvailableSlots = false;
    
    // First check if it's in the availabilityCache
    if (availabilityCache[formattedDate]) {
      return !availabilityCache[formattedDate].fullyBooked;
    }

    // Fallback to checking timeSlots directly
    const slots = site.timeSlots || [];
    const availableSlots = slots.filter(slot => {
      if (!slot.time || !slot.capacity) return false;
      
      // If we have booking data for this slot
      const dateBookings = (site.bookings || [])
        .filter(booking => 
          booking.date === formattedDate && 
          booking.time === slot.time
        );

      return dateBookings.length < slot.capacity;
    });

    return availableSlots.length > 0;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const formattedDate = formatDate(date);
      const isSelected = selectedDate === formattedDate;
      const isPast = isPastDate(date);
      const hasAvailability = !isPast && getDateAvailability(date);

      days.push(
        <button
          key={day}
          onClick={() => hasAvailability && onDateSelect(formattedDate)}
          disabled={!hasAvailability}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm relative
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${!hasAvailability 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-blue-50 cursor-pointer font-medium'}
          `}
        >
          {day}
          {!isPast && (
            <span 
              className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 
                         w-1 h-1 rounded-full 
                         ${hasAvailability ? 'bg-green-500' : 'bg-red-500'}`} 
            />
          )}
        </button>
      );
    }

    return days;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          Slots Available
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
          Fully Booked
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;