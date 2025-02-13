// DashboardAnalytics.js
const DashboardAnalytics = () => {
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
            console.log('Fetching bookings with token:', token ? 'Token present' : 'No token');
            
            const response = await fetch('https://fmm-reservas-api.onrender.com/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const bookings = await response.json();
            console.log('Received bookings:', bookings);
            
            const stats = processBookingData(bookings);
            console.log('Processed stats:', stats);
            
            setBookingStats(stats);
            
            // Draw charts after a short delay to ensure refs are ready
            setTimeout(() => {
                if (stats.daily.length > 0) {
                    console.log('Drawing daily chart with data:', stats.daily);
                    drawDailyChart(stats.daily);
                }
                if (stats.monthly.length > 0) {
                    console.log('Drawing monthly chart with data:', stats.monthly);
                    drawMonthlyChart(stats.monthly);
                }
            }, 100);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            window.toast.error('Error loading booking statistics');
        }
    };

    const processBookingData = (bookings) => {
        if (!Array.isArray(bookings)) {
            console.error('Expected bookings to be an array, got:', typeof bookings);
            return { daily: [], monthly: [], loading: false };
        }

        const dailyData = {};
        const monthlyData = {};
        
        console.log('Processing bookings:', bookings.length, 'entries');

        bookings.forEach(booking => {
            if (!booking.date) {
                console.warn('Booking missing date:', booking);
                return;
            }

            // Daily stats - use only the date part
            const date = booking.date.split('T')[0];
            dailyData[date] = (dailyData[date] || 0) + 1;

            // Monthly stats
            const month = date.substring(0, 7); // YYYY-MM format
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const daily = Object.entries(dailyData)
            .map(([date, count]) => ({
                date,
                bookings: count
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-14);

        const monthly = Object.entries(monthlyData)
            .map(([month, count]) => ({
                month,
                bookings: count
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        console.log('Processed data:', { daily, monthly });
        
        return {
            daily,
            monthly,
            loading: false
        };
    };

    const drawDailyChart = (data) => {
        if (!dailyChartRef.current) {
            console.warn('Daily chart ref not ready');
            return;
        }
        
        const margin = {top: 20, right: 30, left: 50, bottom: 50};
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

        // Format dates for display
        const formatDate = d3.timeFormat("%b %d");
        data = data.map(d => ({
            ...d,
            displayDate: formatDate(new Date(d.date))
        }));

        // X scale
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.displayDate))
            .padding(0.1);

        // Y scale
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.bookings) * 1.1]); // Add 10% padding

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5));

        // Add the line
        const line = d3.line()
            .x(d => x(d.displayDate) + x.bandwidth()/2)
            .y(d => y(d.bookings))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#8884d8")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add dots
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.displayDate) + x.bandwidth()/2)
            .attr("cy", d => y(d.bookings))
            .attr("r", 4)
            .attr("fill", "#8884d8")
            .append("title")
            .text(d => `${d.displayDate}: ${d.bookings} bookings`);
    };

    const drawMonthlyChart = (data) => {
        if (!monthlyChartRef.current) {
            console.warn('Monthly chart ref not ready');
            return;
        }

        const margin = {top: 20, right: 30, left: 50, bottom: 50};
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

        // Format months for display
        const formatMonth = d3.timeFormat("%b %Y");
        data = data.map(d => ({
            ...d,
            displayMonth: formatMonth(new Date(d.month + "-01"))
        }));

        // X scale
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.displayMonth))
            .padding(0.1);

        // Y scale
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.bookings) * 1.1]); // Add 10% padding

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5));

        // Add bars
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.displayMonth))
            .attr("y", d => y(d.bookings))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.bookings))
            .attr("fill", "#8884d8")
            .append("title")
            .text(d => `${d.displayMonth}: ${d.bookings} bookings`);
    };

    if (bookingStats.loading) {
        return React.createElement('div', {
            style: {
                display: 'flex',
                justifyContent: 'center',
                padding: '20px'
            }
        }, 'Loading statistics...');
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

// Export to window object
window.DashboardAnalytics = DashboardAnalytics;