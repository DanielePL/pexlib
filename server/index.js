const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Initialisierung der Express-App
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Prometheus Exercise Library Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', PORT);

// Enhanced CORS Configuration für DigitalOcean
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',                    // Local development
      'http://localhost:8080',                    // Alternative local
      process.env.CLIENT_URL,                     // Production client URL
      'https://your-domain.com',                  // Replace with your actual domain
      'https://www.your-domain.com'               // Replace with your actual domain
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(null, true); // Allow for now, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for easier development
}));
app.use(compression());

// Conditional logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB-Verbindung mit besserer Fehlerbehandlung
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prometheus-exercise-library';

    console.log('📊 Connecting to MongoDB...');
    console.log('🔗 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', mongoose.connection.name);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // In production, exit on DB connection failure
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// MongoDB connection event handlers
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// API Routes
console.log('🛤️  Setting up routes...');

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Exercise routes (if they exist)
try {
  app.use('/api/exercises', require('./routes/exercise'));
  console.log('✅ Exercise routes loaded');
} catch (error) {
  console.log('⚠️  Exercise routes not found, skipping...');
}

// Avatar routes (if they exist)
try {
  app.use('/api/avatars', require('./routes/avatar_management_routes'));
  console.log('✅ Avatar routes loaded');
} catch (error) {
  console.log('⚠️  Avatar routes not found, skipping...');
}

// AI Search routes (if they exist)
try {
  app.use('/api/ai-search', require('./routes/ai-search'));
  console.log('✅ AI Search routes loaded');
} catch (error) {
  console.log('⚠️  AI Search routes not found, skipping...');
}

// Video generation routes (if they exist)
try {
  app.use('/api/video-generation', require('./routes/video-generation'));
  console.log('✅ Video generation routes loaded');
} catch (error) {
  console.log('⚠️  Video generation routes not found, skipping...');
}

// MEGA Discovery routes (if they exist)
try {
  app.use('/api/mega-discovery', require('./routes/mega-discovery'));
  console.log('✅ MEGA Discovery routes loaded');
} catch (error) {
  console.log('⚠️  MEGA Discovery routes not found, skipping...');
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Prometheus Exercise Library API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

// Serve static React files in production
if (process.env.NODE_ENV === 'production') {
  console.log('🎯 Setting up production static file serving...');

  const clientBuildPath = path.join(__dirname, '../client/build');
  console.log('📁 Client build path:', clientBuildPath);

  // Serve static files
  app.use(express.static(clientBuildPath));

  // Handle React Router (SPA)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    }

    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  console.log('✅ Production static file serving configured');
} else {
  // Development mode - just API
  app.get('/', (req, res) => {
    res.json({
      message: 'Prometheus Exercise Library API - Development Mode',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/status - API status',
        'GET /health - Health check',
        'POST /api/auth/login - User login',
        'GET /api/auth/verify - Token verification'
      ]
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /api/status',
      'POST /api/auth/login',
      'GET /api/auth/verify'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);

  if (process.env.NODE_ENV === 'production') {
    console.log('🌍 Production mode - serving React app');
  } else {
    console.log('🔧 Development mode - API only');
  }

  console.log('⚡ Prometheus Exercise Library is ready!');
});

module.exports = app;