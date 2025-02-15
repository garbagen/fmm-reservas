// src/components/AdminDashboard/Table/index.jsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import MobileItem from './components/MobileItem';
import PullToRefresh from './components/PullToRefresh';
import Toolbar from './components/Toolbar';
import TableHeader from './components/TableHeader';
import TableRow from './components/TableRow';
import Pagination from './components/Pagination';
import FilterMenu from './components/FilterMenu';
import { sortData, filterData, paginateData } from './utils';

const EnhancedAdminTable = ({
  data,
  columns,
  onDelete,
  onEdit,
  onBulkDelete,
  onRefresh,
  filename = 'export'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterMenuPosition, setFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const pageSizeOptions = [20, 50, 100];

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentPageData.map(item => item._id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleExport = () => {
    const csvData = processedData.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.header] = item[col.key];
      });
      return row;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterClick = (column, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setFilterMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setActiveFilterColumn(column);
    setShowFilterMenu(true);
  };

  // Process data
  const processedData = filterData(sortData(data || [], sortConfig), filters);
  const totalPages = Math.ceil(processedData.length / pageSize);
  const currentPageData = paginateData(processedData, currentPage, pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [data?.length, filters]);

  if (!data) return null;

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <Toolbar
        selectedItems={selectedItems}
        onBulkDelete={onBulkDelete}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onExport={handleExport}
        pageSizeOptions={pageSizeOptions}
      />

      {/* Mobile View */}
      <div className="block sm:hidden">
        <PullToRefresh onRefresh={onRefresh}>
          {currentPageData.map((item) => (
            <MobileItem
              key={item._id}
              item={item}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
              isSelected={selectedItems.includes(item._id)}
              onSelect={() => handleSelectItem(item._id)}
            />
          ))}
        </PullToRefresh>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <TableHeader
            columns={columns}
            onSort={handleSort}
            onFilter={handleFilterClick}
            filters={filters}
            onSelectAll={handleSelectAll}
            selectedAll={selectedItems.length === currentPageData.length}
          />
          <tbody className="divide-y divide-gray-200">
            {currentPageData.map((item) => (
              <TableRow
                key={item._id}
                item={item}
                columns={columns}
                isSelected={selectedItems.includes(item._id)}
                onSelect={() => handleSelectItem(item._id)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={processedData.length}
        pageSize={pageSize}
      />

      <FilterMenu
        show={showFilterMenu}
        position={filterMenuPosition}
        column={activeFilterColumn}
        value={filters[activeFilterColumn]}
        onChange={handleFilterChange}
        onClose={() => setShowFilterMenu(false)}
      />
    </div>
  );
};

export default EnhancedAdminTable;