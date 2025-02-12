// frontend/utils/calendar.js
console.log('Loading calendar module...');

const calendar = {
    currentDate: new Date(),
    selectedDate: null,
    selectedSiteId: null,
    availability: {},
    baseUrl: 'http://localhost:3000', // Update this to match your backend URL

    async init(siteId) {
        console.log('Initializing calendar with siteId:', siteId);
        this.selectedSiteId = siteId;
        this.render();
        try {
            await this.fetchAvailability();
            this.updateCalendar();
        } catch (error) {
            console.error('Error during calendar initialization:', error);
            // Show user-friendly error message
            if (window.toast) {
                window.toast.error('Unable to load calendar availability. Please try again later.');
            }
        }
        this.attachEventListeners();
    },

    async fetchAvailability() {
        try {
            const month = `${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}`;
            const response = await fetch(`${this.baseUrl}/api/sites/${this.selectedSiteId}/availability/${month}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.availability = await response.json();
        } catch (error) {
            console.error('Error fetching availability:', error);
            this.availability = {};
            throw error; // Re-throw to be handled by caller
        }
    },

    render() {
        console.log('Rendering calendar...');
        const calendarDiv = document.getElementById('booking-calendar');
        if (!calendarDiv) {
            console.error('Calendar div not found!');
            return;
        }
        
        calendarDiv.classList.remove('hidden');
        
        const calendarHTML = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button id="prevMonth" class="calendar-nav-btn">&lt;</button>
                    <h2 id="monthDisplay"></h2>
                    <button id="nextMonth" class="calendar-nav-btn">&gt;</button>
                </div>
                <div class="calendar-grid">
                    <div class="weekdays">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div id="daysGrid" class="days"></div>
                </div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-dot available"></span>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot fully-booked"></span>
                        <span>Fully Booked</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot past"></span>
                        <span>Past Date</span>
                    </div>
                </div>
            </div>
        `;
        
        calendarDiv.innerHTML = calendarHTML;
        this.updateCalendar();
    },

    updateCalendar() {
        console.log('Updating calendar display...');
        const monthDisplay = document.getElementById('monthDisplay');
        const daysGrid = document.getElementById('daysGrid');
        
        if (!monthDisplay || !daysGrid) {
            console.error('Calendar elements not found!');
            return;
        }

        monthDisplay.textContent = this.currentDate.toLocaleDateString('default', { 
            month: 'long', 
            year: 'numeric' 
        });

        daysGrid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const totalDays = lastDay.getDate();
        const firstDayIndex = firstDay.getDay();

        // Add empty cells for days before first of month
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysGrid.appendChild(emptyDay);
        }

        // Add actual days
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            const dateToCheck = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateStr = this.formatDateToISO(dateToCheck);
            
            if (dateToCheck < new Date(new Date().setHours(0,0,0,0))) {
                dayElement.classList.add('past');
            } else {
                // Check availability from the fetched data
                const dayAvailability = this.availability[dateStr];
                if (dayAvailability) {
                    if (dayAvailability.fullyBooked) {
                        dayElement.classList.add('fully-booked');
                    } else {
                        dayElement.classList.add('available');
                    }
                } else {
                    dayElement.classList.add('available'); // Default to available if no data
                }
            }

            if (this.selectedDate && 
                dateToCheck.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }

            dayElement.innerHTML = `<span>${day}</span>`;
            
            if (!dayElement.classList.contains('past')) {
                dayElement.addEventListener('click', () => this.selectDate(dateToCheck));
            }
            
            daysGrid.appendChild(dayElement);
        }
    },

    selectDate(date) {
        console.log('Date selected:', date);
        this.selectedDate = date;
        document.getElementById('date').value = this.formatDateToISO(date);
        this.updateCalendar();
        loadTimeSlots(); // This calls your existing loadTimeSlots function
    },

    formatDateToISO(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    attachEventListeners() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        
        if (prevMonth && nextMonth) {
            prevMonth.addEventListener('click', async () => {
                this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
                try {
                    await this.fetchAvailability();
                    this.updateCalendar();
                } catch (error) {
                    console.error('Error updating calendar:', error);
                }
            });

            nextMonth.addEventListener('click', async () => {
                this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
                try {
                    await this.fetchAvailability();
                    this.updateCalendar();
                } catch (error) {
                    console.error('Error updating calendar:', error);
                }
            });
        }
    }
};

// Make calendar globally available
window.calendar = calendar;

console.log('Calendar module loaded successfully');