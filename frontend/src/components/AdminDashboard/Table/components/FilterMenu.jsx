// src/components/AdminDashboard/Table/components/FilterMenu.jsx
import React from 'react';
import { X } from 'lucide-react';

const FilterMenu = ({
  show,
  position,
  column,
  value,
  onChange,
  onClose
}) => {
  if (!show) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg p-4 z-50"
      style={{
        top: position.top,
        left: position.left
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Filter</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(column, e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Filter value..."
        autoFocus
      />
    </div>
  );
};

export default FilterMenu;