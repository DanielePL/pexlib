// server/services/megaDiscoveryEngine.js
// 🚀 MEGA DISCOVERY ENGINE - Backend Processing System für 50,000+ Übungen
// Orchestriert die gesamte Exercise Discovery Pipeline mit MongoDB Integration

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// =====================================================
// DISCOVERY SESSION SCHEMA
// =====================================================
const DiscoverySessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ['created', 'running', 'paused', 'completed', 'failed', 'cancelled'],
    default: 'created'
  },
  sessionType: {
    type: String,
    enum: ['test_run', 'sport_specific', 'full_discovery', 'taxonomy_expansion', 'quality_review'],
    required: true
  },

  // Configuration
  config: {
    batchSize: { type: Number, default: 25 },
    maxExercisesPerTerm: { type: Number, default: 3 },
    includeVideoSearch: { type: Boolean, default: false },
    testMode: { type: Boolean, default: true },
    sportFilter: { type: String, default: null },
    fitnessComponentFilter: { type: String, default: null },
    priorityOnly: { type: Boolean, default: false },
    qualityThreshold: { type: Number, default: 75 }
  },

  // Progress Tracking
  progress: {
    totalBatches: { type: Number, default: 0 },
    currentBatch: { type: Number, default: 0 },
    totalSearchTerms: { type: Number, default: 0 },
    processedTerms: { type: Number, default: 0 },
    exercisesFound: { type: Number, default: 0 },
    exercisesProcessed: { type: Number, default: 0 },
    exercisesApproved: { type: Number, default: 0 },
    duplicatesRemoved: { type: Number, default: 0 },
    qualityFiltered: { type: Number, default: 0 },
    videosFound: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 }
  },

  // Results Summary
  results: {
    totalExercises: { type: Number, default: 0 },
    averageQuality: { type: Number, default: 0 },
    sportMappings: { type: Number, default: 0 },
    taxonomieFamilies: { type: Number, default: 0 },
    uniqueVariations: { type: Number, default: 0 },
    processingTime: { type: Number, default: 0 }, // in seconds
    apiCallsUsed: {
      openai: { type: Number, default: 0 },
      youtube: { type: Number, default: 0 }
    }
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastActivity: { type: Date, default: Date.now },

  // Error Tracking
  errors: [{
    timestamp: { type: Date, default: Date.now },
    type: { type: String },
    message: { type: String },
    searchTerm: { type: String },
    stack: { type: String }
  }],

  // Search Terms Queue
  searchTermsQueue: [{
    term: { type: String, required: true },
    priority: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    processedAt: { type: Date },
    exercisesFound: { type: Number, default: 0 },
    processingTime: { type: Number, default: 0 }
  }]
}, {
  timestamps: true,
  collection: 'discovery_sessions'
});

// =====================================================
// DISCOVERED EXERCISE SCHEMA
// =====================================================
const DiscoveredExerciseSchema = new mongoose.Schema({
  // Identity
  exerciseId: { type: String, unique: true, required: true },
  sessionId: { type: String, required: true, index: true },
  originalSearchTerm: { type: String, required: true, index: true },

  // Exercise Details
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['strength', 'power', 'endurance', 'balance', 'mobility', 'sport_specific'],
    required: true,
    index: true
  },

  // Physical Attributes
  primaryMuscleGroup: { type: String, required: true, index: true },
  secondaryMuscleGroups: [{ type: String }],
  equipment: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'elite'],
    required: true,
    index: true
  },

  // Instructions & Guidelines
  instructions: [{ type: String }],
  coachingCues: [{ type: String }],
  commonMistakes: [{ type: String }],
  benefits: [{ type: String }],
  setRepGuidelines: { type: String },
  progressions: [{ type: String }],
  safetyNotes: { type: String },

  // Sport Relevance
  relevantSports: [{
    sportId: { type: String, required: true },
    relevanceScore: { type: Number, min: 1, max: 10, required: true },
    purpose: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    isPrimaryTarget: { type: Boolean, default: false }
  }],

  // Fitness Components
  fitnessComponents: [{
    type: String,
    enum: ['max_strength', 'power', 'hypertrophy', 'strength_endurance',
           'aerobic_endurance', 'anaerobic_capacity', 'balance', 'coordination',
           'agility', 'mobility', 'stability', 'flexibility']
  }],

  // Taxonomie Mapping
  taxonomyFamily: { type: String, index: true },
  variationType: { type: String },
  exercisePurpose: {
    type: String,
    enum: ['competition_lift', 'strength_building', 'muscle_building',
           'power_development', 'accessory_work', 'conditioning',
           'mobility_work', 'prehabilitation', 'rehabilitation']
  },

  // Quality & Discovery Metadata
  qualityScore: { type: Number, min: 0, max: 100, required: true, index: true },
  discoveryMethod: { type: String, required: true },
  discoveredAt: { type: Date, default: Date.now },

  // Video Information
  videoUrl: { type: String },
  videoThumbnail: { type: String },
  videoTitle: { type: String },
  videoChannelTitle: { type: String },
  videoSearchTerm: { type: String },

  // Status & Approval
  status: {
    type: String,
    enum: ['discovered', 'pending_review', 'approved', 'rejected', 'needs_improvement'],
    default: 'discovered',
    index: true
  },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectionReason: { type: String },

  // Duplicate Detection
  similarityKey: { type: String, index: true },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscoveredExercise' },
  isDuplicate: { type: Boolean, default: false, index: true },

  // Usage Statistics
  viewCount: { type: Number, default: 0 },
  addedToLibraryCount: { type: Number, default: 0 },
  lastAccessed: { type: Date }
}, {
  timestamps: true,
  collection: 'discovered_exercises'
});

