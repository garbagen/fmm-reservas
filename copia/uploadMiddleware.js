const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dbripkyv7',
    api_key: '778414926415968',
    api_secret: 'xHrB96YglR2M93XAm1VHMe6lqtU'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'heritage-sites',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 800, height: 600, crop: 'fill' }],
        format: 'jpg',
        // This ensures we get back the complete URL including version
        use_filename: true,
        unique_filename: true
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;