import React from 'react';
import { Clock } from 'lucide-react';

const TimeSlotPicker = ({ slots, selectedTime, onTimeSelect }) => {
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
    if (!slot.time) return acc;
    
    const hour = parseInt(slot.time.split(':')[0]);
    let period = 'morning';
    if (hour >= 12 && hour < 17) period = 'afternoon';
    if (hour >= 17) period = 'evening';
    
    if (!acc[period]) acc[period] = [];
    acc[period].push(slot);
    return acc;
  }, {});

  const periodLabels = {
    morning: '🌅 Morning (Before 12 PM)',
    afternoon: '☀️ Afternoon (12 PM - 5 PM)',
    evening: '🌆 Evening (After 5 PM)'
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedSlots).map(([period, periodSlots]) => (
        periodSlots.length > 0 && (
          <div key={period} className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800 px-1">
              {periodLabels[period]}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {periodSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => onTimeSelect(slot.time)}
                  disabled={slot.capacity <= 0}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selectedTime === slot.time
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500'
                      : slot.capacity > 0
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 text-gray-800'
                        : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }
                  `}
                  aria-label={`Select time slot ${formatTime(slot.time)}`}
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {formatTime(slot.time)}
                    </span>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded-full flex-shrink-0
                    ${slot.capacity > 5
                      ? 'bg-green-100 text-green-700'
                      : slot.capacity > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {slot.capacity} {slot.capacity === 1 ? 'spot' : 'spots'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      ))}

      {/* No slots available message */}
      {Object.keys(groupedSlots).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No time slots available for this date
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;