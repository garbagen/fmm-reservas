import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPicker = ({ selectedDate, onDateSelect, site }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Responsive day name formatting
  const getDayName = (day) => {
    const days = {
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      medium: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    return screenWidth < 380 ? days.short[day] : screenWidth < 768 ? days.medium[day] : days.short[day];
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
            relative h-10 w-10 flex items-center justify-center text-sm rounded-full
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${isSelected 
              ? 'bg-blue-600 text-white ring-2 ring-blue-500' 
              : !hasAvailability || isPast
                ? 'text-gray-300 cursor-not-allowed' 
                : 'hover:bg-blue-50 cursor-pointer font-medium'
            }
            transition-colors duration-200
          `}
          aria-label={`Select date ${formattedDate}`}
          aria-selected={isSelected}
          aria-disabled={!hasAvailability || isPast}
        >
          {day}
          {!isPast && (
            <span 
              className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 
                         w-1 h-1 rounded-full 
                         ${hasAvailability ? 'bg-green-500' : 'bg-red-500'}`} 
              aria-hidden="true"
            />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm p-2 sm:p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={previousMonth}
          className="p-1 sm:p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h3 className="text-sm sm:text-base font-semibold">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 sm:p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Names */}
        {[0, 1, 2, 3, 4, 5, 6].map(day => (
          <div 
            key={day}
            className="h-8 flex items-center justify-center text-xs text-gray-500"
          >
            {getDayName(day)}
          </div>
        ))}

        {/* Calendar Days */}
        {generateCalendarDays().map((day, index) => (
          <div 
            key={index}
            className="aspect-square flex items-center justify-center p-0.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          Available
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
          Fully Booked
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;