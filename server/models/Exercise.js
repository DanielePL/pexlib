// server/models/exercise.js - Erweiterte Version mit Video Generation
const mongoose = require('mongoose');

// Discussion/Comment schema (unverändert)
const discussionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isCoach: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// Erweiterte Exercise Schema mit Video Generation
const exerciseSchema = new mongoose.Schema({
  // Basic Information (unverändert)
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },

  // Classification (unverändert)
  muscleGroup: {
    type: String,
    required: true,
    enum: [
      'Neck', 'Traps (Trapezius)', 'Shoulders (Deltoids)',
      'Chest (Pectoralis)', 'Back (Latissimus Dorsi)', 'Back (Rhomboids)',
      'Back (Erector Spinae)', 'Biceps (Biceps Brachii)', 'Triceps (Triceps Brachii)',
      'Forearms', 'Abdominals (Rectus Abdominis)', 'Obliques',
      'Lower Back (Erector Spinae)', 'Quadriceps', 'Hamstrings',
      'Glutes', 'Hip Flexors', 'Calves (Gastrocnemius)', 'Calves (Soleus)',
      'Full Body', 'Upper Body', 'Lower Body', 'Push (Chest/Shoulders/Triceps)',
      'Pull (Back/Biceps)', 'Legs (Quads/Hamstrings/Glutes)', 'Core', 'Arms'
    ]
  },

  category: {
    type: String,
    required: true,
    enum: [
      'Strength', 'Power', 'Hypertrophy', 'Endurance', 'Stability', 'Mobility',
      'Flexibility', 'Speed', 'Agility', 'Cardio', 'Recovery', 'Compound',
      'Isolation', 'Push', 'Pull', 'Hinge', 'Squat', 'Lunge', 'Carry',
      'Rotation', 'Anti-rotation', 'Concentric Focus', 'Eccentric Focus',
      'Isometric/Hold', 'Plyometric', 'Ballistic', 'Quarter Reps', 'Half Reps',
      'Full Reps', 'Tempo', 'Explosive', 'Slow & Controlled', 'Bodyweight',
      'Free Weights', 'Machine', 'Cable', 'Resistance Band', 'Suspension',
      'Kettlebell', 'Medicine Ball', 'Sled/Prowler', 'Drop Sets', 'Super Sets',
      'Giant Sets', 'Tri-Sets', 'Rest-Pause', 'AMRAP', 'EMOM', 'Tabata',
      'Pyramid', 'Reverse Pyramid', 'Pre-Exhaustion', 'Post-Exhaustion',
      'Time Under Tension', 'CrossFit', 'HYROX', 'Powerlifting',
      'Olympic Weightlifting', 'Bodybuilding', 'Strongman', 'Calisthenics',
      'Functional Fitness', 'Sports Performance', 'Rehabilitation'
    ]
  },

  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Elite']
  },

  // Equipment and Setup (unverändert)
  equipment: {
    type: String,
    required: true,
    enum: [
      'None', 'Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Cable',
      'Resistance Band', 'Bodyweight', 'Medicine Ball', 'Sandbag',
      'TRX/Suspension', 'Battle Ropes', 'Slam Ball', 'Box', 'Bench',
      'Pull-up Bar', 'Parallel Bars', 'Other'
    ]
  },

  // ... alle anderen bestehenden Felder bleiben unverändert ...

  // Media - Erweitert um Video Generation
  imageUrl: {
    type: String,
    default: '/api/placeholder/400/300'
  },

  videoDemo: {
    type: String,
    default: '/api/placeholder/video'
  },

  // NEW: Video Generation Fields
  videoGenerationStatus: {
    type: String,
    enum: ['none', 'queued', 'processing', 'completed', 'failed'],
    default: 'none'
  },

  videoGenerationJobId: {
    type: String,
    sparse: true // Index only non-null values
  },

  videoGenerationService: {
    type: String,
    enum: ['3d_avatar', 'runway', 'pika', 'manual_upload'],
    default: '3d_avatar'
  },

  videoGenerationStarted: {
    type: Date
  },

  videoGenerationCompleted: {
    type: Date
  },

  videoGenerationError: {
    type: String
  },

  videoGenerationAttempts: {
    type: Number,
    default: 0,
    max: 3 // Limit retry attempts
  },

  videoGenerationCost: {
    type: Number,
    default: 0 // Track costs for analytics
  },

  videoGenerationPrompt: {
    type: String // Store the prompt used for generation
  },

  videoSpecs: {
    duration: {
      type: Number,
      default: 6 // seconds
    },
    resolution: {
      type: String,
      default: '1280x720'
    },
    fps: {
      type: Number,
      default: 30
    },
    loop: {
      type: Boolean,
      default: true
    },
    fileSize: Number, // bytes
    format: {
      type: String,
      default: 'mp4'
    }
  },

  // AI Generation Metadata
  aiGenerationMetadata: {
    muscleGroupScore: Number,
    categoryScore: Number,
    difficultyScore: Number,
    qualityScore: Number,
    lastUpdated: Date
  },

  // Alle anderen bestehenden Felder...
  loadType: {
    type: String,
    enum: ['Free Weight', 'Machine Weight', 'Bodyweight', 'Resistance', 'Variable', 'No Load']
  },

  executionMode: {
    type: String,
    enum: ['Concentric', 'Eccentric', 'Isometric', 'Plyometric', 'Ballistic', 'Complex']
  },

  repRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },

  setScheme: {
    type: String,
    enum: [
      'Standard Sets', 'Super Sets', 'Giant Sets', 'Drop Sets',
      'Pyramid', 'Reverse Pyramid', 'EMOM', 'AMRAP', 'For Time'
    ]
  },

  restTime: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },

  timeUnderTension: {
    pattern: {
      type: String,
      enum: ['2-0-2-0', '3-0-1-0', '3-1-3-1', '4-0-1-0', '5-0-1-0', 'Custom']
    },
    total: { type: Number, min: 0 }
  },

  velocityTracking: {
    required: {
      type: String,
      enum: ['Required', 'Optional', 'Not Applicable']
    },
    target: { type: Number, min: 0 }
  },

  barPathTracking: {
    type: String,
    enum: ['Required', 'Optional', 'Not Applicable']
  },

  primaryPurpose: {
    type: String,
    enum: [
      'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Mobility',
      'Stability', 'Conditioning', 'Skill Development'
    ]
  },

  progressionType: {
    type: String,
    enum: [
      'Linear Weight', 'Rep Progression', 'Density (more work in same time)',
      'Volume (sets x reps)', 'Technique Focus', 'Velocity Based', 'Relative Intensity'
    ]
  },

  sports: [{
    type: String,
    enum: [
      'Powerlifting', 'Weightlifting', 'Bodybuilding', 'CrossFit', 'HYROX',
      'Functional Fitness', 'General Strength', 'Sports Performance',
      'Football', 'Soccer', 'Basketball', 'Tennis', 'Swimming', 'Running',
      'Cycling', 'Triathlon', 'Hockey', 'Baseball', 'Volleyball', 'Golf',
      'MMA', 'Boxing', 'Gymnastics', 'Athletics', 'Rugby', 'Handball',
      'Skiing', 'Snowboarding', 'Climbing', 'Rowing', 'Paddling'
    ]
  }],

  sportsRelevance: {
    type: Map,
    of: Number
  },

  sportSpecificAttributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  accessoryPairing: {
    type: String
  },

  conditioningComponent: {
    type: Boolean,
    default: false
  },

  competitionStandard: {
    type: Boolean,
    default: false
  },

  workoutDuration: { type: Number, min: 0 },

  tabataTimer: {
    work: { type: Number, min: 0 },
    rest: { type: Number, min: 0 }
  },

  distance: {
    value: { type: Number, min: 0 },
    units: {
      type: String,
      enum: ['m', 'km', 'ft', 'mi', 'reps', 'cal']
    }
  },

  rounds: { type: Number, min: 0 },

  tags: [{
    type: String,
    trim: true
  }],

  notes: {
    type: String
  },

  clientAdjustments: {
    type: String
  },

  approved: {
    type: Boolean,
    default: false
  },

  approvedBy: {
    type: String
  },

  approvedAt: {
    type: Date
  },

  discussions: [discussionSchema],

  createdBy: {
    type: String,
    default: 'System'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  usageCount: {
    type: Number,
    default: 0
  },

  lastUsed: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Erweiterte Indexes
exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ muscleGroup: 1, category: 1 });
exerciseSchema.index({ approved: 1 });
exerciseSchema.index({ createdAt: -1 });
exerciseSchema.index({ usageCount: -1 });
// NEW: Video generation indexes
exerciseSchema.index({ videoGenerationStatus: 1 });
exerciseSchema.index({ videoGenerationJobId: 1 }, { sparse: true });
exerciseSchema.index({ videoDemo: 1 });

