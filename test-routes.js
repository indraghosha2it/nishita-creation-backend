// Load environment variables first
require('dotenv').config();

const express = require('express');
const app = express();

console.log('🔍 Checking Cloudinary credentials:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Present' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Present' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Present' : '❌ Missing');

// Test if we can import the routes
try {
  const categoryRoutes = require('./src/routes/categoryRoutes');
  console.log('✅ Category routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading category routes:', error.message);
}