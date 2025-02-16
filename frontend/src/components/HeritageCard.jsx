// src/components/HeritageCard.jsx
import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';

const HeritageCard = ({ site, onBooking }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const availableTimeSlots = site.timeSlots?.filter(slot => slot.time) || [];

  return (
    <div 
      className="card"
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
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="card-title">{site.name}</h3>
        <p className="card-content mb-4 line-clamp-2">{site.description}</p>

        <div className="space-y-2 mb-4">
          <div className="info-text flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Available Times: {availableTimeSlots.length} slots
          </div>
          <div className="info-text flex items-center">
            <Users className="w-4 h-4 mr-2" />
            {Math.max(...availableTimeSlots.map(slot => slot.capacity || 0))} max capacity per slot
          </div>
        </div>

        <button 
          onClick={() => onBooking(site)}
          className="btn-primary w-full flex items-center justify-center gap-2 group"
        >
          Book Now
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default HeritageCard;