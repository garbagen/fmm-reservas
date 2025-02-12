let allBookings = []; // Store all bookings for filtering
let selectedBookings = new Set();

// Check authentication first
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return token;
}
function getCurrentTab() {
    const bookingsSection = document.getElementById('bookings-section');
    return bookingsSection.classList.contains('active') ? 'bookings' : 'sites';
}

function previewImage(input) {
    const preview = input.parentElement.querySelector('#preview-image');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
}

function toggleLoading(isLoading, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let loadingDiv = container.querySelector('.loading-spinner');
    
    if (isLoading) {
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-spinner';
            loadingDiv.innerHTML = `
                <div class="flex items-center justify-center p-4">
                    <div class="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
                    <span class="ml-3 text-gray-600">Loading...</span>
                </div>
            `;
            container.prepend(loadingDiv);
        }
    } else {
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

// Load sites when the page loads
window.addEventListener('load', () => {
    const token = checkAuth();
    if (token) {
        // Instead of loading bookings by default, stay on current tab
        const currentTab = window.location.hash.slice(1) || 'bookings';
        showSection(currentTab);
    }
});

// Navigation function
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the current tab
    const currentTab = document.querySelector(`.nav-tab[onclick*="${sectionName}"]`);
    if (currentTab) {
        currentTab.classList.add('active');
    }

    // Load data for the section
    if (sectionName === 'bookings') {
        loadBookings();
    } else if (sectionName === 'sites') {
        loadSites();
    }
}
// Sites Management Functions
async function loadSites() {
    const token = checkAuth();
    if (!token) return;

    // Show loading state
    toggleLoading(true, 'sites-list');

    try {
        const response = await fetch('https://fmm-reservas-api.onrender.com/api/sites', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const sites = await response.json();
        displaySites(sites);
    } catch (error) {
        console.error('Error loading sites:', error);
    } finally {
        // Hide loading state
        toggleLoading(false, 'sites-list');
    }
}

async function exportBookings(format) {
    const token = checkAuth();
    if (!token) return;

    const filteredBookings = allBookings.map(booking => ({
        'Date': formatDate(booking.date),
        'Visitor Name': booking.visitorName,
        'Site': booking.siteName,
        'Time': booking.time,
        'Status': new Date(booking.date) < new Date() ? 'Past' : 'Upcoming',
        'Booking Time': new Date(booking.createdAt).toLocaleString()
    }));

    if (format === 'csv') {
        const csv = convertToCSV(filteredBookings);
        downloadFile(csv, 'bookings.csv', 'text/csv');
    } else if (format === 'excel') {
        // Using xlsx library for Excel export
        const worksheet = XLSX.utils.json_to_sheet(filteredBookings);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
        XLSX.writeFile(workbook, 'bookings.xlsx');
    }
}

function displaySites(sites) {
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = ''; // Clear existing sites

    sites.forEach(site => {
        const siteEditor = createSiteEditor(site);
        sitesList.appendChild(siteEditor);
    });
}

function createSiteEditor(site = null) {
    const template = document.getElementById('site-editor-template');
    const editor = template.content.cloneNode(true).children[0];

    if (site) {
        editor.dataset.siteId = site._id;
        editor.querySelector('.site-name').value = site.name;
        editor.querySelector('.site-description').value = site.description;

        // Load time slots if they exist
        if (site.timeSlots && Array.isArray(site.timeSlots)) {
            site.timeSlots.forEach(slot => {
                addTimeSlot(editor.querySelector('.add-button'), slot);
            });
        }
    }

    return editor;
}

function addNewSite() {
    const token = checkAuth();
    if (!token) return;

    const sitesList = document.getElementById('sites-list');
    const newSiteEditor = createSiteEditor();
    sitesList.appendChild(newSiteEditor);
}

function addTimeSlot(button, existingSlot = null) {
    const template = document.getElementById('time-slot-template');
    const slot = template.content.cloneNode(true).children[0];
    const slotsList = button.closest('.time-slots').querySelector('.slots-list');

    if (existingSlot) {
        slot.querySelector('.slot-time').value = existingSlot.time;
        slot.querySelector('.slot-capacity').value = existingSlot.capacity;
    }

    slotsList.appendChild(slot);
}

function removeTimeSlot(button) {
    button.closest('.slot-item').remove();
}

async function saveSite(button) {
    const token = checkAuth();
    if (!token) return;

    const editor = button.closest('.site-editor');
    toggleLoading(true, editor.id || 'sites-list');

    try {
        // Handle image upload first
        const imageInput = editor.querySelector('.site-image');
        let imageUrl = editor.dataset.imageUrl;

        if (imageInput && imageInput.files && imageInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', imageInput.files[0]);

            try {
                const uploadResponse = await fetch('https://fmm-reservas-api.onrender.com/api/sites/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    imageUrl = uploadResult.imageUrl;
                }
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                // Continue with save even if image upload fails
            }
        }

        // Prepare site data
        const siteData = {
            name: editor.querySelector('.site-name').value,
            description: editor.querySelector('.site-description').value,
            imageUrl: imageUrl,
            timeSlots: []
        };

        // Get all time slots
        const slots = editor.querySelectorAll('.slot-item');
        slots.forEach(slot => {
            const timeInput = slot.querySelector('.slot-time');
            const capacityInput = slot.querySelector('.slot-capacity');
            
            if (timeInput && capacityInput && timeInput.value && capacityInput.value) {
                siteData.timeSlots.push({
                    time: timeInput.value,
                    capacity: parseInt(capacityInput.value) || 0
                });
            }
        });

        // Save the site
        const siteId = editor.dataset.siteId;
        const method = siteId ? 'PUT' : 'POST';
        const url = `https://fmm-reservas-api.onrender.com/api/sites${siteId ? '/' + siteId : ''}`;

        const saveResponse = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(siteData)
        });

        if (saveResponse.ok) {
            // Manually show success alert since toast might not be available
            alert('Site saved successfully!');
            
            // Reload the sites section without full page refresh
            const sitesSection = document.getElementById('sites-section');
            if (sitesSection) {
                await loadSites();
            }

            // If it was a new site, remove the editor
            if (!siteId) {
                editor.remove();
            }
        } else {
            // Show error message
            alert('Error saving site. Please try again.');
        }

    } catch (error) {
        console.error('Error saving site:', error);
        // Use alert instead of toast
        alert('Error saving site. Please try again.');
    } finally {
        toggleLoading(false, editor.id || 'sites-list');
    }
}