// Indexes für Performance
DiscoveredExerciseSchema.index({ sessionId: 1, status: 1 });
DiscoveredExerciseSchema.index({ qualityScore: -1, status: 1 });
DiscoveredExerciseSchema.index({ 'relevantSports.sportId': 1, 'relevantSports.relevanceScore': -1 });
DiscoveredExerciseSchema.index({ taxonomyFamily: 1, variationType: 1 });
DiscoveredExerciseSchema.index({ similarityKey: 1 });

// Models
const DiscoverySession = mongoose.model('DiscoverySession', DiscoverySessionSchema);
const DiscoveredExercise = mongoose.model('DiscoveredExercise', DiscoveredExerciseSchema);

// =====================================================
// MEGA DISCOVERY ENGINE CLASS
// =====================================================
class MegaDiscoveryEngine {
  constructor() {
    this.isInitialized = false;
    this.activeSessions = new Map();
    this.processingQueue = [];
    this.isProcessing = false;

    // API Configuration
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;

    // Rate Limiting
    this.rateLimits = {
      openai: {
        requestsPerMinute: 50,
        requestsPerDay: 2000,
        currentMinute: { count: 0, timestamp: Date.now() },
        currentDay: { count: 0, timestamp: Date.now() }
      },
      youtube: {
        requestsPerDay: 10000,
        currentDay: { count: 0, timestamp: Date.now() }
      }
    };

    // Statistics
    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      totalExercisesDiscovered: 0,
      totalApiCalls: { openai: 0, youtube: 0 },
      averageQualityScore: 0,
      uptime: Date.now()
    };

    this.init();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  async init() {
    try {
      console.log('🚀 Initializing MEGA Discovery Engine...');

      // Load active sessions from database
      await this.loadActiveSessions();

      // Initialize taxonomie
      await this.initializeTaxonomie();

      // Start background processing
      this.startBackgroundProcessing();

      // Initialize statistics
      await this.updateStatistics();

      this.isInitialized = true;
      console.log('✅ MEGA Discovery Engine initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize MEGA Discovery Engine:', error);
      throw error;
    }
  }

