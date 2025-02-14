import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SiteList from './SiteList';
import BookingList from './BookingList';
import { LogOut, LayoutGrid, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('sites');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sites')}
              className={`${
                activeTab === 'sites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Heritage Sites
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sites' ? <SiteList /> : <BookingList />}
      </main>
    </div>
  );
};

export default AdminDashboard;