import React from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Descubre Melilla la Vieja
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12">
            Experience the rich history and culture of our city through guided visits to our most iconic landmarks and heritage sites.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Multiple Locations",
                description: "Visit various historical sites across the city"
              },
              {
                icon: <CalendarDays className="w-6 h-6" />,
                title: "Easy Booking",
                description: "Simple online reservation system"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Flexible Hours",
                description: "Various time slots to fit your schedule"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;