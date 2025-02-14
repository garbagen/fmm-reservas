// backend/config/index.js

const config = {
    development: {
      mongoUri: process.env.MONGODB_URI,
      jwtSecret: process.env.JWT_SECRET,
      port: process.env.PORT || 3000,
      corsOrigin: 'http://localhost:3000',
      adminUsername: process.env.ADMIN_USERNAME,
      adminPassword: process.env.ADMIN_PASSWORD,
      // Add Cloudinary configs for image hosting
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
      }
    },
    production: {
      mongoUri: process.env.MONGODB_URI,
      jwtSecret: process.env.JWT_SECRET,
      port: process.env.PORT || 3000,
      corsOrigin: [
        'https://fmm-reservas.onrender.com',
        'https://heritage-frontend.onrender.com' // Add your new frontend URL
      ],
      adminUsername: process.env.ADMIN_USERNAME,
      adminPassword: process.env.ADMIN_PASSWORD,
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
      }
    },
    test: {
      mongoUri: process.env.TEST_MONGODB_URI,
      jwtSecret: 'test-secret',
      port: 3001,
      corsOrigin: 'http://localhost:3000',
      adminUsername: 'testadmin',
      adminPassword: 'testpassword'
    }
  };
  
  const environment = process.env.NODE_ENV || 'development';
  module.exports = config[environment];