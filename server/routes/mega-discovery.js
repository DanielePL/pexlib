// server/routes/mega-discovery.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// MEGA Exercise Schema
const MegaExerciseSchema = new mongoose.Schema({
  // Basic Exercise Info
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },

  // Categorization
  category: {
    type: String,
    enum: ['strength', 'endurance', 'balance', 'mobility'],
    required: true,
    index: true
  },
  primaryMuscleGroup: { type: String, required: true, index: true },
  secondaryMuscles: [String],

  // Exercise Details
  equipment: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },

  // Detailed Instructions
  instructions: [String],
  keyCoachingCues: [String],
  commonMistakes: [String],
  progressions: {
    easier: String,
    harder: String
  },
  specificBenefits: [String],
  whenToUse: String,
  setRepGuidelines: String,
  scientificRationale: String,

  // AI Discovery Metadata
  discoveryMethod: {
    type: String,
    enum: ['manual', 'ai_scout', 'mega_ai', 'fallback'],
    default: 'mega_ai',
    index: true
  },
  originalSearchTerm: { type: String, index: true },
  searchId: { type: String, unique: true, index: true },
  qualityScore: { type: Number, min: 0, max: 100, index: true },

  // Sports Relevance
  relevantSports: [{
    sportId: String,
    sportName: String,
    relevanceScore: Number
  }],

  // Video Integration
  videoUrl: String,
  videoSearchTerm: String,
  videoType: {
    type: String,
    enum: ['real', 'fallback', 'none'],
    default: 'none'
  },
  videoFoundAt: Date,

  // Status
  approved: { type: Boolean, default: false, index: true },
  processed: { type: Boolean, default: false, index: true },
  needsVideoSearch: { type: Boolean, default: true },
  isFallback: { type: Boolean, default: false },

  // Timestamps
  discoveredAt: { type: Date, default: Date.now, index: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'exercises_mega'
});

// Discovery Session Schema
const DiscoverySessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  sessionType: {
    type: String,
    enum: ['test_run', 'full_discovery', 'sport_specific'],
    required: true
  },

  // Session Configuration
  config: {
    batchSize: Number,
    maxExercisesPerTerm: Number,
    includeVideoSearch: Boolean,
    testMode: Boolean
  },

  // Session Progress
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'cancelled'],
    default: 'running'
  },
  progress: {
    currentBatch: Number,
    totalBatches: Number,
    exercisesFound: Number,
    videosFound: Number,
    errorsCount: Number
  },

  // Session Results
  results: {
    totalExercises: Number,
    totalWithVideos: Number,
    averageQuality: Number,
    duration: Number,
    estimatedCost: Number
  },

  // Timestamps
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,

  // Errors & Logs
  errors: [{
    term: String,
    error: String,
    timestamp: Date
  }]
}, {
  timestamps: true,
  collection: 'discovery_sessions'
});

// Create models function (will be called with MEGA connection)
let MegaExercise, DiscoverySession;

const initializeMegaModels = (connection) => {
  MegaExercise = connection.model('MegaExercise', MegaExerciseSchema);
  DiscoverySession = connection.model('DiscoverySession', DiscoverySessionSchema);
  return { MegaExercise, DiscoverySession };
};

// Middleware to check MEGA connection
const requireMegaConnection = (req, res, next) => {
  if (!req.app.locals.megaConnection) {
    return res.status(503).json({
      success: false,
      error: 'MEGA Database not available'
    });
  }

  if (!MegaExercise) {
    const models = initializeMegaModels(req.app.locals.megaConnection);
    MegaExercise = models.MegaExercise;
    DiscoverySession = models.DiscoverySession;
  }

  next();
};

// ============================================
// MEGA DISCOVERY ROUTES
// ============================================

