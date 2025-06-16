// server/routes/megaDiscoveryRoutes.js
// 🚀 MEGA DISCOVERY API ROUTES - Complete Backend API für Exercise Discovery System
// RESTful API endpoints für 50,000+ Exercise Discovery mit MongoDB Integration

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { MegaDiscoveryEngine } = require('../services/megaDiscoveryEngine');

const router = express.Router();

// =====================================================
// INITIALIZATION & MIDDLEWARE
// =====================================================

// Initialize MEGA Discovery Engine (singleton)
let discoveryEngine;

const initializeEngine = async () => {
  if (!discoveryEngine) {
    try {
      discoveryEngine = new MegaDiscoveryEngine();
      await discoveryEngine.init();
      console.log('✅ MEGA Discovery Engine initialized for API routes');
    } catch (error) {
      console.error('❌ Failed to initialize MEGA Discovery Engine:', error);
      throw error;
    }
  }
  return discoveryEngine;
};

// Middleware to ensure engine is initialized
const ensureEngineInitialized = async (req, res, next) => {
  try {
    if (!discoveryEngine) {
      await initializeEngine();
    }
    req.discoveryEngine = discoveryEngine;
    next();
  } catch (error) {
    console.error('Engine initialization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Discovery engine initialization failed',
      details: error.message
    });
  }
};

// Rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, error: message },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limits
const generalLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests, please try again later'); // 100 per 15min
const sessionLimit = createRateLimit(60 * 60 * 1000, 10, 'Too many session creation attempts'); // 10 per hour
const approvalLimit = createRateLimit(60 * 60 * 1000, 500, 'Too many approval requests'); // 500 per hour

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// =====================================================
// SESSION MANAGEMENT ENDPOINTS
// =====================================================

/**
 * POST /api/mega-discovery/start
 * Create and start a new discovery session
 */
