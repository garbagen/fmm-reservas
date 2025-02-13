// frontend/utils/datetime.js

const datetime = {
    // Format date to YYYY-MM-DD
    formatDate: (date) => {
        return date.toISOString().split('T')[0];
    },

    // Get today's date in YYYY-MM-DD format
    getToday: () => {
        return datetime.formatDate(new Date());
    },

    // Format time for display
    formatTime: (timeString) => {
        try {
            const [hours, minutes] = timeString.split(':');
            const time = new Date();
            time.setHours(parseInt(hours), parseInt(minutes));
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    },

    // Get capacity color class
    getCapacityClass: (remaining, total) => {
        const percentage = (remaining / total) * 100;
        if (percentage > 50) return 'capacity-high';
        if (percentage > 20) return 'capacity-medium';
        return 'capacity-low';
    },

    // Format capacity text
    formatCapacity: (remaining, total) => {
        if (remaining === 0) return 'Fully Booked';
        if (remaining === 1) return '1 spot left';
        return `${remaining} spots available`;
    }
};

// Make functions available globally
window.datetime = datetime;