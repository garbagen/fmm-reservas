let selectedSite = '';
let isRefreshing = false;
let allSites = [];

window.addEventListener('load', async () => {
    try {
        // Fetch sites
        const response = await fetch('https://fmm-reservas-api.onrender.com/api/sites');
        allSites = await response.json();
        
        // Add event listeners for search and filter
        document.getElementById('site-search').addEventListener('input', filterSites);
        document.getElementById('time-filter').addEventListener('change', filterSites);
        
        // Initial display
        displaySites(allSites);
    } catch (error) {
        console.error('Error loading sites:', error);
        window.toast.error('Error loading heritage sites. Please try again later.');
    }
});

function filterSites() {
    const searchTerm = document.getElementById('site-search').value.toLowerCase();
    const timeFilter = document.getElementById('time-filter').value;
    
    let filteredSites = allSites.filter(site => {
        const matchesSearch = site.name.toLowerCase().includes(searchTerm) || 
                            site.description.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
        
        if (timeFilter === 'all') return true;
        
        return site.timeSlots.some(slot => {
            if (!slot.time) return false;
            const hour = parseInt(slot.time.split(':')[0]);
            switch(timeFilter) {
                case 'morning': return hour >= 6 && hour < 12;
                case 'afternoon': return hour >= 12 && hour < 17;
                case 'evening': return hour >= 17;
                default: return true;
            }
        });
    });
    
    displaySites(filteredSites);
}

function displaySites(sites) {
    const container = document.querySelector('.sites-container');
    
    if (sites.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                No heritage sites found matching your criteria
            </div>
        `;
        return;
    }
    
    container.innerHTML = sites.map(site => {
        console.log('Displaying site:', site); // Debug log
        return `
            <div class="site-card">
                <div class="site-image">
                    <img src="${site.imageUrl ? + site.imageUrl : '/images/placeholder-image.jpg'}" 
                         alt="${site.name}"
                         onerror="this.src='/images/placeholder-image.jpg'">
                </div>
                <h2>${site.name}</h2>
                <p>${site.description}</p>
                <div class="time-slots">
                    ${site.timeSlots
                        .filter(slot => slot.time) // Filter out empty time slots
                        .map(slot => `
                            <span class="time-slot">
                                ${window.datetime.formatTime(slot.time)} 
                                (${slot.capacity} spots)
                            </span>
                        `).join('')}
                </div>
                <button onclick="bookSite('${site._id}')" class="book-button">Book Visit</button>
            </div>
        `;
    }).join('');
}

function bookSite(siteId) {
    selectedSite = siteId;
    const formOverlay = document.querySelector('.form-overlay');
    const bookingForm = document.getElementById('booking-form');
    
    formOverlay.classList.add('active');
    bookingForm.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (typeof window.calendar === 'undefined') {
        console.error('Calendar not found! Check if calendar.js is loaded properly.');
        return;
    }

    try {
        window.calendar.init(siteId);
    } catch (error) {
        console.error('Error initializing calendar:', error);
    }
}

function closeBookingForm() {
    document.getElementById('booking-form').classList.add('hidden');
    document.querySelector('.form-overlay').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('visitor-booking-form').reset();
    
    // Clear calendar
    document.getElementById('booking-calendar').innerHTML = '';
}

// In script.js - Update the loadTimeSlots function
async function loadTimeSlots(isDropdownClick = false) {
    const dateInput = document.getElementById('date');
    const timeSlotSelect = document.getElementById('time-slot');
    
    timeSlotSelect.innerHTML = '<option value="">Loading time slots...</option>';
    timeSlotSelect.disabled = true;

    try {
        // Get site details
        const siteResponse = await fetch(`http://localhost:3000/api/sites/${selectedSite}`);
        if (!siteResponse.ok) throw new Error('Failed to fetch site details');
        const site = await siteResponse.json();

        // Get current availability for this date
        const date = dateInput.value;
        const availabilityResponse = await fetch(`http://localhost:3000/api/sites/${selectedSite}/availability/${date.substring(0, 7)}`);
        if (!availabilityResponse.ok) throw new Error('Failed to fetch availability');
        const availability = await availabilityResponse.json();

        // Get the specific date's availability
        const dateAvailability = availability[date] || {};

        timeSlotSelect.innerHTML = '<option value="">Select a time</option>';
        
        const sortedSlots = [...site.timeSlots]
            .filter(slot => slot.time) // Filter out empty time slots
            .sort((a, b) => a.time.localeCompare(b.time));

        let hasAvailableSlots = false;

        sortedSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.time;
            const formattedTime = window.datetime.formatTime(slot.time);

            // Check if this time slot is fully booked
            const isFullyBooked = dateAvailability.fullyBooked || 
                                (dateAvailability.timeSlots && 
                                 dateAvailability.timeSlots[slot.time] && 
                                 dateAvailability.timeSlots[slot.time].remaining <= 0);

            if (isFullyBooked) {
                option.disabled = true;
                option.textContent = `${formattedTime} - Fully Booked`;
                option.classList.add('capacity-low');
            } else {
                hasAvailableSlots = true;
                const remaining = slot.capacity - (dateAvailability.timeSlots?.[slot.time]?.booked || 0);
                option.textContent = `${formattedTime} - ${remaining} ${remaining === 1 ? 'spot' : 'spots'} left`;
                if (remaining <= 2) {
                    option.classList.add('capacity-low');
                } else if (remaining <= 5) {
                    option.classList.add('capacity-medium');
                } else {
                    option.classList.add('capacity-high');
                }
            }
            timeSlotSelect.appendChild(option);
        });

        if (!hasAvailableSlots) {
            timeSlotSelect.innerHTML = '<option value="">No available slots for this date</option>';
            timeSlotSelect.disabled = true;
        } else {
            timeSlotSelect.disabled = false;
        }

    } catch (error) {
        console.error('Error loading time slots:', error);
        timeSlotSelect.innerHTML = '<option value="">Error loading time slots</option>';
        timeSlotSelect.disabled = true;
        window.toast.error('Error loading available times. Please try again.');
    }
}

