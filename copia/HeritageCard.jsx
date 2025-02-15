import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';

const HeritageCard = ({ site, onBooking }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const availableTimeSlots = site.timeSlots?.filter(slot => slot.time) || [];

  return (
    <div 
      className="group relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={site.imageUrl || "/api/placeholder/400/250"}
          alt={site.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{site.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{site.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            Available Times: {availableTimeSlots.length} slots
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {Math.max(...availableTimeSlots.map(slot => slot.capacity || 0))} max capacity per slot
          </div>
        </div>

        <button 
          onClick={() => onBooking(site)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group"
        >
          Book Now
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default HeritageCard;