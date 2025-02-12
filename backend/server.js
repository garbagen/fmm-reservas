const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
require('dotenv').config();

const upload = require('./middleware/uploadMiddleware');

const app = express();
const path = require('path');

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);

// Define MongoDB Schemas
const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  timeSlots: [{
    time: String,
    capacity: Number
  }]
});

const bookingSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  visitorName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create MongoDB Models
const Site = mongoose.model('Site', siteSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Create default admin account function
async function createDefaultAdmin() {
    try {
        console.log('Checking for default admin account...');
        
        // Delete any existing admin account
        await Admin.deleteMany({ username: 'admin' });
        
        // Create new admin account
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await Admin.create({
            username: 'admin',
            password: hashedPassword
        });
        
        console.log('Default admin account created successfully');
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

// Connect to MongoDB and create admin account
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await createDefaultAdmin();
  })
  .catch(err => {
    console.error('MongoDB connection error details:', err.message);
    process.exit(1);
  });
// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        
        // Create token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Public Routes
app.get('/api/sites', async (req, res) => {
    try {
        const sites = await Site.find();
        res.json(sites);
    } catch (error) {
        res.status(500).json({ error: 'Error reading sites' });
    }
});

app.get('/api/sites/:id', async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json(site);
    } catch (error) {
        res.status(500).json({ error: 'Error reading site' });
    }
});

// Public booking routes (no authentication needed)
app.get('/api/bookings/public', async (req, res) => {
    try {
        let query = {};
        if (req.query.date) query.date = req.query.date;
        if (req.query.siteId) query.siteName = req.query.siteId;
        
        const bookings = await Booking.find(query);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error reading bookings' });
    }
});

// Protected Routes
app.post('/api/sites', authenticateToken, async (req, res) => {
    try {
        const siteData = req.body;
        console.log('Received site data:', siteData); // Debug log
        const newSite = new Site(siteData);
        const savedSite = await newSite.save();
        console.log('Saved site:', savedSite); // Debug log
        res.status(201).json(savedSite);
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ error: 'Error creating site' });
    }
});

app.put('/api/sites/:id', authenticateToken, async (req, res) => {
    try {
        const site = await Site.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!site) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json(site);
    } catch (error) {
        res.status(500).json({ error: 'Error updating site' });
    }
});

app.delete('/api/sites/:id', authenticateToken, async (req, res) => {
    try {
        const site = await Site.findByIdAndDelete(req.params.id);
        if (!site) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting site' });
    }
});

// Admin booking routes (requires authentication)
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error reading bookings' });
    }
});
// Add this route after your existing routes in server.js

// Get availability for a specific site and month
// In server.js - Update the availability endpoint
app.get('/api/sites/:siteId/availability/:month', async (req, res) => {
    try {
        const { siteId, month } = req.params;
        const site = await Site.findById(siteId);
        
        if (!site) {
            return res.status(404).json({ error: 'Site not found' });
        }

        // Parse the month parameter (format: "2024-2" for February 2024)
        const [year, monthNum] = month.split('-');
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0); // Last day of the month
        
        // Format dates for query
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        // Get all bookings for this site in the date range
        const bookings = await Booking.find({
            siteName: site.name,
            date: {
                $gte: start,
                $lte: end
            }
        });

        // Calculate availability for each day
        let availability = {};
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayBookings = bookings.filter(b => b.date === dateStr);
            
            // Track time slot-specific availability
            const timeSlots = {};
            let allSlotsFull = true;

            site.timeSlots.forEach(slot => {
                if (!slot.time) return;
                
                const slotBookings = dayBookings.filter(b => b.time === slot.time);
                const remaining = slot.capacity - slotBookings.length;
                
                timeSlots[slot.time] = {
                    capacity: slot.capacity,
                    booked: slotBookings.length,
                    remaining: remaining
                };

                if (remaining > 0) {
                    allSlotsFull = false;
                }
            });

            availability[dateStr] = {
                fullyBooked: allSlotsFull,
                timeSlots: timeSlots
            };
        }

        res.json(availability);
    } catch (error) {
        console.error('Error getting availability:', error);
        res.status(500).json({ 
            error: 'Error calculating availability',
            message: error.message 
        });
    }
});
// Add this validation middleware before creating a booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { siteName, visitorName, date, time } = req.body;
        
        // Find the site to check capacity
        const site = await Site.findOne({ name: siteName });
        if (!site) {
            return res.status(404).json({ 
                error: 'Site not found',
                message: 'The selected site does not exist'
            });
        }

        // Find the time slot
        const timeSlot = site.timeSlots.find(slot => slot.time === time);
        if (!timeSlot) {
            return res.status(400).json({
                error: 'Invalid time slot',
                message: 'The selected time slot is not valid'
            });
        }

        // Count existing bookings for this slot
        const existingBookings = await Booking.countDocuments({
            siteName,
            date,
            time
        });

        // Check capacity
        if (existingBookings >= timeSlot.capacity) {
            return res.status(400).json({
                error: 'Capacity exceeded',
                message: 'This time slot is fully booked'
            });
        }

        // If validation passes, create the booking
        const newBooking = new Booking({
            siteName,
            visitorName,
            date,
            time,
            createdAt: new Date()
        });

        await newBooking.save();
        console.log('Booking saved:', newBooking);
        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            error: 'Error creating booking',
            message: error.message
        });
    }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting booking' });
    }
});
// Add this route after your existing routes
app.post('/api/sites/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Add these configurations to your existing server.js

// CORS configuration for Render
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://fmm-reservas.onrender.com', 'http://localhost:5173']
        : 'http://localhost:5173',
    credentials: true
}));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling for Render's timeout
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        error: {
            message: error.message || 'Internal Server Error',
            status: error.status || 500
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});