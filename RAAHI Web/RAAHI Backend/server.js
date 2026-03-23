const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const databaseManager = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const destinationRoutes = require('./routes/destinations');
const aiRoutes = require('./routes/ai');
const healthRoutes = require('./routes/health');
const emergencyRoutes = require('./routes/emergency');
const geofenceRoutes = require('./routes/geofences');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080'
    ];

    if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  req.id = Math.random().toString(36).slice(2, 11);
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/geofences', geofenceRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Tourism Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      destinations: '/api/destinations',
      ai: '/api/ai',
      emergency: '/api/emergency',
      geofences: '/api/geofences'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

let server;

const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  if (!server) {
    process.exit(0);
    return;
  }

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await databaseManager.disconnect();
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.log('Forcing shutdown after 30 seconds...');
    process.exit(1);
  }, 30000);
};

const listenOnPort = (port) => new Promise((resolve, reject) => {
  const instance = app.listen(port, () => resolve(instance));
  instance.once('error', reject);
});

const startListening = async (initialPort, maxAttempts = 10) => {
  let port = initialPort;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const instance = await listenOnPort(port);
      return { server: instance, port };
    } catch (error) {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }

      console.warn(`Port ${port} is already in use. Trying ${port + 1}...`);
      port += 1;
    }
  }

  throw new Error(`No available port found between ${initialPort} and ${port}`);
};

const startServer = async () => {
  try {
    console.log('Starting Smart Tourism Backend...');
    await databaseManager.connect();

    const preferredPort = parseInt(process.env.PORT, 10) || 5000;
    const started = await startListening(preferredPort);
    server = started.server;

    console.log(`Server running on port ${started.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Base URL: http://localhost:${started.port}/api`);
    console.log('Smart Tourism Backend is ready');

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

module.exports = app;

if (require.main === module) {
  startServer();
}
