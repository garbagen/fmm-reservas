import React, { useEffect, useState } from 'react';
import { Clock, Users, MapPin, CalendarDays } from 'lucide-react';

const HeritageCard = ({ site, onBooking }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [theme, setTheme] = useState('blue'); // default theme
  const availableTimeSlots = site.timeSlots?.filter(slot => slot.time) || [];

  // Listen for theme changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'blue';
    setTheme(savedTheme);
    
    // Listen for theme changes
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('selectedTheme') || 'blue');
    };
    
    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  return (
    <div className="w-full h-full">
      <div 
        className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={site.imageUrl || "/api/placeholder/400/250"}
            alt={site.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Location Badge */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <MapPin className={`w-4 h-4 text-${theme}-600 mr-1`} />
              <span className="text-sm font-medium text-gray-900">Heritage Site</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-gray-800">
          <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-${theme}-600 transition-colors`}>
            {site.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {site.description || 'No description available'}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start space-x-2">
              <Clock className={`w-5 h-5 text-${theme}-600 mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Time Slots</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {availableTimeSlots.length} available
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Users className={`w-5 h-5 text-${theme}-600 mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Capacity</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Up to {Math.max(...availableTimeSlots.map(slot => slot.capacity || 0))} visitors
                </p>
              </div>
            </div>
          </div>

          {/* Booking Button */}
          <button 
            onClick={() => onBooking(site)}
            className={`w-full flex items-center justify-center gap-2 bg-${theme}-600 hover:bg-${theme}-700 
                     text-white py-3 px-4 rounded-lg transition-colors`}
          >
            <CalendarDays className="w-5 h-5" />
            Book Your Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeritageCard;