const express = require('express');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
require('dotenv').config({ silent: true }); // Suppresses log
const app = express();
const passwordRoutes = require('./routes/passwordRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    routes: {
      auth: '/auth',
      attendance: '/api/attendance',
      protected: '/api'
    }
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/auth', passwordRoutes); // Add this line
app.use('/api/attendance', attendanceRoutes);

app.use('/api', protectedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', err.message);
  console.error('📍 Stack trace:', err.stack);
  console.error('🔍 Request details:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to DB and start server
connectDB().then((dbConnected) => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email service configured`);
    console.log(`🔐 Auth routes: /auth`);
    console.log(`📊 Attendance routes: /api/attendance`);
    console.log(`🛡️ Protected routes: /api`);
    if (!dbConnected) {
      console.warn('⚠️  Database not connected - some features may not work');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.error('💡 Try one of these solutions:');
      console.error('   1. Kill existing processes: taskkill /F /IM node.exe');
      console.error('   2. Use a different port: set PORT=3001 && node index.js');
      console.error('   3. Find what\'s using the port: netstat -ano | findstr :3000');
    } else {
      console.error('❌ Server error:', err.message);
    }
    process.exit(1);
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});