import React from 'react';
import { Clock } from 'lucide-react';

const TimeSlotPicker = ({ slots, selectedTime, onTimeSelect }) => {
  // Helper function to format time
  const formatTime = (time) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return time;
    }
  };

  // Group time slots by morning/afternoon/evening
  const groupedSlots = slots.reduce((acc, slot) => {
    const hour = parseInt(slot.time.split(':')[0]);
    let period = 'morning';
    if (hour >= 12 && hour < 17) period = 'afternoon';
    if (hour >= 17) period = 'evening';
    
    if (!acc[period]) acc[period] = [];
    acc[period].push(slot);
    return acc;
  }, {});

  const periodLabels = {
    morning: 'Morning (Before 12 PM)',
    afternoon: 'Afternoon (12 PM - 5 PM)',
    evening: 'Evening (After 5 PM)'
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedSlots).map(([period, periodSlots]) => (
        periodSlots.length > 0 && (
          <div key={period} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              {periodLabels[period]}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {periodSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => onTimeSelect(slot.time)}
                  disabled={slot.capacity <= 0}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${selectedTime === slot.time
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : slot.capacity > 0
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {formatTime(slot.time)}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full 
                    ${slot.capacity > 5
                      ? 'bg-green-100 text-green-700'
                      : slot.capacity > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {slot.capacity} spots
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default TimeSlotPicker;