router.post('/start',
  sessionLimit,
  ensureEngineInitialized,
  [
    body('sessionType')
      .isIn(['test_run', 'sport_specific', 'full_discovery', 'taxonomy_expansion', 'quality_review'])
      .withMessage('Invalid session type'),
    body('batchSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Batch size must be between 1 and 100'),
    body('maxExercisesPerTerm')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Max exercises per term must be between 1 and 10'),
    body('includeVideoSearch')
      .optional()
      .isBoolean()
      .withMessage('Include video search must be boolean'),
    body('testMode')
      .optional()
      .isBoolean()
      .withMessage('Test mode must be boolean'),
    body('sportFilter')
      .optional()
      .isString()
      .isLength({ min: 2, max: 50 })
      .withMessage('Sport filter must be a valid string'),
    body('fitnessComponentFilter')
      .optional()
      .isString()
      .withMessage('Fitness component filter must be a string'),
    body('priorityOnly')
      .optional()
      .isBoolean()
      .withMessage('Priority only must be boolean'),
    body('qualityThreshold')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Quality threshold must be between 0 and 100')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log(`🚀 Starting new discovery session: ${req.body.sessionType}`);

      // Create session
      const sessionResult = await req.discoveryEngine.createSession(req.body);

      if (!sessionResult.success) {
        return res.status(400).json(sessionResult);
      }

      // Start session processing
      const startResult = await req.discoveryEngine.startSession(sessionResult.sessionId);

      if (!startResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to start session processing',
          details: startResult.error
        });
      }

      // Return session info
      res.status(201).json({
        success: true,
        message: 'Discovery session started successfully',
        sessionId: sessionResult.sessionId,
        config: sessionResult.config,
        estimatedDuration: sessionResult.estimatedDuration,
        searchTermsCount: sessionResult.searchTermsCount,
        batchCount: sessionResult.batchCount
      });

    } catch (error) {
      console.error('Error starting discovery session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start discovery session',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/mega-discovery/status/:sessionId
 * Get status of a discovery session
 */
router.get('/status/:sessionId',
  generalLimit,
  ensureEngineInitialized,
  [
    param('sessionId')
      .isUUID()
      .withMessage('Session ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      const statusResult = await req.discoveryEngine.getSessionStatus(sessionId);

      if (!statusResult.success) {
        return res.status(404).json(statusResult);
      }

      res.json(statusResult);

    } catch (error) {
      console.error(`Error getting session status ${req.params.sessionId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session status',
        details: error.message
      });
    }
  }
);

/**
 * POST /api/mega-discovery/stop/:sessionId
 * Stop a running discovery session
 */
router.post('/stop/:sessionId',
  generalLimit,
  ensureEngineInitialized,
  [
    param('sessionId')
      .isUUID()
      .withMessage('Session ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Find and update session
      const session = await req.discoveryEngine.DiscoverySession.findOne({ sessionId });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (session.status !== 'running') {
        return res.status(400).json({
          success: false,
          error: `Cannot stop session in ${session.status} state`
        });
      }

      // Update session status
      session.status = 'cancelled';
      session.completedAt = new Date();
      await session.save();

      // Remove from active sessions
      req.discoveryEngine.activeSessions.delete(sessionId);

      console.log(`⏹️ Stopped session ${sessionId}`);

      res.json({
        success: true,
        message: 'Session stopped successfully',
        sessionId
      });

    } catch (error) {
      console.error(`Error stopping session ${req.params.sessionId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop session',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/mega-discovery/sessions
 * Get list of all sessions with pagination
 */
router.get('/sessions',
  generalLimit,
  ensureEngineInitialized,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['created', 'running', 'paused', 'completed', 'failed', 'cancelled'])
      .withMessage('Invalid status filter'),
    query('sessionType')
      .optional()
      .isString()
      .withMessage('Session type must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Build query
      const query = {};
      if (req.query.status) query.status = req.query.status;
      if (req.query.sessionType) query.sessionType = req.query.sessionType;

      // Get sessions with pagination
      const sessions = await req.discoveryEngine.DiscoverySession
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .select('-searchTermsQueue -errors') // Exclude large fields
        .lean();

      const total = await req.discoveryEngine.DiscoverySession.countDocuments(query);

      res.json({
        success: true,
        sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sessions',
        details: error.message
      });
    }
  }
);

// =====================================================
// EXERCISE MANAGEMENT ENDPOINTS
// =====================================================

/**
 * GET /api/mega-discovery/exercises
 * Get discovered exercises with advanced filtering
 */
router.get('/exercises',
  generalLimit,
  ensureEngineInitialized,
  [
    query('sessionId')
      .optional()
      .isUUID()
      .withMessage('Session ID must be a valid UUID'),
    query('sportId')
      .optional()
      .isString()
      .isLength({ min: 2, max: 50 })
      .withMessage('Sport ID must be a valid string'),
    query('category')
      .optional()
      .isIn(['strength', 'power', 'endurance', 'balance', 'mobility', 'sport_specific'])
      .withMessage('Invalid category'),
    query('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'elite'])
      .withMessage('Invalid difficulty'),
    query('status')
      .optional()
      .isIn(['discovered', 'pending_review', 'approved', 'rejected', 'needs_improvement'])
      .withMessage('Invalid status'),
    query('minQuality')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Min quality must be between 0 and 100'),
    query('maxQuality')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Max quality must be between 0 and 100'),
    query('equipment')
      .optional()
      .isString()
      .withMessage('Equipment must be a string'),
    query('muscleGroup')
      .optional()
      .isString()
      .withMessage('Muscle group must be a string'),
    query('taxonomyFamily')
      .optional()
      .isString()
      .withMessage('Taxonomy family must be a string'),
    query('hasVideo')
      .optional()
      .isBoolean()
      .withMessage('Has video must be boolean'),
    query('search')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['qualityScore', 'discoveredAt', 'name', 'relevanceScore'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const filters = {
        sessionId: req.query.sessionId,
        sportId: req.query.sportId,
        category: req.query.category,
        difficulty: req.query.difficulty,
        status: req.query.status,
        minQuality: req.query.minQuality ? parseInt(req.query.minQuality) : null,
        maxQuality: req.query.maxQuality ? parseInt(req.query.maxQuality) : null,
        equipment: req.query.equipment,
        muscleGroup: req.query.muscleGroup,
        taxonomyFamily: req.query.taxonomyFamily,
        hasVideo: req.query.hasVideo === 'true',
        search: req.query.search,
        limit: parseInt(req.query.limit) || 50,
        offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 50),
        sortBy: req.query.sortBy || 'qualityScore',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await req.discoveryEngine.getExercises(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('Error getting exercises:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get exercises',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/mega-discovery/exercises/:exerciseId
 * Get detailed information about a specific exercise
 */
router.get('/exercises/:exerciseId',
  generalLimit,
  ensureEngineInitialized,
  [
    param('exerciseId')
      .isString()
      .isLength({ min: 10, max: 100 })
      .withMessage('Exercise ID must be a valid string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { exerciseId } = req.params;

      const exercise = await req.discoveryEngine.DiscoveredExercise
        .findOne({ exerciseId })
        .lean();

      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found'
        });
      }

      // Update view count
      await req.discoveryEngine.DiscoveredExercise.updateOne(
        { exerciseId },
        {
          $inc: { viewCount: 1 },
          $set: { lastAccessed: new Date() }
        }
      );

      res.json({
        success: true,
        exercise
      });

    } catch (error) {
      console.error(`Error getting exercise ${req.params.exerciseId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get exercise',
        details: error.message
      });
    }
  }
);

/**
 * PUT /api/mega-discovery/exercises/:exerciseId/approve
 * Approve or reject an exercise
 */
router.put('/exercises/:exerciseId/approve',
  approvalLimit,
  ensureEngineInitialized,
  [
    param('exerciseId')
      .isString()
      .isLength({ min: 10, max: 100 })
      .withMessage('Exercise ID must be a valid string'),
    body('approved')
      .isBoolean()
      .withMessage('Approved must be boolean'),
    body('rejectionReason')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Rejection reason must be a string with max 500 characters'),
    body('approvedBy')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Approved by must be a string with max 100 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const { approved, rejectionReason, approvedBy } = req.body;

      const result = await req.discoveryEngine.approveExercise(exerciseId, approved);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Update additional fields if provided
      const updateFields = {};
      if (rejectionReason && !approved) {
        updateFields.rejectionReason = rejectionReason;
      }
      if (approvedBy) {
        updateFields.approvedBy = approvedBy;
      }

      if (Object.keys(updateFields).length > 0) {
        await req.discoveryEngine.DiscoveredExercise.updateOne(
          { exerciseId },
          { $set: updateFields }
        );
      }

      console.log(`${approved ? '✅ Approved' : '❌ Rejected'} exercise: ${exerciseId}`);

      res.json({
        success: true,
        message: result.message,
        exerciseId,
        approved
      });

    } catch (error) {
      console.error(`Error approving exercise ${req.params.exerciseId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve exercise',
        details: error.message
      });
    }
  }
);

/**
 * PUT /api/mega-discovery/exercises/:exerciseId
 * Update exercise details
 */
router.put('/exercises/:exerciseId',
  generalLimit,
  ensureEngineInitialized,
  [
    param('exerciseId')
      .isString()
      .isLength({ min: 10, max: 100 })
      .withMessage('Exercise ID must be a valid string'),
    body('name')
      .optional()
      .isString()
      .isLength({ min: 3, max: 200 })
      .withMessage('Name must be between 3 and 200 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'elite'])
      .withMessage('Invalid difficulty'),
    body('equipment')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Equipment must be max 200 characters'),
    body('instructions')
      .optional()
      .isArray()
      .withMessage('Instructions must be an array'),
    body('benefits')
      .optional()
      .isArray()
      .withMessage('Benefits must be an array'),
    body('safetyNotes')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Safety notes must be max 1000 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const updateFields = req.body;

      // Remove empty/undefined fields
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined || updateFields[key] === '') {
          delete updateFields[key];
        }
      });

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid update fields provided'
        });
      }

      const result = await req.discoveryEngine.DiscoveredExercise.updateOne(
        { exerciseId },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found'
        });
      }

      res.json({
        success: true,
        message: 'Exercise updated successfully',
        exerciseId,
        updatedFields: Object.keys(updateFields)
      });

    } catch (error) {
      console.error(`Error updating exercise ${req.params.exerciseId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update exercise',
        details: error.message
      });
    }
  }
);

/**
 * DELETE /api/mega-discovery/exercises/:exerciseId
 * Delete an exercise
 */
router.delete('/exercises/:exerciseId',
  generalLimit,
  ensureEngineInitialized,
  [
    param('exerciseId')
      .isString()
      .isLength({ min: 10, max: 100 })
      .withMessage('Exercise ID must be a valid string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { exerciseId } = req.params;

      const result = await req.discoveryEngine.DiscoveredExercise.deleteOne({ exerciseId });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found'
        });
      }

      console.log(`🗑️ Deleted exercise: ${exerciseId}`);

      res.json({
        success: true,
        message: 'Exercise deleted successfully',
        exerciseId
      });

    } catch (error) {
      console.error(`Error deleting exercise ${req.params.exerciseId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete exercise',
        details: error.message
      });
    }
  }
);

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * POST /api/mega-discovery/exercises/batch-approve
 * Approve/reject multiple exercises at once
 */
