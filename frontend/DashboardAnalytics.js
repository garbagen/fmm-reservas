// DashboardAnalytics.js
const DashboardAnalytics = () => {
    const {
        LineChart, Line, BarChart, Bar, XAxis, YAxis,
        CartesianGrid, Tooltip, Legend, ResponsiveContainer
    } = Recharts;

    const [bookingStats, setBookingStats] = React.useState({
        daily: [],
        monthly: [],
        loading: true
    });

    React.useEffect(() => {
        fetchBookingStats();
    }, []);

    const fetchBookingStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('https://fmm-reservas-api.onrender.com/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const bookings = await response.json();
            const stats = processBookingData(bookings);
            setBookingStats(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const processBookingData = (bookings) => {
        const dailyData = {};
        const monthlyData = {};

        bookings.forEach(booking => {
            // Daily stats
            const date = booking.date;
            dailyData[date] = (dailyData[date] || 0) + 1;

            // Monthly stats
            const month = date.substring(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        return {
            daily: Object.entries(dailyData)
                .map(([date, count]) => ({
                    date,
                    bookings: count
                }))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-14),
            monthly: Object.entries(monthlyData)
                .map(([month, count]) => ({
                    month,
                    bookings: count
                }))
                .sort((a, b) => a.month.localeCompare(b.month)),
            loading: false
        };
    };

    if (bookingStats.loading) {
        return React.createElement('div', {
            className: 'loading-spinner'
        });
    }

    return React.createElement('div', { className: 'analytics-dashboard' },
        // Daily Bookings Chart
        React.createElement('div', { className: 'chart-container' },
            React.createElement('h3', {}, 'Daily Bookings (Last 14 Days)'),
            React.createElement(ResponsiveContainer, { width: '100%', height: 300 },
                React.createElement(LineChart, { data: bookingStats.daily },
                    React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                    React.createElement(XAxis, { dataKey: 'date' }),
                    React.createElement(YAxis),
                    React.createElement(Tooltip),
                    React.createElement(Legend),
                    React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'bookings',
                        stroke: '#8884d8'
                    })
                )
            )
        ),
        // Monthly Bookings Chart
        React.createElement('div', { className: 'chart-container' },
            React.createElement('h3', {}, 'Monthly Bookings'),
            React.createElement(ResponsiveContainer, { width: '100%', height: 300 },
                React.createElement(BarChart, { data: bookingStats.monthly },
                    React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                    React.createElement(XAxis, { dataKey: 'month' }),
                    React.createElement(YAxis),
                    React.createElement(Tooltip),
                    React.createElement(Legend),
                    React.createElement(Bar, {
                        dataKey: 'bookings',
                        fill: '#8884d8'
                    })
                )
            )
        )
    );
};

// Export the component
window.DashboardAnalytics = DashboardAnalytics;