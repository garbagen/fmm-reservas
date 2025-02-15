// src/components/AdminDashboard/Table/components/TableRow.jsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const TableRow = ({
  item,
  columns,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300"
        />
      </td>
      {columns.map(column => (
        <td key={column.key} className="px-4 py-3">
          {column.render ? column.render(item[column.key]) : item[column.key]}
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-2 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TableRow;