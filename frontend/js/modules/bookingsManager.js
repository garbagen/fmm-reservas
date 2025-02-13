// js/modules/bookingsManager.js

const BookingsManager = {
    selectedBookings: new Set(),
    allBookings: [],

    async loadBookings() {
        const token = localStorage.getItem('adminToken');
        if (!token) return false;

        try {
            const response = await fetch('https://fmm-reservas-api.onrender.com/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const bookings = await response.json();
            this.allBookings = bookings;
            this.displayBookings(bookings);
            this.updateStats(bookings);
            return true;
        } catch (error) {
            console.error('Error loading bookings:', error);
            window.toast.error('Error loading bookings');
            return false;
        }
    },

    updateStats(bookings) {
        document.getElementById('total-bookings').textContent = bookings.length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(booking => booking.date === today).length;
        document.getElementById('today-bookings').textContent = todayBookings;
    },

    displayBookings(bookings) {
        const bookingsList = document.getElementById('bookings-list');
        if (!bookingsList) return;

        bookingsList.innerHTML = this.generateBookingsHTML(bookings);
        this.attachBookingEventListeners();
    },

    generateBookingsHTML(bookings) {
        if (!bookings || bookings.length === 0) {
            return `<tr><td colspan="8" class="text-center p-4">No bookings found</td></tr>`;
        }

        return bookings
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(booking => this.generateBookingRowHTML(booking))
            .join('');
    },

    generateBookingRowHTML(booking) {
        const bookingDate = new Date(booking.date);
        const status = bookingDate < new Date() ? 'past' : 'active';
        
        return `
            <tr class="booking-row ${this.selectedBookings.has(booking._id) ? 'selected' : ''}">
                <td>
                    <input type="checkbox" 
                           class="booking-checkbox" 
                           data-booking-id="${booking._id}" 
                           ${this.selectedBookings.has(booking._id) ? 'checked' : ''}>
                </td>
                <td>${window.datetime.formatDate(new Date(booking.date))}</td>
                <td>${booking.visitorName || 'N/A'}</td>
                <td>${booking.siteName || 'N/A'}</td>
                <td>${booking.time || 'Not specified'}</td>
                <td>
                    <span class="status-badge status-${status}">
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </td>
                <td>${new Date(booking.createdAt).toLocaleString()}</td>
                <td>
                    <button onclick="BookingsManager.showBookingDetails('${booking._id}')" class="view-button">
                        View
                    </button>
                    <button onclick="BookingsManager.deleteBooking('${booking._id}')" class="delete-button">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    },

    attachBookingEventListeners() {
        document.querySelectorAll('.booking-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const bookingId = e.target.dataset.bookingId;
                if (e.target.checked) {
                    this.selectedBookings.add(bookingId);
                } else {
                    this.selectedBookings.delete(bookingId);
                }
                this.updateBulkActionButtons();
            });
        });
    },

    updateBulkActionButtons() {
        const deleteButton = document.querySelector('.bulk-action-button');
        const exportButton = document.querySelectorAll('.bulk-action-button')[1];
        
        if (deleteButton) deleteButton.disabled = this.selectedBookings.size === 0;
        if (exportButton) exportButton.disabled = this.selectedBookings.size === 0;
    },

    async deleteBooking(bookingId) {
        if (!confirm('Are you sure you want to delete this booking?')) return;

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const response = await fetch(
                `https://fmm-reservas-api.onrender.com/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                await this.loadBookings();
                window.toast.success('Booking deleted successfully');
            } else {
                const error = await response.json();
                window.toast.error(error.message || 'Error deleting booking');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            window.toast.error('Error deleting booking');
        }
    },

    showBookingDetails(bookingId) {
        const booking = this.allBookings.find(b => b._id === bookingId);
        if (!booking) return;

        const modal = document.getElementById('booking-details-modal');
        const content = document.getElementById('booking-details-content');
        
        content.innerHTML = this.generateBookingDetailsHTML(booking);
        modal.style.display = 'block';
    },

    generateBookingDetailsHTML(booking) {
        return `
            <div class="booking-details-grid">
                <div class="detail-item">
                    <div class="detail-label">Visitor Name</div>
                    <div>${booking.visitorName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Site</div>
                    <div>${booking.siteName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div>${window.datetime.formatDate(new Date(booking.date))}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Time</div>
                    <div>${booking.time || 'Not specified'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Booking Time</div>
                    <div>${new Date(booking.createdAt).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div>${new Date(booking.date) < new Date() ? 'Past' : 'Active'}</div>
                </div>
            </div>
        `;
    }
};

// Export for global use
window.BookingsManager = BookingsManager;