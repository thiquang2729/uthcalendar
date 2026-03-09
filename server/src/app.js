require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const scheduler = require('./services/scheduler');

// Import routes
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const googleRoutes = require('./routes/google');
const subjectsRoutes = require('./routes/subjects');
const eventsRoutes = require('./routes/events');
const syncRoutes = require('./routes/sync');
const logsRoutes = require('./routes/logs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toLocaleString('vi-VN') });
});

// Khởi động server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Khởi động scheduler
  await scheduler.startScheduler();

  app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
  });
};

startServer();
