// src/components/AdminDashboard/Table/components/MobileItem.jsx
import React from 'react';
import SwipeableRow from './SwipeableRow';

const MobileItem = ({ 
  item, 
  columns, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect 
}) => {
  return (
    <SwipeableRow 
      item={item} 
      onEdit={onEdit} 
      onDelete={onDelete}
    >
      <div className="border-b p-4">
        {/* Selection Checkbox */}
        <div className="flex items-center justify-between mb-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 w-5 h-5"
          />
        </div>

        {/* Data Fields */}
        {columns.map(column => (
          <div key={column.key} className="mb-3">
            {/* Field Label */}
            <span className="text-sm font-medium text-gray-500 mb-1 block">
              {column.header}
            </span>
            {/* Field Value */}
            <div className="text-gray-900">
              {column.render ? column.render(item[column.key]) : item[column.key]}
            </div>
          </div>
        ))}
      </div>
    </SwipeableRow>
  );
};

export default MobileItem;