// Also modify the event listener for the sites tab
document.addEventListener('DOMContentLoaded', function() {
    const sitesTab = document.querySelector('button[onclick="showSection(\'sites\')"]');
    if (sitesTab) {
        sitesTab.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default onclick behavior
            
            // Manually update UI and load sites
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('sites-section').classList.add('active');
            
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            this.classList.add('active');
            
            loadSites();
        });
    }
});

async function deleteSite(button) {
    const token = checkAuth();
    if (!token) return;

    const editor = button.closest('.site-editor');
    const siteId = editor.dataset.siteId;

    if (!siteId) {
        editor.remove();
        return;
    }

    if (!confirm('Are you sure you want to delete this site?')) {
        return;
    }

    // Show loading state
    toggleLoading(true, editor.id || 'sites-list');

    try {
        const response = await fetch(`https://fmm-reservas-api.onrender.com/api/sites/${siteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            window.toast.success('Site deleted successfully!');
            await loadSites(); // Refresh the list
        } else {
            window.toast.error('Error deleting site');
        }
    } catch (error) {
        console.error('Error deleting site:', error);
        window.toast.error('Error deleting site');
    } finally {
        // Hide loading state
        toggleLoading(false, editor.id || 'sites-list');
    }
}

// Bookings Management Functions
async function loadBookings() {
    const token = checkAuth();
    if (!token) return;

    toggleLoading(true, 'bookings-list');
    
    try {
        // First, fetch all sites to get the names
        const sitesResponse = await fetch('https://fmm-reservas-api.onrender.com/api/sites', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const sites = await sitesResponse.json();
        
        // Create a map of site IDs to names for easy lookup
        const siteNames = {};
        sites.forEach(site => {
            siteNames[site.name] = site.name;
        });
        
        // Now fetch bookings
        const response = await fetch('https://fmm-reservas-api.onrender.com/api/bookings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const bookings = await response.json();
        allBookings = bookings; // Store all bookings
        updateStats(bookings);
        applyFiltersAndDisplay();
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Error loading bookings. Please try again.');
    } finally {
        toggleLoading(false, 'bookings-list');
    }
}
function updateStats(bookings) {
    document.getElementById('total-bookings').textContent = bookings.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(booking => booking.date === today).length;
    document.getElementById('today-bookings').textContent = todayBookings;
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookings-list');
    bookingsList.innerHTML = '';
    
    if (!bookings || bookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" style="text-align: center; padding: 20px;">
                No bookings found
            </td>
        `;
        bookingsList.appendChild(row);
        return;
    }
    
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    bookings.forEach(booking => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const status = bookingDate < today ? 'past' : 'active';
        
        const row = document.createElement('tr');
        row.className = 'booking-row';
        if (selectedBookings.has(booking._id)) {
            row.classList.add('selected');
        }
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="booking-checkbox" 
                       data-booking-id="${booking._id}" 
                       ${selectedBookings.has(booking._id) ? 'checked' : ''}>
            </td>
            <td>${formatDate(booking.date)}</td>
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
                <button onclick="showBookingDetails('${booking._id}')" class="view-button">
                    View
                </button>
                <button onclick="deleteBooking('${booking._id}')" class="delete-button">
                    Delete
                </button>
            </td>
        `;
        
        bookingsList.appendChild(row);
    });
    
    updateBulkActionButtons();
}
// Add filter functionality
function applyFiltersAndDisplay() {
    const searchTerm = document.getElementById('booking-search').value.toLowerCase();
    const dateFilter = document.getElementById('date-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredBookings = allBookings.filter(booking => {
        // Search filter
        const matchesSearch = 
            booking.visitorName.toLowerCase().includes(searchTerm) ||
            booking.siteName.toLowerCase().includes(searchTerm);
        
        // Date filter
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let matchesDate = true;
        if (dateFilter === 'today') {
            matchesDate = booking.date === today.toISOString().split('T')[0];
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = bookingDate >= weekAgo;
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchesDate = bookingDate >= monthAgo;
        }
        
        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'upcoming') {
            matchesStatus = bookingDate >= today;
        } else if (statusFilter === 'past') {
            matchesStatus = bookingDate < today;
        }
        
        return matchesSearch && matchesDate && matchesStatus;
    });
    
    displayBookings(filteredBookings);
}
async function deleteBooking(bookingId) {
    const token = checkAuth();
    if (!token) return;

    if (!bookingId) {
        console.error('No booking ID provided');
        return;
    }

    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`https://fmm-reservas-api.onrender.com/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            await loadBookings(); // Refresh the list
            alert('Booking deleted successfully');
        } else {
            const error = await response.json();
            alert(error.message || 'Error deleting booking');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
    }
}
function updateBulkActionButtons() {
    const deleteButton = document.querySelector('.bulk-action-button');
    const exportButton = document.querySelectorAll('.bulk-action-button')[1];
    
    if (deleteButton) deleteButton.disabled = selectedBookings.size === 0;
    if (exportButton) exportButton.disabled = selectedBookings.size === 0;
}

async function deleteSelectedBookings() {
    if (!confirm(`Are you sure you want to delete ${selectedBookings.size} bookings?`)) {
        return;
    }
    
    const token = checkAuth();
    if (!token) return;
    
    try {
        for (const bookingId of selectedBookings) {
            await fetch(`https://fmm-reservas-api.onrender.com/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        
        selectedBookings.clear();
        await loadBookings();
        alert('Selected bookings deleted successfully');
    } catch (error) {
        console.error('Error deleting bookings:', error);
        alert('Error deleting some bookings');
    }
}

function exportSelectedBookings(format) {
    const selectedBookingData = allBookings
        .filter(booking => selectedBookings.has(booking._id))
        .map(booking => ({
            'Date': formatDate(booking.date),
            'Visitor Name': booking.visitorName,
            'Site': booking.siteName,
            'Time': booking.time,
            'Status': new Date(booking.date) < new Date() ? 'Past' : 'Upcoming',
            'Booking Time': new Date(booking.createdAt).toLocaleString()
        }));
    
    if (format === 'csv') {
        const csv = convertToCSV(selectedBookingData);
        downloadFile(csv, 'selected_bookings.csv', 'text/csv');
    }
}

function showBookingDetails(bookingId) {
    const booking = allBookings.find(b => b._id === bookingId);
    if (!booking) return;
    
    const modal = document.getElementById('booking-details-modal');
    const content = document.getElementById('booking-details-content');
    
    content.innerHTML = `
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
                <div>${formatDate(booking.date)}</div>
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
    
    modal.style.display = 'block';
}

// Utility Functions
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr);
    return array.map(row => {
        return Object.values(row)
            .map(value => `"${value}"`)
            .join(',');
    }).join('\n');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Existing filter listeners
    const searchInput = document.getElementById('booking-search');
    const dateFilter = document.getElementById('date-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndDisplay);
    if (dateFilter) dateFilter.addEventListener('change', applyFiltersAndDisplay);
    if (statusFilter) statusFilter.addEventListener('change', applyFiltersAndDisplay);

    // New modal handlers
    const modal = document.getElementById('booking-details-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }
    
    if (modal) {
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    }
    
    // New bulk selection handlers
    const selectAllHeader = document.getElementById('select-all-header');
    if (selectAllHeader) {
        selectAllHeader.addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('.booking-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                const bookingId = checkbox.dataset.bookingId;
                if (e.target.checked) {
                    selectedBookings.add(bookingId);
                } else {
                    selectedBookings.delete(bookingId);
                }
            });
            
            updateBulkActionButtons();
        });
    }
    
    // Add delegation for booking checkboxes
    const bookingsList = document.getElementById('bookings-list');
    if (bookingsList) {
        bookingsList.addEventListener('change', function(e) {
            if (e.target.classList.contains('booking-checkbox')) {
                const bookingId = e.target.dataset.bookingId;
                if (e.target.checked) {
                    selectedBookings.add(bookingId);
                } else {
                    selectedBookings.delete(bookingId);
                }
                updateBulkActionButtons();
            }
        });
    }

    // Sites tab handler (if it exists in your code)
    const sitesTab = document.querySelector('button[onclick="showSection(\'sites\')"]');
    if (sitesTab) {
        sitesTab.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('sites-section').classList.add('active');
            
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            this.classList.add('active');
            
            loadSites();
        });
    }
});

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}