// Start MEGA Discovery
router.post('/start', requireMegaConnection, async (req, res) => {
  try {
    const {
      sessionType = 'test_run',
      batchSize = 5,
      maxExercisesPerTerm = 3,
      includeVideoSearch = false,
      testMode = true
    } = req.body;

    console.log('🚀 Starting MEGA Discovery session');
    console.log('Config:', { sessionType, batchSize, maxExercisesPerTerm, testMode });

    // Create discovery session
    const sessionId = `mega_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = new DiscoverySession({
      sessionId,
      sessionType,
      config: {
        batchSize,
        maxExercisesPerTerm,
        includeVideoSearch,
        testMode
      },
      status: 'running',
      progress: {
        currentBatch: 0,
        totalBatches: 0,
        exercisesFound: 0,
        videosFound: 0,
        errorsCount: 0
      }
    });

    await session.save();

    // Return session info immediately, processing will happen in background
    res.json({
      success: true,
      sessionId,
      message: 'MEGA Discovery session started',
      config: session.config,
      estimatedDuration: testMode ? '2-5 minutes' : '30-60 minutes'
    });

    // Start background processing (don't await)
    processMegaDiscovery(sessionId, session.config).catch(error => {
      console.error('Background MEGA Discovery failed:', error);
    });

  } catch (error) {
    console.error('MEGA Discovery start failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get MEGA Discovery Status
router.get('/status/:sessionId', requireMegaConnection, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await DiscoverySession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        progress: session.progress,
        results: session.results,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        duration: session.completedAt ?
          Math.round((session.completedAt - session.startedAt) / 1000) :
          Math.round((new Date() - session.startedAt) / 1000)
      }
    });

  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get MEGA Exercises
router.get('/exercises', requireMegaConnection, async (req, res) => {
  try {
    const {
      category,
      difficulty,
      primaryMuscleGroup,
      approved,
      limit = 50,
      page = 1,
      sortBy = 'qualityScore',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (primaryMuscleGroup) query.primaryMuscleGroup = primaryMuscleGroup;
    if (approved !== undefined) query.approved = approved === 'true';

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const exercises = await MegaExercise
      .find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await MegaExercise.countDocuments(query);

    res.json({
      success: true,
      exercises,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get MEGA exercises failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve MEGA Exercise
router.put('/exercises/:id/approve', requireMegaConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const exercise = await MegaExercise.findByIdAndUpdate(
      id,
      {
        approved,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
    }

    res.json({
      success: true,
      exercise
    });

  } catch (error) {
    console.error('Approve exercise failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get MEGA Stats
router.get('/stats', requireMegaConnection, async (req, res) => {
  try {
    const stats = {
      totalExercises: await MegaExercise.countDocuments(),
      approved: await MegaExercise.countDocuments({ approved: true }),
      withVideos: await MegaExercise.countDocuments({
        videoUrl: { $exists: true, $ne: null }
      }),

      // By Category
      byCategory: await MegaExercise.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // By Difficulty
      byDifficulty: await MegaExercise.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Quality Distribution
      qualityDistribution: await MegaExercise.aggregate([
        {
          $bucket: {
            groupBy: '$qualityScore',
            boundaries: [0, 50, 70, 85, 95, 100],
            default: 'unknown',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // Recent Sessions
      recentSessions: await DiscoverySession
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('sessionId status results startedAt completedAt')
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Stats failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// BACKGROUND PROCESSING FUNCTION
// ============================================
async function processMegaDiscovery(sessionId, config) {
  try {
    console.log(`🔄 Background processing started for session: ${sessionId}`);

    // Mock processing for now - replace with actual MegaAIScout logic
    const session = await DiscoverySession.findOne({ sessionId });
    if (!session) throw new Error('Session not found');

    // Simulate batches
    const totalBatches = config.testMode ? 3 : 10;

    for (let batch = 1; batch <= totalBatches; batch++) {
      // Update progress
      await DiscoverySession.updateOne(
        { sessionId },
        {
          $set: {
            'progress.currentBatch': batch,
            'progress.totalBatches': totalBatches
          }
        }
      );

      // Simulate exercise discovery
      const mockExercises = generateMockExercises(config.maxExercisesPerTerm, batch);

      // Save exercises to MEGA database
      for (const exercise of mockExercises) {
        const megaExercise = new MegaExercise({
          ...exercise,
          searchId: `${sessionId}_${batch}_${exercise.name.replace(/\s+/g, '_')}`,
          discoveredAt: new Date()
        });

        try {
          await megaExercise.save();
        } catch (error) {
          if (error.code !== 11000) { // Ignore duplicate key errors
            console.error('Save exercise error:', error);
          }
        }
      }

      // Update session progress
      const currentExerciseCount = await MegaExercise.countDocuments({
        searchId: { $regex: `^${sessionId}_` }
      });

      await DiscoverySession.updateOne(
        { sessionId },
        {
          $set: {
            'progress.exercisesFound': currentExerciseCount
          }
        }
      );

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Mark session as completed
    const finalExerciseCount = await MegaExercise.countDocuments({
      searchId: { $regex: `^${sessionId}_` }
    });

    const endTime = new Date();
    const startTime = session.startedAt;
    const duration = Math.round((endTime - startTime) / 1000);

    await DiscoverySession.updateOne(
      { sessionId },
      {
        $set: {
          status: 'completed',
          completedAt: endTime,
          'results.totalExercises': finalExerciseCount,
          'results.duration': duration
        }
      }
    );

    console.log(`✅ MEGA Discovery completed for session: ${sessionId}`);
    console.log(`   Exercises found: ${finalExerciseCount}`);
    console.log(`   Duration: ${duration}s`);

  } catch (error) {
    console.error(`❌ MEGA Discovery failed for session: ${sessionId}`, error);

    // Mark session as failed
    await DiscoverySession.updateOne(
      { sessionId },
      {
        $set: {
          status: 'failed',
          completedAt: new Date()
        },
        $push: {
          errors: {
            term: 'system',
            error: error.message,
            timestamp: new Date()
          }
        }
      }
    );
  }
}

// Mock exercise generator for testing
function generateMockExercises(count, batchNumber) {
  const exercises = [];
  const categories = ['strength', 'endurance', 'balance', 'mobility'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const muscleGroup = muscleGroups[Math.floor(Math.random() * muscleGroups.length)];

    exercises.push({
      name: `MEGA ${category.charAt(0).toUpperCase() + category.slice(1)} Exercise B${batchNumber}-${i + 1}`,
      description: `Advanced ${category} exercise targeting ${muscleGroup.toLowerCase()} muscles with progressive overload principles.`,
      category,
      primaryMuscleGroup: muscleGroup,
      secondaryMuscles: [muscleGroups[Math.floor(Math.random() * muscleGroups.length)]],
      equipment: ['Dumbbells', 'Barbell', 'Bodyweight', 'Resistance Bands'][Math.floor(Math.random() * 4)],
      difficulty,
      instructions: [
        'Set up in proper starting position',
        'Engage core and maintain neutral spine',
        'Execute movement with controlled tempo',
        'Return to starting position with control'
      ],
      keyCoachingCues: [
        'Focus on form over speed',
        'Breathe consistently throughout movement',
        'Maintain proper alignment'
      ],
      commonMistakes: [
        'Moving too quickly',
        'Using excessive weight',
        'Poor posture'
      ],
      progressions: {
        easier: 'Reduce range of motion or resistance',
        harder: 'Add resistance or increase complexity'
      },
      specificBenefits: [
        `Enhanced ${muscleGroup.toLowerCase()} strength`,
        'Improved movement quality',
        'Better functional capacity'
      ],
      whenToUse: `During ${category} training phases`,
      setRepGuidelines: difficulty === 'beginner' ? '2-3 sets of 8-12 reps' : '3-4 sets of 6-10 reps',
      scientificRationale: `Targets ${muscleGroup.toLowerCase()} through multi-planar movement patterns`,
      discoveryMethod: 'mega_ai',
      originalSearchTerm: `${category} training ${muscleGroup.toLowerCase()}`,
      qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100 range
      relevantSports: [],
      approved: false,
      processed: false,
      needsVideoSearch: true,
      isFallback: false
    });
  }

  return exercises;
}

module.exports = router;