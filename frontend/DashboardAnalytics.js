// DashboardAnalytics.js
const DashboardAnalytics = () => {
    // Create refs for charts
    const dailyChartRef = React.useRef(null);
    const monthlyChartRef = React.useRef(null);
    
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
            
            // Draw charts once data is loaded
            if (stats.daily.length > 0) {
                drawDailyChart(stats.daily);
            }
            if (stats.monthly.length > 0) {
                drawMonthlyChart(stats.monthly);
            }
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

    const drawDailyChart = (data) => {
        if (!dailyChartRef.current) return;
        
        const margin = {top: 20, right: 30, left: 50, bottom: 30};
        const width = dailyChartRef.current.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Clear previous chart
        d3.select(dailyChartRef.current).selectAll("*").remove();

        const svg = d3.select(dailyChartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.date))
            .padding(0.1);

        // Y scale
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.bookings)]);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#8884d8")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => x(d.date) + x.bandwidth()/2)
                .y(d => y(d.bookings))
            );

        // Add dots
        svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.date) + x.bandwidth()/2)
            .attr("cy", d => y(d.bookings))
            .attr("r", 4)
            .attr("fill", "#8884d8");
    };

    const drawMonthlyChart = (data) => {
        if (!monthlyChartRef.current) return;

        const margin = {top: 20, right: 30, left: 50, bottom: 30};
        const width = monthlyChartRef.current.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Clear previous chart
        d3.select(monthlyChartRef.current).selectAll("*").remove();

        const svg = d3.select(monthlyChartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.month))
            .padding(0.1);

        // Y scale
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.bookings)]);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add bars
        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.month))
            .attr("y", d => y(d.bookings))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.bookings))
            .attr("fill", "#8884d8");
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
            React.createElement('div', {
                ref: dailyChartRef,
                className: 'chart',
                style: { width: '100%', height: '300px' }
            })
        ),
        React.createElement('div', { className: 'chart-container' },
            React.createElement('h3', { 
                style: { 
                    marginBottom: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                } 
            }, 'Monthly Bookings'),
            React.createElement('div', {
                ref: monthlyChartRef,
                className: 'chart',
                style: { width: '100%', height: '300px' }
            })
        )
    );
};

window.DashboardAnalytics = DashboardAnalytics;