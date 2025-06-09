// config/db.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env');
  process.exit(1);
}

/**
 * connectDB
 * Attempts to connect to MongoDB using the URI from process.env.
 * Logs a message on success, or logs and exits on failure.
 */
const connectDB = async () => {
  try {

    await mongoose.connect(MONGO_URI, {
  
    });

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