// Virtuals (erweitert)
exerciseSchema.virtual('discussionCount').get(function() {
  return this.discussions ? this.discussions.length : 0;
});

exerciseSchema.virtual('repRangeFormatted').get(function() {
  if (this.repRange && this.repRange.min && this.repRange.max) {
    return `${this.repRange.min}-${this.repRange.max}`;
  }
  return null;
});

exerciseSchema.virtual('restTimeFormatted').get(function() {
  if (this.restTime && this.restTime.min && this.restTime.max) {
    return `${this.restTime.min}-${this.restTime.max} sec`;
  }
  return null;
});

// NEW: Video-related virtuals
exerciseSchema.virtual('hasVideo').get(function() {
  return this.videoDemo &&
         this.videoDemo !== '/api/placeholder/video' &&
         this.videoDemo !== '';
});

exerciseSchema.virtual('needsVideo').get(function() {
  return !this.hasVideo && this.approved;
});

exerciseSchema.virtual('videoGenerationDuration').get(function() {
  if (this.videoGenerationStarted && this.videoGenerationCompleted) {
    return Math.round((this.videoGenerationCompleted - this.videoGenerationStarted) / 1000);
  }
  return null;
});

// Pre-save middleware
exerciseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods (erweitert)
exerciseSchema.statics.findByMuscleGroup = function(muscleGroup) {
  return this.find({ muscleGroup: muscleGroup, approved: true });
};

exerciseSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, approved: true });
};

exerciseSchema.statics.searchByName = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    approved: true
  }).sort({ score: { $meta: 'textScore' } });
};

exerciseSchema.statics.getApprovedCount = function() {
  return this.countDocuments({ approved: true });
};

exerciseSchema.statics.getTotalCount = function() {
  return this.countDocuments({});
};

// NEW: Video generation static methods
exerciseSchema.statics.getPendingVideoGeneration = function(limit = 50) {
  return this.find({
    approved: true,
    $or: [
      { videoDemo: { $exists: false } },
      { videoDemo: '/api/placeholder/video' },
      { videoDemo: '' },
      { videoDemo: null }
    ],
    videoGenerationStatus: { $ne: 'processing' }
  }).sort({ usageCount: -1, createdAt: -1 }).limit(limit);
};

exerciseSchema.statics.getVideoGenerationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$videoGenerationStatus',
        count: { $sum: 1 },
        avgCost: { $avg: '$videoGenerationCost' },
        totalCost: { $sum: '$videoGenerationCost' }
      }
    }
  ]);
};

exerciseSchema.statics.getExercisesWithVideos = function() {
  return this.find({
    videoDemo: {
      $exists: true,
      $ne: '/api/placeholder/video',
      $ne: '',
      $ne: null
    },
    approved: true
  });
};

// Instance methods (erweitert)
exerciseSchema.methods.addDiscussion = function(user, text, isCoach = false) {
  this.discussions.push({
    user: user,
    text: text,
    isCoach: isCoach,
    date: new Date()
  });
  return this.save();
};

exerciseSchema.methods.approve = function(approvedBy) {
  this.approved = true;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

exerciseSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// NEW: Video generation instance methods
exerciseSchema.methods.startVideoGeneration = function(jobId, service = '3d_avatar', prompt = '') {
  this.videoGenerationJobId = jobId;
  this.videoGenerationStatus = 'processing';
  this.videoGenerationService = service;
  this.videoGenerationStarted = new Date();
  this.videoGenerationPrompt = prompt;
  this.videoGenerationAttempts += 1;
  return this.save();
};

exerciseSchema.methods.completeVideoGeneration = function(videoUrl, cost = 0) {
  this.videoDemo = videoUrl;
  this.videoGenerationStatus = 'completed';
  this.videoGenerationCompleted = new Date();
  this.videoGenerationCost = cost;
  return this.save();
};

exerciseSchema.methods.failVideoGeneration = function(error) {
  this.videoGenerationStatus = 'failed';
  this.videoGenerationError = error;
  return this.save();
};

exerciseSchema.methods.canRetryVideoGeneration = function() {
  return this.videoGenerationAttempts < 3 &&
         this.videoGenerationStatus === 'failed';
};

exerciseSchema.methods.resetVideoGeneration = function() {
  this.videoGenerationStatus = 'none';
  this.videoGenerationJobId = undefined;
  this.videoGenerationError = undefined;
  this.videoGenerationStarted = undefined;
  this.videoGenerationCompleted = undefined;
  return this.save();
};

module.exports = mongoose.model('Exercise', exerciseSchema);