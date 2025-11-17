import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Parse CLOUDINARY_URL if provided
let config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// If CLOUDINARY_URL is set, parse it (format: cloudinary://key:secret@cloud_name)
if (process.env.CLOUDINARY_URL) {
  try {
    const url = new URL(process.env.CLOUDINARY_URL);
    config = {
      cloud_name: url.hostname,
      api_key: url.username,
      api_secret: url.password
    };
  } catch (error) {
    console.error('❌ Erreur parsing CLOUDINARY_URL:', error.message);
  }
}

cloudinary.config(config);

console.log(`✅ Cloudinary configure: ${config.cloud_name}`);

export default cloudinary;
