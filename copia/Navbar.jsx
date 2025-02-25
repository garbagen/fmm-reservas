import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
          Fundación Melilla Monumental
        </Link>
        <Link 
          to="/admin/login" 
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <User className="w-4 h-4 mr-2" />
          Admin Login
        </Link>
      </div>
    </header>
  );
};

export default Navbar;