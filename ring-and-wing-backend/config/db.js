const mongoose = require('mongoose');
require('dotenv').config();

// Connection options optimized for MongoDB Atlas
const mongooseOptions = {
  // Connection pooling - adjusted for Atlas
  maxPoolSize: 10, // Reduced for cloud deployment
  minPoolSize: 3,
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
  serverSelectionTimeoutMS: 10000, // Increased timeout for cloud connectivity
  heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
  retryWrites: true,
  retryReads: true,
  // Modern MongoDB driver doesn't need these options anymore
  // They're applied by default and setting them causes errors
  // ssl: true is handled automatically
  authSource: 'admin'
  // Removed deprecated options:
  // autoReconnect, reconnectTries, reconnectInterval
  // useNewUrlParser, useUnifiedTopology
};

// Connection with retry mechanism
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log('MongoDB Atlas connected successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      // Don't exit the process, just log the error
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected, attempting to reconnect...');
      // Try to reconnect using the built-in reconnection mechanism
      // No need to manually reconnect in newer Mongoose versions
      // The driver will attempt reconnection automatically
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
  } catch (err) {
    console.error('MongoDB initial connection error:', err.message);
    // Don't exit the process immediately, allow for retries
    setTimeout(() => {
      console.log('Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

module.exports = connectDB;