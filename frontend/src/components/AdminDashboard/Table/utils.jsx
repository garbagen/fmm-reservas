// src/components/AdminDashboard/Table/utils.js

/**
 * Sort array of items based on sort configuration
 * @param {Array} items - Array of items to sort
 * @param {Object} sortConfig - Sort configuration { key, direction }
 * @returns {Array} Sorted array
 */
export const sortData = (items, sortConfig) => {
    if (!sortConfig.key) return items;
  
    return [...items].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  /**
   * Filter array of items based on filter criteria
   * @param {Array} items - Array of items to filter
   * @param {Object} filters - Filter criteria { key: value }
   * @returns {Array} Filtered array
   */
  export const filterData = (items, filters) => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key]?.toString().toLowerCase();
        return itemValue?.includes(value.toLowerCase());
      });
    });
  };
  
  /**
   * Paginate array of items
   * @param {Array} items - Array of items to paginate
   * @param {number} currentPage - Current page number
   * @param {number} pageSize - Items per page
   * @returns {Array} Paginated array
   */
  export const paginateData = (items, currentPage, pageSize) => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };
  
  /**
   * Format date to locale string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Format time to locale string
   * @param {string} time - Time to format
   * @returns {string} Formatted time
   */
  export const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Deep compare two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} True if objects are equal
   */
  export const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };