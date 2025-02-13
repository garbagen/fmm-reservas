// admin-dashboard.js

/**
 * Admin Dashboard Management System
 * Handles the main functionality of the admin dashboard including
 * authentication, navigation, and initialization of different sections
 */

const AdminDashboard = {
    // State management
    state: {
        currentSection: 'bookings',
        isLoading: false
    },

    // Initialize the dashboard
    init() {
        this.checkAuthAndInitialize();
        this.attachEventListeners();
        this.setupModalHandlers();
    },

    // Authentication check
    checkAuthAndInitialize() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize current section from URL hash or default to bookings
        const sectionFromHash = window.location.hash.slice(1);
        this.showSection(sectionFromHash || 'bookings');
    },

    // Event listeners setup
    attachEventListeners() {
        // Navigation event listeners
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Search and filter handlers
        this.setupSearchAndFilters();

        // Bulk actions handlers
        this.setupBulkActionHandlers();

        // Logout handler
        document.querySelector('.logout-button')?.addEventListener('click', () => this.handleLogout());
    },

    // Section display management
    showSection(sectionName) {
        this.state.currentSection = sectionName;
        
        // Update URL hash
        window.location.hash = sectionName;

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-section') === sectionName) {
                tab.classList.add('active');
            }
        });

        // Load section data
        this.loadSectionData(sectionName);
    },

    // Load data based on current section
    async loadSectionData(sectionName) {
        this.toggleLoading(true);
        
        try {
            switch (sectionName) {
                case 'bookings':
                    await this.loadBookings();
                    break;
                case 'sites':
                    await this.loadSites();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${sectionName}:`, error);
            window.toast.error(`Error loading ${sectionName}`);
        } finally {
            this.toggleLoading(false);
        }
    },

    // Bookings management
    async loadBookings() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('https://fmm-reservas-api.onrender.com/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch bookings');
            
            const bookings = await response.json();
            this.displayBookings(bookings);
            this.updateBookingStats(bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
            window.toast.error('Failed to load bookings');
        }
    },

    // Sites management
    async loadSites() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('https://fmm-reservas-api.onrender.com/api/sites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch sites');
            
            const sites = await response.json();
            this.displaySites(sites);
        } catch (error) {
            console.error('Error loading sites:', error);
            window.toast.error('Failed to load sites');
        }
    },

    // Search and filter setup
    setupSearchAndFilters() {
        const searchInput = document.getElementById('booking-search');
        const dateFilter = document.getElementById('date-filter');
        const statusFilter = document.getElementById('status-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
    },

    // Apply filters to bookings
    applyFilters() {
        const searchTerm = document.getElementById('booking-search')?.value.toLowerCase() || '';
        const dateFilter = document.getElementById('date-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';

        const filteredBookings = this.filterBookings(searchTerm, dateFilter, statusFilter);
        this.displayBookings(filteredBookings);
    },

    // Filter bookings based on criteria
    filterBookings(searchTerm, dateFilter, statusFilter) {
        return this.state.allBookings.filter(booking => {
            const matchesSearch = 
                booking.visitorName.toLowerCase().includes(searchTerm) ||
                booking.siteName.toLowerCase().includes(searchTerm);

            const matchesDate = this.checkDateFilter(booking.date, dateFilter);
            const matchesStatus = this.checkStatusFilter(booking.date, statusFilter);

            return matchesSearch && matchesDate && matchesStatus;
        });
    },

    // Utility methods
    toggleLoading(isLoading) {
        this.state.isLoading = isLoading;
        // Update UI loading state
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    },

    handleLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    },

    // Modal handlers
    setupModalHandlers() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.onclick = () => modal.style.display = 'none';
            }
            
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        });
    },

    // Export functionality
    exportData(format = 'csv') {
        const selectedData = this.getSelectedData();
        if (format === 'csv') {
            this.exportToCSV(selectedData);
        } else if (format === 'excel') {
            this.exportToExcel(selectedData);
        }
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});