// src/components/HeritageCard.jsx
import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';

const HeritageCard = ({ site }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="group relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={site.imageUrl || "/api/placeholder/400/250"}
          alt={site.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          {site.rating || 4.8}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{site.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{site.description}</p>

        {/* Quick Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            Next available: {site.nextAvailable || "10:00 AM"}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {site.availableSlots || 5} slots available today
          </div>
        </div>

        {/* Book Now Button */}
        <button 
          onClick={() => site.onBook?.(site)}
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