// src/components/AdminDashboard/Table/components/TableHeader.jsx
import React from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';

const TableHeader = ({
  columns,
  onSort,
  onFilter,
  filters,
  onSelectAll,
  selectedAll
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3">
          <input
            type="checkbox"
            checked={selectedAll}
            onChange={onSelectAll}
            className="rounded border-gray-300"
          />
        </th>
        {columns.map(column => (
          <th
            key={column.key}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <button
                className="flex items-center"
                onClick={() => onSort(column.key)}
              >
                {column.header}
                <ArrowUpDown className="w-4 h-4 ml-1" />
              </button>
              <button
                onClick={(e) => onFilter(column.key, e)}
                className={`${filters[column.key] ? 'text-blue-600' : ''}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </th>
        ))}
        <th className="px-4 py-3 text-right">Actions</th>
      </tr>
    </thead>
  );
};

export default TableHeader;