router.post('/exercises/batch-approve',
  approvalLimit,
  ensureEngineInitialized,
  [
    body('exerciseIds')
      .isArray({ min: 1, max: 100 })
      .withMessage('Exercise IDs must be an array with 1-100 items'),
    body('exerciseIds.*')
      .isString()
      .withMessage('Each exercise ID must be a string'),
    body('approved')
      .isBoolean()
      .withMessage('Approved must be boolean'),
    body('approvedBy')
      .optional()
      .isString()
      .withMessage('Approved by must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { exerciseIds, approved, approvedBy } = req.body;

      const updateFields = {
        status: approved ? 'approved' : 'rejected',
        approvedAt: approved ? new Date() : null
      };

      if (approvedBy) {
        updateFields.approvedBy = approvedBy;
      }

      const result = await req.discoveryEngine.DiscoveredExercise.updateMany(
        { exerciseId: { $in: exerciseIds } },
        { $set: updateFields }
      );

      console.log(`📦 Batch ${approved ? 'approved' : 'rejected'} ${result.modifiedCount} exercises`);

      res.json({
        success: true,
        message: `Batch operation completed successfully`,
        processed: result.modifiedCount,
        total: exerciseIds.length,
        approved
      });

    } catch (error) {
      console.error('Error in batch approval:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process batch approval',
        details: error.message
      });
    }
  }
);

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * GET /api/mega-discovery/stats
 * Get comprehensive system statistics
 */
