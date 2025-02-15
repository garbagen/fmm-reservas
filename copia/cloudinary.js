// backend/services/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'heritage-sites'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };