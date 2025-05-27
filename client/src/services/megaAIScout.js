// client/src/services/megaAIScout.js
// MEGA AI Scout - Automatische Übungssuche für ALLE Sportarten

import MegaSportsAnalyzer from './completeSportsTaxonomy';

class MegaAIScout {
  constructor() {
    this.sportsAnalyzer = new MegaSportsAnalyzer();
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.youtubeApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

    // Status Tracking
    this.isScanning = false;
    this.currentSession = null;
    
    // Quality Control
    this.qualityThreshold = 70;
  }

  // ============================================
  // SERVER-INTEGRATED MEGA DISCOVERY
  // ============================================
  
  /**
   * Startet MEGA Discovery über Server-Backend
   * @param {Object} options - Konfigurationsoptionen
   * @returns {Promise<Object>} Session-Informationen
   */
  async startMegaDiscovery(options = {}) {
    const {
      sessionType = 'test_run',
      batchSize = 5,
      maxExercisesPerTerm = 3,
      includeVideoSearch = false,
      testMode = true,
      onProgress = null,
      onComplete = null,
      onError = null
    } = options;

    if (this.isScanning) {
      throw new Error('🚨 MEGA Scout is already running!');
    }

    console.log('🚀 STARTING MEGA AI SCOUT - SERVER MODE');
    console.log('═══════════════════════════════════════');

    try {
      this.isScanning = true;

      // 1. Starte Server-side Discovery
      const response = await fetch('/api/mega-discovery/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType,
          batchSize,
          maxExercisesPerTerm,
          includeVideoSearch,
          testMode
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const sessionData = await response.json();
      
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Failed to start MEGA Discovery');
      }

      this.currentSession = sessionData.sessionId;
      
      console.log(`✅ Session started: ${this.currentSession}`);
      console.log(`⏱️ Estimated duration: ${sessionData.estimatedDuration}`);

      // 2. Starte Progress Monitoring (falls Callback vorhanden)
      if (onProgress) {
        this.startProgressMonitoring(this.currentSession, onProgress, onComplete, onError);
      }

      return {
        success: true,
        sessionId: this.currentSession,
        config: sessionData.config,
        estimatedDuration: sessionData.estimatedDuration
      };

    } catch (error) {
      console.error('❌ MEGA DISCOVERY START FAILED:', error);
      this.isScanning = false;
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }

  /**
   * Überwacht den Progress einer laufenden Session
   * @param {string} sessionId - Session ID
   * @param {Function} onProgress - Progress Callback
   * @param {Function} onComplete - Completion Callback
   * @param {Function} onError - Error Callback
   */
  async startProgressMonitoring(sessionId, onProgress, onComplete, onError) {
    const checkInterval = 2000; // Check alle 2 Sekunden
    const maxChecks = 300; // Max 10 Minuten
    let checkCount = 0;

    const monitor = async () => {
      try {
        checkCount++;
        
        if (checkCount > maxChecks) {
          throw new Error('Session monitoring timeout');
        }

        const status = await this.getSessionStatus(sessionId);
        
        if (!status.success) {
          throw new Error(status.error || 'Failed to get session status');
        }

        const session = status.session;
        
        // Progress Callback
        if (onProgress) {
          const progressPercent = session.progress?.totalBatches > 0 
            ? (session.progress.currentBatch / session.progress.totalBatches) * 100 
            : 0;

          onProgress({
            sessionId,
            status: session.status,
            progress: session.progress,
            progressPercent,
            duration: session.duration
          });
        }

        // Check if completed
        if (session.status === 'completed') {
          console.log('🎉 MEGA Discovery completed!');
          this.isScanning = false;
          
          if (onComplete) {
            const exercises = await this.getDiscoveredExercises(sessionId);
            onComplete({
              sessionId,
              session,
              exercises: exercises.exercises || [],
              stats: session.results
            });
          }
          return;
        }

        // Check if failed
        if (session.status === 'failed') {
          console.error('❌ MEGA Discovery failed on server');
          this.isScanning = false;
          
          if (onError) {
            onError(new Error('Server-side discovery failed'));
          }
          return;
        }

        // Continue monitoring if still running
        if (session.status === 'running') {
          setTimeout(monitor, checkInterval);
        }

      } catch (error) {
        console.error('Monitor error:', error);
        this.isScanning = false;
        
        if (onError) {
          onError(error);
        }
      }
    };

    // Start monitoring
    setTimeout(monitor, checkInterval);
  }

  /**
   * Holt den Status einer Session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session Status
   */
  async getSessionStatus(sessionId) {
    try {
      const response = await fetch(`/api/mega-discovery/status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Holt alle entdeckten Übungen einer Session
   * @param {string} sessionId - Session ID (optional)
   * @param {Object} filters - Filter-Optionen
   * @returns {Promise<Object>} Discovered Exercises
   */
  async getDiscoveredExercises(sessionId = null, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Füge Filter hinzu
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/mega-discovery/exercises?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch exercises error:', error);
      return {
        success: false,
        exercises: [],
        error: error.message
      };
    }
  }

  /**
   * Genehmigt oder lehnt eine Übung ab
   * @param {string} exerciseId - Exercise ID
   * @param {boolean} approved - Genehmigungsstatus
   * @returns {Promise<Object>} Update Result
   */
  async approveExercise(exerciseId, approved) {
    try {
      const response = await fetch(`/api/mega-discovery/exercises/${exerciseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved })
      });

      if (!response.ok) {
        throw new Error(`Approval failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Approve exercise error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Holt MEGA Discovery Statistiken
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    try {
      const response = await fetch('/api/mega-discovery/stats');
      
      if (!response.ok) {
        throw new Error(`Stats failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // CLIENT-SIDE PROCESSING (Fallback)
  // ============================================

  /**
   * Client-side Discovery als Fallback
   * @param {Object} options - Optionen
   * @returns {Promise<Object>} Discovery Results
   */
  async clientSideDiscovery(options = {}) {
    const {
      testMode = true,
      maxTerms = 10,
      maxExercisesPerTerm = 2
    } = options;

    console.log('🔄 CLIENT-SIDE DISCOVERY FALLBACK');

    try {
      // Generiere Suchbegriffe
      const searchTerms = this.sportsAnalyzer.generateAllSearchTerms();
      const termsToProcess = testMode ? searchTerms.slice(0, maxTerms) : searchTerms;

      const allExercises = [];

      // Verarbeite jeden Suchbegriff
      for (let i = 0; i < termsToProcess.length; i++) {
        const term = termsToProcess[i];
        console.log(`🔍 Processing: ${term} (${i + 1}/${termsToProcess.length})`);

        try {
          const exercises = await this.discoverExercisesForTerm(term, maxExercisesPerTerm);
          allExercises.push(...exercises);
          
          console.log(`   ✅ Found ${exercises.length} exercises`);
          
          // Kurze Pause zwischen Requests
          await this.sleep(1000);
        } catch (error) {
          console.error(`   ❌ Error for "${term}":`, error.message);
        }
      }

      // Deduplizierung und Qualitätskontrolle
      const uniqueExercises = this.removeDuplicateExercises(allExercises);
      const qualityExercises = uniqueExercises.filter(ex => ex.qualityScore >= this.qualityThreshold);

      console.log(`🧹 Processed: ${allExercises.length} → ${uniqueExercises.length} → ${qualityExercises.length}`);

      return {
        exercises: qualityExercises,
        stats: {
          totalExercises: qualityExercises.length,
          averageQuality: this.calculateAverageQuality(qualityExercises),
          searchTermsProcessed: termsToProcess.length
        }
      };

    } catch (error) {
      console.error('Client-side discovery failed:', error);
      throw error;
    }
  }

  /**
   * AI Discovery für einen Suchbegriff
   * @param {string} searchTerm - Suchbegriff
   * @param {number} maxExercises - Max Anzahl Übungen
   * @returns {Promise<Array>} Discovered Exercises
   */
  async discoverExercisesForTerm(searchTerm, maxExercises = 3) {
    if (!this.openaiApiKey) {
      console.warn('⚠️ OpenAI API key not found - using fallback');
      return this.getFallbackExercises(searchTerm, maxExercises);
    }

    const discoveryPrompt = `
You are a world-class exercise science researcher and sports performance expert.

SEARCH TERM: "${searchTerm}"

Find ${maxExercises} SPECIFIC, HIGH-QUALITY exercises for this search term.

REQUIREMENTS:
✅ Unique and specific exercises (not generic)
✅ Proven effective for the application
✅ Include: STRENGTH, ENDURANCE, BALANCE, MOBILITY exercises
✅ Practical and safe for real-world use
✅ Focus on specialized techniques

Return JSON format:
{
  "exercises": [
    {
      "name": "Specific Exercise Name",
      "description": "Clear description of what makes this exercise special",
      "category": "strength|endurance|balance|mobility",
      "primaryMuscleGroup": "specific muscle group",
      "equipment": "required equipment",
      "difficulty": "beginner|intermediate|advanced",
      "instructions": ["step 1", "step 2", "step 3"],
      "benefits": ["benefit 1", "benefit 2"],
      "setRepGuidelines": "recommended sets/reps",
      "coachingTips": ["tip 1", "tip 2"]
    }
  ]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callOpenAI(discoveryPrompt);
      const result = JSON.parse(response);

      if (!result.exercises || !Array.isArray(result.exercises)) {
        throw new Error('Invalid OpenAI response format');
      }

      // Verarbeite Ergebnisse
      return result.exercises.map(exercise => ({
        ...exercise,
        searchId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'Client AI Scout',
        originalSearchTerm: searchTerm,
        qualityScore: this.calculateQualityScore(exercise),
        relevantSports: this.sportsAnalyzer.categorizeExerciseForSports(exercise)
      }));

    } catch (error) {
      console.error(`AI discovery failed for "${searchTerm}":`, error);
      return this.getFallbackExercises(searchTerm, Math.min(maxExercises, 2));
    }
  }

  /**
   * Fallback Übungen generieren
   * @param {string} searchTerm - Suchbegriff
   * @param {number} count - Anzahl Übungen
   * @returns {Array} Fallback Exercises
   */
  getFallbackExercises(searchTerm, count = 2) {
    const fallbackTemplates = [
      {
        name: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} Power Circuit`,
        description: `High-intensity circuit targeting ${searchTerm} performance enhancement.`,
        category: 'strength',
        primaryMuscleGroup: 'Full Body',
        equipment: 'Minimal Equipment',
        difficulty: 'intermediate',
        instructions: [
          'Set up exercise stations',
          'Perform each exercise for 30 seconds',
          'Rest 15 seconds between exercises',
          'Complete 3 rounds'
        ],
        benefits: ['Improved power', 'Enhanced conditioning'],
        setRepGuidelines: '3 rounds of 30s work / 15s rest',
        coachingTips: ['Focus on form', 'Maintain intensity']
      },
      {
        name: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} Mobility Sequence`,
        description: `Dynamic mobility routine for ${searchTerm} movement preparation.`,
        category: 'mobility',
        primaryMuscleGroup: 'Multi-Joint',
        equipment: 'None',
        difficulty: 'beginner',
        instructions: [
          'Begin with gentle movements',
          'Progress to dynamic stretching',
          'Focus on full range of motion',
          'Hold positions for 2-3 seconds'
        ],
        benefits: ['Improved mobility', 'Injury prevention'],
        setRepGuidelines: '2-3 sets of 8-12 reps',
        coachingTips: ['Move slowly', 'Breathe deeply']
      }
    ];

    return fallbackTemplates.slice(0, count).map(exercise => ({
      ...exercise,
      searchId: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'Fallback System',
      originalSearchTerm: searchTerm,
      qualityScore: 75,
      relevantSports: [],
      isFallback: true
    }));
  }

  // ============================================
  // QUALITY CONTROL & UTILITIES
  // ============================================

  /**
   * Berechnet Quality Score für eine Übung
   * @param {Object} exercise - Exercise Object
   * @returns {number} Quality Score (0-100)
   */
  calculateQualityScore(exercise) {
    let score = 0;

    // Basis Requirements
    if (exercise.name && exercise.name.length > 8) score += 20;
    if (exercise.description && exercise.description.length > 30) score += 15;
    if (exercise.instructions && exercise.instructions.length >= 3) score += 20;

    // Detail Quality
    if (exercise.benefits && exercise.benefits.length >= 2) score += 15;
    if (exercise.coachingTips && exercise.coachingTips.length >= 2) score += 10;
    if (exercise.setRepGuidelines && exercise.setRepGuidelines.length > 10) score += 10;

    // Category & Equipment
    if (exercise.category && ['strength', 'endurance', 'balance', 'mobility'].includes(exercise.category)) score += 5;
    if (exercise.difficulty && ['beginner', 'intermediate', 'advanced'].includes(exercise.difficulty)) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Berechnet durchschnittliche Qualität
   * @param {Array} exercises - Array von Übungen
   * @returns {number} Average Quality Score
   */
  calculateAverageQuality(exercises) {
    if (exercises.length === 0) return 0;
    const totalScore = exercises.reduce((sum, ex) => sum + (ex.qualityScore || 0), 0);
    return totalScore / exercises.length;
  }

  /**
   * Entfernt Duplikate basierend auf Ähnlichkeit
   * @param {Array} exercises - Array von Übungen
   * @returns {Array} Unique Exercises
   */
  removeDuplicateExercises(exercises) {
    const seen = new Map();
    const unique = [];

    for (const exercise of exercises) {
      const key = this.createSimilarityKey(exercise);

      if (!seen.has(key)) {
        seen.set(key, exercise);
        unique.push(exercise);
      } else {
        // Behalte höhere Qualität
        const existing = seen.get(key);
        if (exercise.qualityScore > existing.qualityScore) {
          const index = unique.indexOf(existing);
          unique[index] = exercise;
          seen.set(key, exercise);
        }
      }
    }

    return unique;
  }

  /**
   * Erstellt Similarity Key für Duplikat-Erkennung
   * @param {Object} exercise - Exercise Object
   * @returns {string} Similarity Key
   */
  createSimilarityKey(exercise) {
    const nameWords = exercise.name.toLowerCase().split(' ').sort();
    const muscleGroup = (exercise.primaryMuscleGroup || '').toLowerCase();
    const category = (exercise.category || '').toLowerCase();

    return `${nameWords.slice(0, 3).join('_')}_${muscleGroup}_${category}`;
  }

  /**
   * OpenAI API Call
   * @param {string} prompt - AI Prompt
   * @param {number} retries - Retry Count
   * @returns {Promise<string>} AI Response
   */
  async callOpenAI(prompt, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
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
                content: 'You are a world-class exercise science researcher and sports performance expert.'
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
        return data.choices[0].message.content;

      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        console.log(`⚠️ OpenAI attempt ${attempt + 1} failed, retrying...`);
        await this.sleep(2000);
      }
    }
  }

  /**
   * Sleep Utility
   * @param {number} ms - Milliseconds
   * @returns {Promise} Sleep Promise
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Einfacher Test-Run
   * @returns {Promise<Object>} Test Results
   */
  async testRun() {
    console.log('🧪 RUNNING MEGA SCOUT TEST');
    
    try {
      // Probiere Server-Mode zuerst
      return await this.startMegaDiscovery({
        sessionType: 'test_run',
        batchSize: 3,
        maxExercisesPerTerm: 2,
        testMode: true
      });
    } catch (error) {
      console.warn('Server-mode failed, trying client-side:', error.message);
      
      // Fallback zu Client-Mode
      return await this.clientSideDiscovery({
        testMode: true,
        maxTerms: 5,
        maxExercisesPerTerm: 2
      });
    }
  }

  /**
   * Holt aktuellen Status
   * @returns {Object} Current Status
   */
  getStatus() {
    return {
      isScanning: this.isScanning,
      currentSession: this.currentSession,
      hasOpenAI: !!this.openaiApiKey,
      hasYouTube: !!this.youtubeApiKey,
      qualityThreshold: this.qualityThreshold
    };
  }

  /**
   * Stoppt laufende Discovery
   */
  stop() {
    this.isScanning = false;
    this.currentSession = null;
    console.log('⏹️ MEGA Scout stopped');
  }
}

export default MegaAIScout;