router.get('/stats',
  generalLimit,
  ensureEngineInitialized,
  async (req, res) => {
    try {
      const systemStats = req.discoveryEngine.getSystemStats();

      // Get additional database statistics
      const dbStats = await Promise.all([
        req.discoveryEngine.DiscoverySession.countDocuments(),
        req.discoveryEngine.DiscoverySession.countDocuments({ status: 'completed' }),
        req.discoveryEngine.DiscoveredExercise.countDocuments(),
        req.discoveryEngine.DiscoveredExercise.countDocuments({ status: 'approved' }),
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $group: { _id: null, avgQuality: { $avg: '$qualityScore' } } }
        ]),
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $group: { _id: '$taxonomyFamily', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $unwind: '$relevantSports' },
          { $group: { _id: '$relevantSports.sportId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      const [
        totalSessions,
        completedSessions,
        totalExercises,
        approvedExercises,
        qualityStats,
        taxonomyStats,
        sportStats
      ] = dbStats;

      res.json({
        success: true,
        stats: {
          ...systemStats.stats,
          database: {
            totalSessions,
            completedSessions,
            totalExercises,
            approvedExercises,
            averageQuality: qualityStats[0]?.avgQuality || 0,
            topTaxonomyFamilies: taxonomyStats,
            topSports: sportStats
          }
        }
      });

    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/mega-discovery/stats/sport/:sportId
 * Get sport-specific statistics
 */
router.get('/stats/sport/:sportId',
  generalLimit,
  ensureEngineInitialized,
  [
    param('sportId')
      .isString()
      .isLength({ min: 2, max: 50 })
      .withMessage('Sport ID must be a valid string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sportId } = req.params;

      const sportStats = await Promise.all([
        // Total exercises for this sport
        req.discoveryEngine.DiscoveredExercise.countDocuments({
          'relevantSports.sportId': sportId
        }),

        // Approved exercises for this sport
        req.discoveryEngine.DiscoveredExercise.countDocuments({
          'relevantSports.sportId': sportId,
          status: 'approved'
        }),

        // Average quality for this sport
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $match: { 'relevantSports.sportId': sportId } },
          { $group: { _id: null, avgQuality: { $avg: '$qualityScore' } } }
        ]),

        // Category distribution
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $match: { 'relevantSports.sportId': sportId } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Difficulty distribution
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $match: { 'relevantSports.sportId': sportId } },
          { $group: { _id: '$difficulty', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Top muscle groups
        req.discoveryEngine.DiscoveredExercise.aggregate([
          { $match: { 'relevantSports.sportId': sportId } },
          { $group: { _id: '$primaryMuscleGroup', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      const [
        totalExercises,
        approvedExercises,
        qualityStats,
        categoryStats,
        difficultyStats,
        muscleGroupStats
      ] = sportStats;

      res.json({
        success: true,
        sportId,
        stats: {
          totalExercises,
          approvedExercises,
          averageQuality: qualityStats[0]?.avgQuality || 0,
          categoryDistribution: categoryStats,
          difficultyDistribution: difficultyStats,
          topMuscleGroups: muscleGroupStats
        }
      });

    } catch (error) {
      console.error(`Error getting sport stats for ${req.params.sportId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sport statistics',
        details: error.message
      });
    }
  }
);

// =====================================================
// HEALTH CHECK & SYSTEM INFO
// =====================================================

/**
 * GET /api/mega-discovery/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'MEGA Discovery Engine'
    };

    // Check engine status
    if (discoveryEngine) {
      health.engine = {
        initialized: discoveryEngine.isInitialized,
        activeSessions: discoveryEngine.activeSessions.size,
        processingQueue: discoveryEngine.processingQueue.length
      };
    } else {
      health.engine = {
        initialized: false,
        status: 'not_initialized'
      };
    }

    // Check database connection
    try {
      await req.discoveryEngine.DiscoverySession.findOne().limit(1);
      health.database = { status: 'connected' };
    } catch (dbError) {
      health.database = { status: 'disconnected', error: dbError.message };
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /api/mega-discovery/info
 * Get system information and capabilities
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    service: 'MEGA Discovery Engine API',
    version: '1.0.0',
    description: 'RESTful API for discovering and managing 50,000+ exercises across 200+ sports',
    capabilities: {
      sessionManagement: true,
      exerciseDiscovery: true,
      aiIntegration: true,
      videoSearch: true,
      qualityControl: true,
      sportSpecificFiltering: true,
      batchOperations: true,
      statistics: true,
      realTimeProgress: true
    },
    endpoints: {
      sessions: {
        'POST /start': 'Create and start discovery session',
        'GET /status/:id': 'Get session status',
        'POST /stop/:id': 'Stop session',
        'GET /sessions': 'List all sessions'
      },
      exercises: {
        'GET /exercises': 'Get exercises with filtering',
        'GET /exercises/:id': 'Get specific exercise',
        'PUT /exercises/:id/approve': 'Approve/reject exercise',
        'PUT /exercises/:id': 'Update exercise',
        'DELETE /exercises/:id': 'Delete exercise',
        'POST /exercises/batch-approve': 'Batch approval'
      },
      statistics: {
        'GET /stats': 'System statistics',
        'GET /stats/sport/:id': 'Sport-specific statistics'
      },
      system: {
        'GET /health': 'Health check',
        'GET /info': 'System information'
      }
    },
    rateLimits: {
      general: '100 requests per 15 minutes',
      sessions: '10 requests per hour',
      approvals: '500 requests per hour'
    }
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// Global error handler for this router
router.use((error, req, res, next) => {
  console.error('MEGA Discovery API Error:', error);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred in the MEGA Discovery API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for this router
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'POST /api/mega-discovery/start',
      'GET /api/mega-discovery/status/:sessionId',
      'GET /api/mega-discovery/exercises',
      'GET /api/mega-discovery/stats',
      'GET /api/mega-discovery/health'
    ]
  });
});

// =====================================================
// INITIALIZATION & EXPORT
// =====================================================

// Initialize engine when module is loaded
(async () => {
  try {
    await initializeEngine();
    console.log('🚀 MEGA Discovery API Routes initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MEGA Discovery API Routes:', error);
  }
})();

module.exports = router;