  async loadActiveSessions() {
    try {
      const activeSessions = await DiscoverySession.find({
        status: { $in: ['created', 'running', 'paused'] }
      });

      console.log(`📋 Loaded ${activeSessions.length} active sessions`);

      // Resume processing for running sessions
      for (const session of activeSessions) {
        if (session.status === 'running') {
          this.activeSessions.set(session.sessionId, session);
          console.log(`🔄 Resuming session: ${session.sessionId}`);
        }
      }

    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  }

  async initializeTaxonomie() {
    try {
      // Import taxonomie if needed
      const { MegaSearchTermGenerator } = await import('../client/src/services/megaExerciseTaxonomy.js');
      this.searchTermGenerator = new MegaSearchTermGenerator();

      console.log('📚 Taxonomie initialized with',
        this.searchTermGenerator.getStats().totalSearchTerms, 'search terms');

    } catch (error) {
      console.warn('⚠️ Could not load taxonomie, using fallback');
      this.searchTermGenerator = null;
    }
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  async createSession(config = {}) {
    try {
      const sessionId = uuidv4();
      const defaultConfig = {
        batchSize: 25,
        maxExercisesPerTerm: 3,
        includeVideoSearch: false,
        testMode: true,
        sportFilter: null,
        fitnessComponentFilter: null,
        priorityOnly: false,
        qualityThreshold: 75
      };

      const sessionConfig = { ...defaultConfig, ...config };

      // Generate search terms
      const searchTerms = await this.generateSearchTerms(sessionConfig);

      // Calculate batches
      const totalBatches = Math.ceil(searchTerms.length / sessionConfig.batchSize);

      // Create session document
      const session = new DiscoverySession({
        sessionId,
        sessionType: config.sessionType || 'test_run',
        config: sessionConfig,
        progress: {
          totalBatches,
          totalSearchTerms: searchTerms.length
        },
        searchTermsQueue: searchTerms.map((term, index) => ({
          term,
          priority: this.calculateTermPriority(term, sessionConfig)
        }))
      });

      await session.save();

      console.log(`✅ Created session ${sessionId} with ${searchTerms.length} search terms`);

      this.stats.totalSessions++;
      return {
        success: true,
        sessionId,
        config: sessionConfig,
        estimatedDuration: this.estimateSessionDuration(searchTerms.length, sessionConfig),
        searchTermsCount: searchTerms.length,
        batchCount: totalBatches
      };

    } catch (error) {
      console.error('Error creating session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async startSession(sessionId) {
    try {
      const session = await DiscoverySession.findOne({ sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'created') {
        throw new Error(`Session is in ${session.status} state, cannot start`);
      }

      // Update session status
      session.status = 'running';
      session.startedAt = new Date();
      session.lastActivity = new Date();
      await session.save();

      // Add to active sessions
      this.activeSessions.set(sessionId, session);
      this.stats.activeSessions++;

      // Start processing
      this.scheduleSessionProcessing(sessionId);

      console.log(`🚀 Started session ${sessionId}`);

      return {
        success: true,
        message: 'Session started successfully'
      };

    } catch (error) {
      console.error(`Error starting session ${sessionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSessionStatus(sessionId) {
    try {
      const session = await DiscoverySession.findOne({ sessionId });

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      // Calculate additional metrics
      const progressPercent = session.progress.totalSearchTerms > 0
        ? (session.progress.processedTerms / session.progress.totalSearchTerms) * 100
        : 0;

      const duration = session.startedAt
        ? Math.floor((Date.now() - session.startedAt.getTime()) / 1000)
        : 0;

      return {
        success: true,
        session: {
          sessionId: session.sessionId,
          status: session.status,
          sessionType: session.sessionType,
          config: session.config,
          progress: {
            ...session.progress.toObject(),
            progressPercent: Math.round(progressPercent * 100) / 100
          },
          results: session.results,
          duration,
          createdAt: session.createdAt,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          lastActivity: session.lastActivity,
          errorCount: session.errors.length
        }
      };

    } catch (error) {
      console.error(`Error getting session status ${sessionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // =====================================================
  // SEARCH TERM GENERATION
  // =====================================================

  async generateSearchTerms(config) {
    try {
      if (this.searchTermGenerator) {
        // Use taxonomie-based generation
        const options = {
          sportFilter: config.sportFilter,
          fitnessComponentFilter: config.fitnessComponentFilter,
          maxTerms: config.testMode ? 20 : null,
          priorityOnly: config.priorityOnly
        };

        return this.searchTermGenerator.generateAllSearchTerms(options);
      } else {
        // Fallback search terms
        return this.getFallbackSearchTerms(config);
      }

    } catch (error) {
      console.error('Error generating search terms:', error);
      return this.getFallbackSearchTerms(config);
    }
  }

  getFallbackSearchTerms(config) {
    const baseTerms = [
      'squat exercise', 'deadlift training', 'bench press technique',
      'pull up variations', 'push up workouts', 'shoulder press',
      'barbell rows', 'dumbbell exercises', 'kettlebell training',
      'bodyweight workout', 'core strengthening', 'cardio exercises',
      'plyometric training', 'balance exercises', 'mobility stretches',
      'strength training', 'power development', 'endurance workouts'
    ];

    if (config.sportFilter) {
      return baseTerms.map(term => `${term} for ${config.sportFilter}`);
    }

    return config.testMode ? baseTerms.slice(0, 10) : baseTerms;
  }

  calculateTermPriority(term, config) {
    let priority = 1;

    // Boost priority for sport-specific terms
    if (config.sportFilter && term.toLowerCase().includes(config.sportFilter.toLowerCase())) {
      priority += 2;
    }

    // Boost priority for fundamental movements
    const fundamentalTerms = ['squat', 'deadlift', 'bench', 'press', 'pull', 'push'];
    if (fundamentalTerms.some(fundamental => term.toLowerCase().includes(fundamental))) {
      priority += 1;
    }

    return priority;
  }

  estimateSessionDuration(searchTermsCount, config) {
    // Base time per search term (in seconds)
    let timePerTerm = 3; // Fallback processing

    if (this.openaiApiKey) {
      timePerTerm = 8; // AI processing time
    }

    if (config.includeVideoSearch) {
      timePerTerm += 2; // YouTube search time
    }

    const totalSeconds = searchTermsCount * timePerTerm;

    return {
      seconds: totalSeconds,
      minutes: Math.ceil(totalSeconds / 60),
      formatted: this.formatDuration(totalSeconds)
    };
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // =====================================================
  // BACKGROUND PROCESSING
  // =====================================================

  startBackgroundProcessing() {
    // Main processing loop
    setInterval(async () => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        await this.processNextBatch();
      }
    }, 5000); // Check every 5 seconds

    // Cleanup and maintenance
    setInterval(async () => {
      await this.performMaintenance();
    }, 300000); // Every 5 minutes

    console.log('🔄 Background processing started');
  }

  scheduleSessionProcessing(sessionId) {
    if (!this.processingQueue.includes(sessionId)) {
      this.processingQueue.push(sessionId);
      console.log(`📋 Scheduled session ${sessionId} for processing`);
    }
  }

  async processNextBatch() {
    if (this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const sessionId = this.processingQueue.shift();

    try {
      console.log(`🔄 Processing session ${sessionId}...`);
      await this.processSessionBatch(sessionId);

    } catch (error) {
      console.error(`Error processing session ${sessionId}:`, error);
      await this.handleSessionError(sessionId, error);

    } finally {
      this.isProcessing = false;

      // Check if session needs more processing
      const session = await DiscoverySession.findOne({ sessionId });
      if (session && session.status === 'running') {
        const pendingTerms = session.searchTermsQueue.filter(item => item.status === 'pending');
        if (pendingTerms.length > 0) {
          this.scheduleSessionProcessing(sessionId);
        } else {
          await this.completeSession(sessionId);
        }
      }
    }
  }

  async processSessionBatch(sessionId) {
    const session = await DiscoverySession.findOne({ sessionId });
    if (!session || session.status !== 'running') {
      return;
    }

    // Get next batch of pending terms
    const pendingTerms = session.searchTermsQueue
      .filter(item => item.status === 'pending')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, session.config.batchSize);

    if (pendingTerms.length === 0) {
      await this.completeSession(sessionId);
      return;
    }

    console.log(`📦 Processing batch of ${pendingTerms.length} terms for session ${sessionId}`);

    // Process each term in the batch
    for (const termItem of pendingTerms) {
      try {
        await this.processSearchTerm(sessionId, termItem.term);

        // Update term status
        await DiscoverySession.updateOne(
          { sessionId, 'searchTermsQueue.term': termItem.term },
          {
            $set: {
              'searchTermsQueue.$.status': 'completed',
              'searchTermsQueue.$.processedAt': new Date()
            },
            $inc: { 'progress.processedTerms': 1 }
          }
        );

        // Rate limiting delay
        await this.enforceRateLimit();

      } catch (error) {
        console.error(`Error processing term "${termItem.term}":`, error);

        // Mark term as failed
        await DiscoverySession.updateOne(
          { sessionId, 'searchTermsQueue.term': termItem.term },
          {
            $set: { 'searchTermsQueue.$.status': 'failed' },
            $inc: { 'progress.errorCount': 1 }
          }
        );

        // Add to session errors
        await this.addSessionError(sessionId, error, termItem.term);
      }
    }

    // Update session activity
    await DiscoverySession.updateOne(
      { sessionId },
      { $set: { lastActivity: new Date() } }
    );
  }

  // =====================================================
  // EXERCISE DISCOVERY PROCESSING
  // =====================================================

  async processSearchTerm(sessionId, searchTerm) {
    const session = await DiscoverySession.findOne({ sessionId });
    if (!session) throw new Error('Session not found');

    console.log(`🔍 Processing search term: "${searchTerm}"`);

    try {
      // Discover exercises using AI or fallback
      const exercises = await this.discoverExercisesForTerm(searchTerm, session.config);

      if (exercises.length === 0) {
        console.log(`   ⚠️ No exercises found for "${searchTerm}"`);
        return;
      }

      console.log(`   ✅ Found ${exercises.length} exercises for "${searchTerm}"`);

      // Process and save each exercise
      for (const exercise of exercises) {
        await this.processAndSaveExercise(exercise, sessionId, searchTerm);
      }

      // Update session progress
      await DiscoverySession.updateOne(
        { sessionId },
        {
          $inc: {
            'progress.exercisesFound': exercises.length,
            'results.apiCallsUsed.openai': 1
          }
        }
      );

    } catch (error) {
      console.error(`Error processing search term "${searchTerm}":`, error);
      throw error;
    }
  }

  async discoverExercisesForTerm(searchTerm, config) {
    if (this.openaiApiKey && this.canMakeOpenAIRequest()) {
      try {
        return await this.discoverWithAI(searchTerm, config);
      } catch (error) {
        console.warn('AI discovery failed, using fallback:', error.message);
        return this.discoverWithFallback(searchTerm, config);
      }
    } else {
      return this.discoverWithFallback(searchTerm, config);
    }
  }

  async discoverWithAI(searchTerm, config) {
    const prompt = this.buildDiscoveryPrompt(searchTerm, config);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a world-class exercise science researcher and sports performance expert specializing in comprehensive exercise discovery.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    this.updateRateLimit('openai');
    this.stats.totalApiCalls.openai++;

    return result.exercises || [];
  }

  buildDiscoveryPrompt(searchTerm, config) {
    return `You are discovering exercises for the search term: "${searchTerm}"

Find ${config.maxExercisesPerTerm} SPECIFIC, HIGH-QUALITY exercises.

${config.sportFilter ? `Sport Focus: ${config.sportFilter}` : ''}
${config.fitnessComponentFilter ? `Fitness Component: ${config.fitnessComponentFilter}` : ''}

REQUIREMENTS:
✅ Each exercise must be UNIQUE and SPECIFIC
✅ Include detailed execution steps (minimum 4 steps)
✅ Specify exact equipment needed
✅ Include coaching cues and common mistakes
✅ Provide progression/regression options
✅ Identify target muscle groups precisely
✅ Include sport-specific applications if relevant

Return JSON format:
{
  "exercises": [
    {
      "name": "Specific Exercise Name",
      "description": "Detailed description (50+ words)",
      "category": "strength|power|endurance|balance|mobility|sport_specific",
      "primaryMuscleGroup": "specific muscle group",
      "secondaryMuscleGroups": ["secondary muscle 1", "secondary muscle 2"],
      "equipment": "exact equipment needed",
      "difficulty": "beginner|intermediate|advanced|elite",
      "instructions": ["step 1", "step 2", "step 3", "step 4"],
      "coachingCues": ["cue 1", "cue 2", "cue 3"],
      "commonMistakes": ["mistake 1", "mistake 2"],
      "benefits": ["benefit 1", "benefit 2"],
      "setRepGuidelines": "detailed sets/reps/tempo",
      "progressions": ["easier variation", "harder variation"],
      "sportApplications": ["sport 1", "sport 2"],
      "safetyNotes": "safety considerations"
    }
  ]
}

Return ONLY valid JSON with ${config.maxExercisesPerTerm} exercises.`;
  }

  discoverWithFallback(searchTerm, config) {
    // Enhanced fallback logic with taxonomie integration
    const exercises = [];

    for (let i = 0; i < config.maxExercisesPerTerm; i++) {
      exercises.push({
        name: `${this.capitalizeWords(searchTerm)} ${i === 0 ? 'Foundation' : 'Variation ' + i}`,
        description: `Comprehensive ${searchTerm} exercise designed for optimal performance development and skill acquisition. This exercise targets key movement patterns and muscle groups relevant to the search term.`,
        category: this.inferCategoryFromTerm(searchTerm),
        primaryMuscleGroup: this.inferMuscleGroupFromTerm(searchTerm),
        secondaryMuscleGroups: [],
        equipment: 'Variable',
        difficulty: i === 0 ? 'intermediate' : 'advanced',
        instructions: [
          `Prepare for ${searchTerm} exercise`,
          'Establish proper positioning and posture',
          'Execute movement with controlled technique',
          'Complete full range of motion'
        ],
        coachingCues: ['Focus on form', 'Control the movement', 'Breathe consistently'],
        commonMistakes: ['Rushing the movement', 'Poor posture'],
        benefits: ['Enhanced performance', 'Improved movement quality'],
        setRepGuidelines: '3 sets of 8-12 repetitions',
        progressions: ['Master bodyweight version', 'Add external resistance'],
        sportApplications: config.sportFilter ? [config.sportFilter] : [],
        safetyNotes: 'Start with lighter loads and focus on proper form'
      });
    }

    return exercises;
  }

  // =====================================================
  // EXERCISE PROCESSING & STORAGE
  // =====================================================

  async processAndSaveExercise(exercise, sessionId, searchTerm) {
    try {
      // Generate unique exercise ID
      const exerciseId = this.generateExerciseId(exercise, searchTerm);

      // Check for duplicates
      const similarityKey = this.createSimilarityKey(exercise);
      const existingExercise = await DiscoveredExercise.findOne({ similarityKey });

      if (existingExercise) {
        console.log(`   🔄 Potential duplicate found for "${exercise.name}"`);

        // Update duplicate stats
        await DiscoverySession.updateOne(
          { sessionId },
          { $inc: { 'progress.duplicatesRemoved': 1 } }
        );

        return; // Skip duplicate
      }

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(exercise);

      // Filter by quality threshold
      const session = await DiscoverySession.findOne({ sessionId });
      if (qualityScore < session.config.qualityThreshold) {
        console.log(`   ⚠️ Exercise "${exercise.name}" filtered by quality (${qualityScore})`);

        await DiscoverySession.updateOne(
          { sessionId },
          { $inc: { 'progress.qualityFiltered': 1 } }
        );

        return; // Skip low quality
      }

      // Calculate sport relevance
      const relevantSports = await this.calculateSportRelevance(exercise, session.config.sportFilter);

      // Extract fitness components
      const fitnessComponents = this.extractFitnessComponents(exercise);

      // Determine taxonomie mapping
      const taxonomyFamily = this.mapToTaxonomyFamily(exercise);
      const variationType = this.determineVariationType(exercise);
      const exercisePurpose = this.determinePurpose(exercise, session.config);

      // Search for video if enabled
      let videoData = {};
      if (session.config.includeVideoSearch) {
        videoData = await this.searchExerciseVideo(exercise);
      }

      // Create discovered exercise document
      const discoveredExercise = new DiscoveredExercise({
        exerciseId,
        sessionId,
        originalSearchTerm: searchTerm,

        // Exercise details
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        primaryMuscleGroup: exercise.primaryMuscleGroup,
        secondaryMuscleGroups: exercise.secondaryMuscleGroups || [],
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,

        // Instructions & guidelines
        instructions: exercise.instructions || [],
        coachingCues: exercise.coachingCues || [],
        commonMistakes: exercise.commonMistakes || [],
        benefits: exercise.benefits || [],
        setRepGuidelines: exercise.setRepGuidelines || '',
        progressions: exercise.progressions || [],
        safetyNotes: exercise.safetyNotes || '',

        // Analysis results
        relevantSports,
        fitnessComponents,
        taxonomyFamily,
        variationType,
        exercisePurpose,

        // Quality & metadata
        qualityScore,
        discoveryMethod: this.openaiApiKey ? 'AI Discovery' : 'Fallback System',

        // Video data
        ...videoData,

        // Duplicate detection
        similarityKey,

        // Status
        status: qualityScore >= 85 ? 'approved' : 'pending_review'
      });

      await discoveredExercise.save();

      console.log(`   💾 Saved exercise: "${exercise.name}" (Quality: ${qualityScore})`);

      // Update session progress
      await DiscoverySession.updateOne(
        { sessionId },
        {
          $inc: {
            'progress.exercisesProcessed': 1,
            'progress.exercisesApproved': qualityScore >= 85 ? 1 : 0
          }
        }
      );

    } catch (error) {
      console.error(`Error processing exercise "${exercise.name}":`, error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  generateExerciseId(exercise, searchTerm) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    const nameSlug = exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substr(0, 20);
    return `ex_${timestamp}_${nameSlug}_${random}`;
  }

  createSimilarityKey(exercise) {
    const nameWords = exercise.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .sort()
      .slice(0, 3)
      .join('_');

    const muscleGroup = (exercise.primaryMuscleGroup || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const category = (exercise.category || '').toLowerCase();

    return `${nameWords}_${muscleGroup}_${category}`;
  }

  calculateQualityScore(exercise) {
    let score = 0;

    // Basic requirements (40 points)
    if (exercise.name && exercise.name.length > 10) score += 8;
    if (exercise.description && exercise.description.length > 50) score += 8;
    if (exercise.instructions && exercise.instructions.length >= 4) score += 12;
    if (exercise.coachingCues && exercise.coachingCues.length >= 2) score += 6;
    if (exercise.commonMistakes && exercise.commonMistakes.length >= 2) score += 6;

    // Detail quality (30 points)
    if (exercise.benefits && exercise.benefits.length >= 2) score += 8;
    if (exercise.setRepGuidelines && exercise.setRepGuidelines.length > 15) score += 8;
    if (exercise.progressions && exercise.progressions.length >= 2) score += 8;
    if (exercise.safetyNotes && exercise.safetyNotes.length > 10) score += 6;

    // Specificity (20 points)
    if (exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0) score += 5;
    if (exercise.sportApplications && exercise.sportApplications.length > 0) score += 5;
    if (exercise.category && this.isValidCategory(exercise.category)) score += 5;
    if (exercise.difficulty && this.isValidDifficulty(exercise.difficulty)) score += 5;

    // Completeness bonus (10 points)
    const completenessFields = [
      exercise.name, exercise.description, exercise.instructions,
      exercise.coachingCues, exercise.benefits, exercise.setRepGuidelines
    ];
    const completenessScore = completenessFields.filter(field =>
      field && (Array.isArray(field) ? field.length > 0 : field.length > 0)
    ).length;
    score += Math.min(completenessScore, 10);

    return Math.min(score, 100);
  }

  async calculateSportRelevance(exercise, primarySport = null) {
    const relevantSports = [];

    // Basic sport matching based on exercise content
    const exerciseText = `${exercise.name} ${exercise.description} ${exercise.sportApplications?.join(' ') || ''}`.toLowerCase();

    // Define sport keywords
    const sportKeywords = {
      powerlifting: ['squat', 'bench', 'deadlift', 'powerlifting', 'max strength'],
      bodybuilding: ['muscle', 'hypertrophy', 'isolation', 'bodybuilding'],
      crossfit: ['functional', 'crossfit', 'metcon', 'wod'],
      weightlifting: ['clean', 'jerk', 'snatch', 'olympic'],
      strongman: ['carry', 'yoke', 'atlas', 'strongman'],
      tennis: ['lateral', 'rotation', 'agility', 'tennis'],
      basketball: ['jump', 'vertical', 'explosive', 'basketball'],
      soccer: ['sprint', 'agility', 'endurance', 'soccer', 'football'],
      running: ['endurance', 'cardio', 'running', 'jogging'],
      swimming: ['upper body', 'lat', 'swimming', 'stroke']
    };

    // Calculate relevance for each sport
    Object.entries(sportKeywords).forEach(([sportId, keywords]) => {
      const matches = keywords.filter(keyword => exerciseText.includes(keyword));

      if (matches.length > 0) {
        let relevanceScore = Math.min(matches.length * 2 + 4, 10);

        // Boost score if this is the primary sport filter
        if (primarySport === sportId) {
          relevanceScore = Math.min(relevanceScore + 2, 10);
        }

        relevantSports.push({
          sportId,
          relevanceScore,
          purpose: this.inferPurposeForSport(exercise, sportId),
          confidence: matches.length / keywords.length,
          isPrimaryTarget: primarySport === sportId
        });
      }
    });

    // Sort by relevance score
    return relevantSports.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  extractFitnessComponents(exercise) {
    const components = [];
    const text = `${exercise.name} ${exercise.description} ${exercise.category}`.toLowerCase();

    // Component detection logic
    if (text.includes('strength') || exercise.category === 'strength') {
      components.push('max_strength');
    }
    if (text.includes('power') || text.includes('explosive') || exercise.category === 'power') {
      components.push('power');
    }
    if (text.includes('muscle') || text.includes('hypertrophy')) {
      components.push('hypertrophy');
    }
    if (text.includes('endurance') || text.includes('cardio') || exercise.category === 'endurance') {
      components.push('aerobic_endurance');
    }
    if (text.includes('balance') || text.includes('stability') || exercise.category === 'balance') {
      components.push('balance');
    }
    if (text.includes('mobility') || text.includes('flexibility') || exercise.category === 'mobility') {
      components.push('mobility');
    }
    if (text.includes('coordination') || text.includes('agility')) {
      components.push('coordination');
    }

    return [...new Set(components)];
  }

  // =====================================================
  // VIDEO SEARCH INTEGRATION
  // =====================================================

  async searchExerciseVideo(exercise) {
    if (!this.youtubeApiKey || !this.canMakeYouTubeRequest()) {
      return {};
    }

    try {
      const searchQuery = `${exercise.name} exercise tutorial proper form`;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=1&type=video&videoEmbeddable=true&key=${this.youtubeApiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const video = data.items[0];

        this.updateRateLimit('youtube');
        this.stats.totalApiCalls.youtube++;

        return {
          videoUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          videoThumbnail: video.snippet.thumbnails.medium?.url,
          videoTitle: video.snippet.title,
          videoChannelTitle: video.snippet.channelTitle,
          videoSearchTerm: searchQuery
        };
      }

      return {};

    } catch (error) {
      console.error(`Error searching video for "${exercise.name}":`, error);
      return {};
    }
  }

  // =====================================================
  // RATE LIMITING
  // =====================================================

  canMakeOpenAIRequest() {
    const now = Date.now();
    const limits = this.rateLimits.openai;

    // Reset counters if time windows have passed
    if (now - limits.currentMinute.timestamp > 60000) {
      limits.currentMinute = { count: 0, timestamp: now };
    }
    if (now - limits.currentDay.timestamp > 86400000) {
      limits.currentDay = { count: 0, timestamp: now };
    }

    return limits.currentMinute.count < limits.requestsPerMinute &&
           limits.currentDay.count < limits.requestsPerDay;
  }

  canMakeYouTubeRequest() {
    const now = Date.now();
    const limits = this.rateLimits.youtube;

    if (now - limits.currentDay.timestamp > 86400000) {
      limits.currentDay = { count: 0, timestamp: now };
    }

    return limits.currentDay.count < limits.requestsPerDay;
  }

  updateRateLimit(service) {
    const limits = this.rateLimits[service];
    if (service === 'openai') {
      limits.currentMinute.count++;
      limits.currentDay.count++;
    } else if (service === 'youtube') {
      limits.currentDay.count++;
    }
  }

  async enforceRateLimit() {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 second delay
  }

  // =====================================================
  // SESSION COMPLETION & ERROR HANDLING
  // =====================================================

  async completeSession(sessionId) {
    try {
      const session = await DiscoverySession.findOne({ sessionId });
      if (!session) return;

      // Calculate final results
      const totalExercises = await DiscoveredExercise.countDocuments({ sessionId });
      const approvedExercises = await DiscoveredExercise.countDocuments({
        sessionId,
        status: 'approved'
      });

      const qualityScores = await DiscoveredExercise.aggregate([
        { $match: { sessionId } },
        { $group: { _id: null, avgQuality: { $avg: '$qualityScore' } } }
      ]);

      const averageQuality = qualityScores.length > 0 ? qualityScores[0].avgQuality : 0;

      const sportMappings = await DiscoveredExercise.aggregate([
        { $match: { sessionId } },
        { $unwind: '$relevantSports' },
        { $count: 'total' }
      ]);

      const taxonomieFamilies = await DiscoveredExercise.distinct('taxonomyFamily', { sessionId });

      // Calculate processing time
      const processingTime = session.startedAt
        ? Math.floor((Date.now() - session.startedAt.getTime()) / 1000)
        : 0;

      // Update session with final results
      await DiscoverySession.updateOne(
        { sessionId },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            'results.totalExercises': totalExercises,
            'results.averageQuality': Math.round(averageQuality * 100) / 100,
            'results.sportMappings': sportMappings.length > 0 ? sportMappings[0].total : 0,
            'results.taxonomieFamilies': taxonomieFamilies.length,
            'results.processingTime': processingTime
          }
        }
      );

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      this.stats.activeSessions--;

      console.log(`✅ Session ${sessionId} completed successfully`);
      console.log(`   📊 Results: ${totalExercises} exercises, ${Math.round(averageQuality)}% avg quality`);

    } catch (error) {
      console.error(`Error completing session ${sessionId}:`, error);
      await this.handleSessionError(sessionId, error);
    }
  }

  async handleSessionError(sessionId, error) {
    try {
      await DiscoverySession.updateOne(
        { sessionId },
        {
          $set: {
            status: 'failed',
            completedAt: new Date()
          },
          $push: {
            errors: {
              timestamp: new Date(),
              type: error.name || 'UnknownError',
              message: error.message,
              stack: error.stack
            }
          }
        }
      );

      this.activeSessions.delete(sessionId);
      this.stats.activeSessions--;

      console.error(`❌ Session ${sessionId} failed:`, error.message);

    } catch (updateError) {
      console.error(`Error updating failed session ${sessionId}:`, updateError);
    }
  }

  async addSessionError(sessionId, error, searchTerm = null) {
    try {
      await DiscoverySession.updateOne(
        { sessionId },
        {
          $push: {
            errors: {
              timestamp: new Date(),
              type: error.name || 'ProcessingError',
              message: error.message,
              searchTerm,
              stack: error.stack
            }
          }
        }
      );
    } catch (updateError) {
      console.error('Error adding session error:', updateError);
    }
  }

  // =====================================================
  // MAINTENANCE & STATISTICS
  // =====================================================

  async performMaintenance() {
    try {
      // Clean up old completed sessions (older than 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const cleanupResult = await DiscoverySession.deleteMany({
        status: { $in: ['completed', 'failed'] },
        completedAt: { $lt: weekAgo }
      });

      if (cleanupResult.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanupResult.deletedCount} old sessions`);
      }

      // Update statistics
      await this.updateStatistics();

      // Reset rate limit counters if needed
      this.resetExpiredRateLimits();

    } catch (error) {
      console.error('Error during maintenance:', error);
    }
  }

  async updateStatistics() {
    try {
      this.stats.totalSessions = await DiscoverySession.countDocuments();
      this.stats.activeSessions = this.activeSessions.size;
      this.stats.totalExercisesDiscovered = await DiscoveredExercise.countDocuments();

      const qualityStats = await DiscoveredExercise.aggregate([
        { $group: { _id: null, avgQuality: { $avg: '$qualityScore' } } }
      ]);

      this.stats.averageQualityScore = qualityStats.length > 0
        ? Math.round(qualityStats[0].avgQuality * 100) / 100
        : 0;

    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  resetExpiredRateLimits() {
    const now = Date.now();

    // Reset OpenAI rate limits
    if (now - this.rateLimits.openai.currentMinute.timestamp > 60000) {
      this.rateLimits.openai.currentMinute = { count: 0, timestamp: now };
    }
    if (now - this.rateLimits.openai.currentDay.timestamp > 86400000) {
      this.rateLimits.openai.currentDay = { count: 0, timestamp: now };
    }

    // Reset YouTube rate limits
    if (now - this.rateLimits.youtube.currentDay.timestamp > 86400000) {
      this.rateLimits.youtube.currentDay = { count: 0, timestamp: now };
    }
  }

  // =====================================================
  // PUBLIC API METHODS
  // =====================================================

  async getExercises(filters = {}) {
    try {
      const {
        sessionId = null,
        sportId = null,
        category = null,
        difficulty = null,
        status = null,
        minQuality = null,
        limit = 50,
        offset = 0,
        sortBy = 'qualityScore',
        sortOrder = 'desc'
      } = filters;

      // Build query
      const query = {};

      if (sessionId) query.sessionId = sessionId;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (status) query.status = status;
      if (minQuality) query.qualityScore = { $gte: minQuality };
      if (sportId) query['relevantSports.sportId'] = sportId;

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const exercises = await DiscoveredExercise
        .find(query)
        .sort(sort)
        .limit(limit)
        .skip(offset)
        .lean();

      const total = await DiscoveredExercise.countDocuments(query);

      return {
        success: true,
        exercises,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };

    } catch (error) {
      console.error('Error getting exercises:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async approveExercise(exerciseId, approved = true) {
    try {
      const update = {
        status: approved ? 'approved' : 'rejected',
        approvedAt: approved ? new Date() : null
      };

      const result = await DiscoveredExercise.updateOne(
        { exerciseId },
        { $set: update }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Exercise not found'
        };
      }

      return {
        success: true,
        message: `Exercise ${approved ? 'approved' : 'rejected'} successfully`
      };

    } catch (error) {
      console.error('Error approving exercise:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getSystemStats() {
    return {
      success: true,
      stats: {
        ...this.stats,
        uptime: Math.floor((Date.now() - this.stats.uptime) / 1000),
        isInitialized: this.isInitialized,
        rateLimits: {
          openai: {
            minuteRemaining: this.rateLimits.openai.requestsPerMinute - this.rateLimits.openai.currentMinute.count,
            dayRemaining: this.rateLimits.openai.requestsPerDay - this.rateLimits.openai.currentDay.count
          },
          youtube: {
            dayRemaining: this.rateLimits.youtube.requestsPerDay - this.rateLimits.youtube.currentDay.count
          }
        }
      }
    };
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  capitalizeWords(str) {
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  inferCategoryFromTerm(term) {
    const termLower = term.toLowerCase();
    if (termLower.includes('strength') || termLower.includes('squat') || termLower.includes('deadlift')) return 'strength';
    if (termLower.includes('power') || termLower.includes('explosive') || termLower.includes('jump')) return 'power';
    if (termLower.includes('cardio') || termLower.includes('endurance') || termLower.includes('running')) return 'endurance';
    if (termLower.includes('balance') || termLower.includes('stability')) return 'balance';
    if (termLower.includes('mobility') || termLower.includes('flexibility') || termLower.includes('stretch')) return 'mobility';
    return 'strength'; // default
  }

  inferMuscleGroupFromTerm(term) {
    const termLower = term.toLowerCase();
    if (termLower.includes('squat') || termLower.includes('leg')) return 'Legs';
    if (termLower.includes('bench') || termLower.includes('chest') || termLower.includes('push')) return 'Chest';
    if (termLower.includes('deadlift') || termLower.includes('back') || termLower.includes('pull')) return 'Back';
    if (termLower.includes('shoulder') || termLower.includes('press')) return 'Shoulders';
    if (termLower.includes('core') || termLower.includes('abs')) return 'Core';
    if (termLower.includes('arm') || termLower.includes('bicep') || termLower.includes('tricep')) return 'Arms';
    return 'Full Body'; // default
  }

  isValidCategory(category) {
    return ['strength', 'power', 'endurance', 'balance', 'mobility', 'sport_specific'].includes(category);
  }

  isValidDifficulty(difficulty) {
    return ['beginner', 'intermediate', 'advanced', 'elite'].includes(difficulty);
  }

  inferPurposeForSport(exercise, sportId) {
    const exerciseText = exercise.name.toLowerCase();

    if (sportId === 'powerlifting' && (exerciseText.includes('squat') || exerciseText.includes('bench') || exerciseText.includes('deadlift'))) {
      return 'competition_lift';
    }
    if (exerciseText.includes('power') || exerciseText.includes('explosive')) {
      return 'power_development';
    }
    if (exerciseText.includes('muscle') || exerciseText.includes('hypertrophy')) {
      return 'muscle_building';
    }

    return 'strength_building'; // default
  }

  mapToTaxonomyFamily(exercise) {
    const name = exercise.name.toLowerCase();
    if (name.includes('squat')) return 'squatFamily';
    if (name.includes('deadlift')) return 'deadliftFamily';
    if (name.includes('bench')) return 'benchFamily';
    if (name.includes('press')) return 'overheadPressFamily';
    if (name.includes('pull') && name.includes('up')) return 'pullUpFamily';
    if (name.includes('row')) return 'rowingFamily';
    return 'unknown';
  }

  determineVariationType(exercise) {
    const name = exercise.name.toLowerCase();
    if (name.includes('pause')) return 'pause';
    if (name.includes('pin')) return 'pin';
    if (name.includes('deficit')) return 'deficit';
    if (name.includes('close') || name.includes('wide')) return 'grip_variation';
    if (name.includes('single') || name.includes('unilateral')) return 'unilateral';
    if (name.includes('explosive') || name.includes('speed')) return 'tempo';
    return 'standard';
  }

  determinePurpose(exercise, config) {
    const text = exercise.name.toLowerCase();

    if (text.includes('competition') || text.includes('powerlifting')) return 'competition_lift';
    if (text.includes('muscle') || text.includes('hypertrophy')) return 'muscle_building';
    if (text.includes('power') || text.includes('explosive')) return 'power_development';
    if (text.includes('conditioning') || text.includes('cardio')) return 'conditioning';
    if (text.includes('mobility') || text.includes('flexibility')) return 'mobility_work';

    return 'strength_building'; // default
  }
}

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  MegaDiscoveryEngine,
  DiscoverySession,
  DiscoveredExercise
};