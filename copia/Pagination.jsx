// src/components/AdminDashboard/Table/components/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize
}) => {
  return (
    <div className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Showing entries info */}
      <div className="text-sm text-gray-700">
        Showing {Math.min(totalItems, 1 + (currentPage - 1) * pageSize)} to{' '}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="px-4 py-2 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;