// DashboardAnalytics.js
window.DashboardAnalytics = function() {
    // Get Recharts components from global scope
    const {
        LineChart, Line, BarChart, Bar, XAxis, YAxis,
        CartesianGrid, Tooltip, Legend, ResponsiveContainer
    } = window.Recharts;

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
            style: {
                display: 'flex',
                justifyContent: 'center',
                padding: '20px'
            }
        }, 'Loading...');
    }

    return React.createElement('div', { className: 'analytics-dashboard' },
        React.createElement('div', { className: 'chart-container' },
            React.createElement('h3', { 
                style: { 
                    marginBottom: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                }
            }, 'Daily Bookings (Last 14 Days)'),
            React.createElement(ResponsiveContainer, { 
                width: '100%', 
                height: 300,
                className: 'chart'
            },
                React.createElement(LineChart, { 
                    data: bookingStats.daily,
                    margin: { top: 5, right: 30, left: 20, bottom: 5 }
                },
                    React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                    React.createElement(XAxis, { dataKey: 'date' }),
                    React.createElement(YAxis),
                    React.createElement(Tooltip),
                    React.createElement(Legend),
                    React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'bookings',
                        stroke: '#8884d8',
                        activeDot: { r: 8 }
                    })
                )
            )
        ),
        React.createElement('div', { className: 'chart-container' },
            React.createElement('h3', { 
                style: { 
                    marginBottom: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                } 
            }, 'Monthly Bookings'),
            React.createElement(ResponsiveContainer, { 
                width: '100%', 
                height: 300,
                className: 'chart'
            },
                React.createElement(BarChart, { 
                    data: bookingStats.monthly,
                    margin: { top: 5, right: 30, left: 20, bottom: 5 }
                },
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