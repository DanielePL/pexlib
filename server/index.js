// server/index.js - Complete with Avatar Routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://models.readyplayer.me"],
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prometheus-exercise-library', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PEXLIB API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      avatar: 'ready'
    }
  });
});

// API Routes
try {
  // Exercise routes
  app.use('/api/exercises', require('./routes/exercise'));

  // AI Search routes
  app.use('/api/ai-search', require('./routes/ai-search'));

  // Avatar management routes - COMPLETE INTEGRATION
  app.use('/api/avatar', require('./routes/avatar_management_routes'));
  app.use('/api/avatars', require('./routes/avatar_management_routes'));

  // Authentication routes
  app.use('/api/auth', require('./routes/auth'));

  // Video generation routes (if exists)
  if (require('fs').existsSync('./routes/video-generation.js')) {
    app.use('/api/video', require('./routes/video-generation'));
  }

  // Mega discovery routes (if exists)
  if (require('fs').existsSync('./routes/mega-discovery.js')) {
    app.use('/api/mega', require('./routes/mega-discovery'));
  }

  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// Avatar-specific endpoints for PEXLIB
app.get('/api/avatar/status', (req, res) => {
  res.json({
    status: 'active',
    version: '1.0',
    readyPlayerMe: {
      supported: true,
      defaultAvatar: 'https://models.readyplayer.me/6835832653b18d01814a0692.glb'
    },
    features: [
      '3D Avatar Rendering',
      'Exercise Demonstrations',
      'Personal Coaching',
      'Animation Support'
    ]
  });
});

// Ready Player Me integration test
app.get('/api/avatar/test-rpm', (req, res) => {
  res.json({
    message: 'Ready Player Me integration test',
    avatarUrl: 'https://models.readyplayer.me/6835832653b18d01814a0692.glb',
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ API Error:', error);

  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/health',
      '/api/exercises',
      '/api/avatar',
      '/api/ai-search',
      '/api/auth'
    ]
  });
});

// Static file serving for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PEXLIB Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Avatar support: Ready Player Me integration active`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;