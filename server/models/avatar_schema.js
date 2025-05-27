// server/models/avatar_schema.js - Final Complete Schema
const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
  // User Association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Basic Avatar Info
  name: {
    type: String,
    required: true,
    default: 'My PEXLIB Coach',
    maxlength: 100
  },

  // Ready Player Me Integration
  avatarUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https:\/\//.test(v);
      },
      message: 'Avatar URL must be a valid HTTPS URL'
    }
  },
  avatarId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Coach Personality & Style
  personality: {
    type: String,
    enum: ['motivational', 'technical', 'energetic', 'supportive', 'professional'],
    default: 'motivational'
  },
  specialization: {
    type: String,
    enum: ['general_fitness', 'strength_training', 'cardio', 'flexibility', 'sports_specific', 'rehabilitation'],
    default: 'general_fitness'
  },
  coachingStyle: {
    motivationLevel: { type: Number, min: 1, max: 10, default: 7 },
    technicalDetail: { type: Number, min: 1, max: 10, default: 6 },
    encouragementFrequency: { type: Number, min: 1, max: 10, default: 8 },
    correctionApproach: {
      type: String,
      enum: ['gentle', 'direct', 'detailed', 'supportive'],
      default: 'supportive'
    }
  },

  // Professional Branding
  brandName: {
    type: String,
    default: 'PEXLIB - Prometheus Exercise Library',
    maxlength: 150
  },
  userType: {
    type: String,
    enum: ['professional', 'personal', 'business', 'educator'],
    default: 'professional'
  },
  businessInfo: {
    gymName: String,
    certifications: [String],
    specialties: [String],
    contactInfo: {
      website: String,
      email: String,
      phone: String
    }
  },

  // Avatar Appearance & Configuration
  appearance: {
    readyPlayerMeUrl: {
      type: String,
      required: true
    },
    avatarId: String,
    bodyType: {
      type: String,
      enum: ['halfbody', 'fullbody'],
      default: 'halfbody'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other'
    },
    customizations: {
      outfit: String,
      accessories: [String],
      expressions: [String]
    }
  },

  // Voice & Communication (for future features)
  voice: {
    type: {
      type: String,
      enum: ['energetic', 'calm', 'professional', 'friendly', 'motivational'],
      default: 'professional'
    },
    language: {
      type: String,
      default: 'en-US'
    },
    speed: {
      type: Number,
      min: 0.5,
      max: 2.0,
      default: 1.0
    },
    pitch: {
      type: Number,
      min: 0.5,
      max: 2.0,
      default: 1.0
    }
  },

  // Exercise & Training Capabilities
  exerciseCapabilities: {
    demonstratedExercises: [{
      exerciseId: String,
      exerciseName: String,
      demonstrationCount: { type: Number, default: 0 },
      lastDemonstrated: Date
    }],
    specializedMovements: [String],
    preferredCoachingCues: [String],
    correctionFocus: [String]
  },

  // Usage Analytics & Performance
  analytics: {
    totalDemonstrations: { type: Number, default: 0 },
    totalCoachingTime: { type: Number, default: 0 }, // in minutes
    exercisesCoached: { type: Number, default: 0 },
    userInteractions: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 },
    userSatisfactionRating: { type: Number, min: 1, max: 5 },
    lastUsed: { type: Date, default: Date.now },
    popularExercises: [{
      exerciseName: String,
      demonstrationCount: Number
    }]
  },

  // Technical Metadata
  metadata: {
    domain: String,
    createdVia: String,
    version: { type: String, default: '1.0' },
    readyPlayerMeVersion: String,
    createdAt: { type: Date, default: Date.now },
    lastSyncedAt: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String,
    sessionInfo: {
      browser: String,
      platform: String,
      screenResolution: String
    }
  },

  // Feature Permissions & Premium Status
  permissions: {
    isPremium: { type: Boolean, default: true },
    features: {
      voiceCoaching: { type: Boolean, default: false },
      customAnimations: { type: Boolean, default: true },
      brandingCustomization: { type: Boolean, default: true },
      advancedAnalytics: { type: Boolean, default: true },
      exerciseCreation: { type: Boolean, default: true },
      clientSharing: { type: Boolean, default: false },
      exportData: { type: Boolean, default: true }
    },
    limitations: {
      maxDemonstrations: { type: Number, default: -1 }, // -1 = unlimited
      maxExercises: { type: Number, default: -1 },
      maxClients: { type: Number, default: -1 }
    }
  },

  // System Status & Health
  status: {
    isActive: { type: Boolean, default: true },
    currentStatus: {
      type: String,
      enum: ['active', 'loading', 'error', 'maintenance', 'updating'],
      default: 'active'
    },
    lastHealthCheck: { type: Date, default: Date.now },
    errorCount: { type: Number, default: 0 },
    lastError: {
      message: String,
      timestamp: Date,
      resolved: { type: Boolean, default: false }
    }
  },

  // Integration Settings
  integrations: {
    readyPlayerMe: {
      apiKey: String,
      subdomain: String,
      webhookUrl: String,
      lastSync: Date
    },
    pexlib: {
      autoSync: { type: Boolean, default: true },
      exerciseLibraryAccess: { type: Boolean, default: true },
      realTimeUpdates: { type: Boolean, default: true }
    },
    thirdParty: {
      fitnessApps: [String],
      wearableDevices: [String],
      socialPlatforms: [String]
    }
  },

  // User Feedback & Improvement
  feedback: {
    userRatings: [{
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      timestamp: { type: Date, default: Date.now },
      category: String // 'demonstration', 'coaching', 'appearance', etc.
    }],
    improvementSuggestions: [String],
    featureRequests: [String]
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for Performance
AvatarSchema.index({ user: 1, isActive: 1 });
AvatarSchema.index({ avatarId: 1 });
AvatarSchema.index({ 'status.currentStatus': 1 });
AvatarSchema.index({ 'analytics.lastUsed': -1 });
AvatarSchema.index({ createdAt: -1 });

// Instance Methods
AvatarSchema.methods.incrementUsage = function() {
  this.analytics.userInteractions += 1;
  this.analytics.lastUsed = new Date();
  this.status.lastHealthCheck = new Date();
  return this.save();
};

AvatarSchema.methods.recordExerciseDemo = function(exerciseName, sessionLength = 0) {
  // Update analytics
  this.analytics.totalDemonstrations += 1;
  this.analytics.exercisesCoached += 1;
  this.analytics.totalCoachingTime += sessionLength;
  this.analytics.lastUsed = new Date();

  // Update exercise capabilities
  const existingExercise = this.exerciseCapabilities.demonstratedExercises.find(
    ex => ex.exerciseName === exerciseName
  );

  if (existingExercise) {
    existingExercise.demonstrationCount += 1;
    existingExercise.lastDemonstrated = new Date();
  } else {
    this.exerciseCapabilities.demonstratedExercises.push({
      exerciseName,
      demonstrationCount: 1,
      lastDemonstrated: new Date()
    });
  }

  // Update popular exercises
  const popularExercise = this.analytics.popularExercises.find(
    ex => ex.exerciseName === exerciseName
  );

  if (popularExercise) {
    popularExercise.demonstrationCount += 1;
  } else {
    this.analytics.popularExercises.push({
      exerciseName,
      demonstrationCount: 1
    });
  }

  return this.save();
};

AvatarSchema.methods.addUserFeedback = function(rating, comment, category = 'general') {
  this.feedback.userRatings.push({
    rating,
    comment,
    category,
    timestamp: new Date()
  });

  // Update average satisfaction rating
  const ratings = this.feedback.userRatings.map(f => f.rating);
  this.analytics.userSatisfactionRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  return this.save();
};

AvatarSchema.methods.updateHealthStatus = function(status = 'active') {
  this.status.currentStatus = status;
  this.status.lastHealthCheck = new Date();
  if (status === 'error') {
    this.status.errorCount += 1;
  }
  return this.save();
};

// Static Methods
AvatarSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({
    user: userId,
    'status.isActive': true,
    'status.currentStatus': 'active'
  }).sort({ 'analytics.lastUsed': -1 });
};