async function getSiteById(siteId) {
    try {
        const response = await fetch(`http://localhost:3000/api/sites/${siteId}`);
        if (!response.ok) {
            throw new Error('Error fetching site details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting site details:', error);
        throw error;
    }
}

async function submitBooking(event) {
    console.log('Submit function started');  // Debug log
    event.preventDefault();
    
    const form = document.getElementById('visitor-booking-form');
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('button-text');
    
    console.log('Form data:', {  // Debug log
        name: form.name.value,
        date: form.date.value,
        timeSlot: form.timeSlot.value,
        selectedSite: selectedSite
    });

    // Validate all fields
    const nameValid = window.formValidation.validateVisitorName(form.name.value);
    const dateValid = window.formValidation.validateBookingDate(form.date);
    const timeValid = window.formValidation.validateRequired(form.timeSlot);
    
    console.log('Validation results:', { nameValid, dateValid, timeValid });  // Debug log
    
    if (!nameValid || !dateValid || !timeValid) {
        window.toast.error('Please correct the errors in the form');
        return;
    }
    
    try {
        console.log('Starting submission process');  // Debug log
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        spinner.classList.remove('hidden');
        buttonText.textContent = 'Processing...';
        form.classList.add('form-disabled');

        // Get the site details
        console.log('Fetching site details for:', selectedSite);  // Debug log
        const site = await getSiteById(selectedSite);
        
        // Prepare booking data
        const bookingData = {
            siteName: site.name,
            visitorName: form.name.value,
            date: form.date.value,
            time: form.timeSlot.value
        };
        
        console.log('Sending booking data:', bookingData);  // Debug log

        // Submit booking
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        console.log('Server response:', response);  // Debug log

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error making booking');
        }
        
        const booking = await response.json();
        console.log('Booking confirmed:', booking);  // Debug log

        window.toast.success(`Thank you ${bookingData.visitorName}! Your booking has been confirmed for ${site.name} on ${bookingData.date} at ${bookingData.time}`);
        closeBookingForm();
        
    } catch (error) {
        console.error('Error submitting booking:', error);
        window.toast.error(error.message || 'Error submitting booking. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        spinner.classList.add('hidden');
        buttonText.textContent = 'Confirm Booking';
        form.classList.remove('form-disabled');
    }
}