const dotenv = require('dotenv');
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
  console.warn('📝 Please create a .env file with the following variables:');
  console.warn('   MONGO_URI=mongodb://localhost:27017/attendance_system');
  console.warn('   JWT_SECRET=your_super_secret_jwt_key_here');
  console.warn('   EMAIL_USER=your_email@gmail.com');
  console.warn('   EMAIL_PASS=your_app_password_here');
}

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_system',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
};