// src/components/AdminDashboard/Table/components/Toolbar.jsx
import React from 'react';
import { Download, Trash2 } from 'lucide-react';

const Toolbar = ({
  selectedItems,
  onBulkDelete,
  pageSize,
  onPageSizeChange,
  onExport,
  pageSizeOptions
}) => {
  return (
    <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
      {/* Left side: Selection info and page size */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Selected items counter and bulk delete */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedItems.length} selected
            </span>
            <button
              onClick={() => onBulkDelete(selectedItems)}
              className="text-red-600 hover:text-red-800 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
      </div>

      {/* Right side: Export button */}
      <button
        onClick={onExport}
        className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </button>
    </div>
  );
};

export default Toolbar;