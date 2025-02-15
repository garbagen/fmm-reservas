const rateLimit = require('express-rate-limit');

// Create a limiter for general API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 100, // Limit each IP to 100 requests per window
    message: {
        error: 'Too many requests, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Add these options
    trustProxy: true,
    skip: (req) => {
        // Skip rate limiting for development environment
        return process.env.NODE_ENV === 'development';
    }
});

// Create a stricter limiter for login attempts
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Limit each IP to 5 login attempts per hour
    message: {
        error: 'Too many login attempts, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Add these options
    trustProxy: true,
    skip: (req) => {
        // Skip rate limiting for development environment
        return process.env.NODE_ENV === 'development';
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};