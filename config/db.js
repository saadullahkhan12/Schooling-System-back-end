// config/db.js
const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected...');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.warn('⚠️  Server will continue without database connection');
    console.warn('📝 Make sure MongoDB is running or update MONGO_URI in .env file');
    return false;
  }
};

module.exports = connectDB; 