AvatarSchema.statics.getPopularPersonalities = function() {
  return this.aggregate([
    { $match: { 'status.isActive': true } },
    { $group: { _id: '$personality', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

AvatarSchema.statics.getUsageStatistics = function() {
  return this.aggregate([
    { $match: { 'status.isActive': true } },
    {
      $group: {
        _id: null,
        totalAvatars: { $sum: 1 },
        totalDemonstrations: { $sum: '$analytics.totalDemonstrations' },
        totalCoachingTime: { $sum: '$analytics.totalCoachingTime' },
        averageRating: { $avg: '$analytics.userSatisfactionRating' }
      }
    }
  ]);
};

AvatarSchema.statics.findByReadyPlayerMeId = function(avatarId) {
  return this.findOne({ avatarId: avatarId });
};

// Pre-save middleware
AvatarSchema.pre('save', function(next) {
  // Auto-update lastSyncedAt
  this.metadata.lastSyncedAt = new Date();

  // Ensure avatar URL matches avatar ID
  if (this.avatarUrl && !this.avatarId) {
    const match = this.avatarUrl.match(/\/([a-zA-Z0-9]+)\.glb/);
    if (match) {
      this.avatarId = match[1];
    }
  }

  next();
});

// Post-save middleware
AvatarSchema.post('save', function(doc) {
  console.log(`✅ Avatar saved: ${doc.name} (${doc.avatarId})`);
});

module.exports = mongoose.model('Avatar', AvatarSchema);