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

// Routes
app.use('/auth', authRoutes);
app.use('/auth', passwordRoutes); // Add this line
app.use('/api/attendance', attendanceRoutes);

app.use('/api', protectedRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});