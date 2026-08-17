const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { setMongoAvailable } = require('./services/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const emergencyRoutes = require('./routes/emergency');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/raahi_db')
  .then(() => {
    setMongoAvailable(true);
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    setMongoAvailable(false);
    console.error('MongoDB connection error:', err.message);
    console.log('Falling back to local JSON storage in backend/data/');
  });

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/emergency', emergencyRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'RAAHI Backend API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      emergency: '/api/emergency',
      health: '/api/health'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value',
      field: Object.keys(err.keyValue)[0]
    });
  }

  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RAAHI Backend server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Android Emulator URL: http://10.0.2.2:${PORT}/api`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
});
