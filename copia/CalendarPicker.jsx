import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPicker = ({ selectedDate, onDateSelect, site }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthAvailability();
  }, [currentMonth, site]);

  const fetchMonthAvailability = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      // Use site.id if it exists, otherwise use site._id
      const siteId = site.id || site._id;
      
      console.log('Fetching availability for:', {
        siteId,
        year,
        month,
        url: `${import.meta.env.VITE_API_URL}/sites/${siteId}/availability/${year}-${month}`
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/sites/${siteId}/availability/${year}-${month}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      console.log('Availability data:', data);
      setAvailabilityData(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const checkDateAvailability = (date) => {
    const formattedDate = formatDate(date);
    const dateData = availabilityData[formattedDate];

    if (!dateData) {
      console.log('No availability data for:', formattedDate);
      return false;
    }

    // Check if any time slot has remaining capacity
    return Object.values(dateData.timeSlots).some(slot => slot.remaining > 0);
  };

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);

    // Empty cells for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Generate days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const formattedDate = formatDate(date);
      const isSelected = selectedDate === formattedDate;
      const isPast = isPastDate(date);
      const hasAvailability = !isPast && checkDateAvailability(date);

      days.push(
        <button
          key={day}
          onClick={() => hasAvailability && onDateSelect(formattedDate)}
          disabled={!hasAvailability || isPast}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm relative
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${!hasAvailability || isPast
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

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>

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

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;