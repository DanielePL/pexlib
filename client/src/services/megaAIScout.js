// client/src/services/megaAIScout.js
// 🚀 MEGA AI SCOUT - UPGRADED für neue Exercise Taxonomie
// Automatische Übungssuche für ALLE Sportarten mit 50,000+ Übungen

import {
  MegaSearchTermGenerator,
  RELEVANCE_SCORES,
  FITNESS_COMPONENTS,
  EXERCISE_PURPOSES,
  MEGA_EXERCISE_TAXONOMY,
  OLYMPIC_WEIGHTLIFTING_TAXONOMY,
  STRONGMAN_TAXONOMY,
  CONDITIONING_TAXONOMY,
  BALANCE_COORDINATION_TAXONOMY,
  MOBILITY_TAXONOMY
} from './megaExerciseTaxonomy';

class MegaAIScout {
  constructor() {
    // Neue Taxonomie Integration
    this.searchTermGenerator = new MegaSearchTermGenerator();
    this.taxonomies = {
      mega: MEGA_EXERCISE_TAXONOMY,
      olympic: OLYMPIC_WEIGHTLIFTING_TAXONOMY,
      strongman: STRONGMAN_TAXONOMY,
      conditioning: CONDITIONING_TAXONOMY,
      balance: BALANCE_COORDINATION_TAXONOMY,
      mobility: MOBILITY_TAXONOMY
    };

    // API Keys
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.youtubeApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

    // Status Tracking
    this.isScanning = false;
    this.currentSession = null;

    // Quality Control - erhöht für bessere Qualität
    this.qualityThreshold = 75;

    // Discovery Statistics
    this.discoveryStats = {
      totalSearchTerms: 0,
      exercisesFound: 0,
      duplicatesRemoved: 0,
      qualityFiltered: 0,
      sportMappings: 0
    };
  }

  // ============================================
  // ENHANCED SEARCH TERM GENERATION
  // ============================================

  /**
   * Generiert Search Terms basierend auf neuer Taxonomie
   * @param {Object} options - Generation Options
   * @returns {Array} Search Terms Array
   */
  generateSearchTerms(options = {}) {
    const {
      sportFilter = null,
      fitnessComponentFilter = null,
      purposeFilter = null,
      maxTerms = null,
      includeVariations = true,
      priorityOnly = false
    } = options;

    console.log('🔍 Generating search terms with new taxonomie system...');

    let searchTerms = [];

    // 1. Sport-spezifische Terms
    if (sportFilter) {
      const sportTerms = this.searchTermGenerator.getSearchTermsForSport(sportFilter);
      searchTerms.push(...sportTerms);
      console.log(`  ✅ Sport-specific terms for ${sportFilter}: ${sportTerms.length}`);
    } else {
      // Alle Terms aus der Taxonomie
      const allTerms = this.searchTermGenerator.generateAllSearchTerms();
      searchTerms.push(...allTerms);
      console.log(`  ✅ All taxonomy terms: ${allTerms.length}`);
    }

    // 2. Fitness Component Filter
    if (fitnessComponentFilter) {
      searchTerms = this.filterByFitnessComponent(searchTerms, fitnessComponentFilter);
      console.log(`  🎯 Filtered by fitness component: ${searchTerms.length}`);
    }

    // 3. Purpose Filter
    if (purposeFilter) {
      searchTerms = this.filterByPurpose(searchTerms, purposeFilter);
      console.log(`  🎯 Filtered by purpose: ${searchTerms.length}`);
    }

    // 4. Priorität-based Filtering
    if (priorityOnly) {
      searchTerms = this.filterHighPriorityTerms(searchTerms, sportFilter);
      console.log(`  ⭐ High-priority terms only: ${searchTerms.length}`);
    }

    // 5. Variations hinzufügen
    if (includeVariations) {
      const variationTerms = this.generateVariationTerms(searchTerms);
      searchTerms.push(...variationTerms);
      console.log(`  🔄 Added variations: ${variationTerms.length}`);
    }

    // 6. Deduplizieren und limitieren
    searchTerms = [...new Set(searchTerms)];

    if (maxTerms && searchTerms.length > maxTerms) {
      searchTerms = searchTerms.slice(0, maxTerms);
      console.log(`  ✂️ Limited to ${maxTerms} terms`);
    }

    this.discoveryStats.totalSearchTerms = searchTerms.length;
    console.log(`🚀 Generated ${searchTerms.length} search terms for discovery`);

    return searchTerms;
  }

  /**
   * Filter Terms nach Fitness Component
   */
  filterByFitnessComponent(terms, component) {
    const relevantTerms = [];

    // Map component zu relevanten Keywords
    const componentKeywords = {
      [FITNESS_COMPONENTS.MAX_STRENGTH]: ['strength', 'max', 'heavy', 'powerlifting', '1rm'],
      [FITNESS_COMPONENTS.POWER]: ['power', 'explosive', 'speed', 'plyometric', 'ballistic'],
      [FITNESS_COMPONENTS.HYPERTROPHY]: ['hypertrophy', 'muscle', 'bodybuilding', 'volume'],
      [FITNESS_COMPONENTS.ENDURANCE]: ['endurance', 'cardio', 'aerobic', 'conditioning'],
      [FITNESS_COMPONENTS.MOBILITY]: ['mobility', 'flexibility', 'stretch', 'rom'],
      [FITNESS_COMPONENTS.BALANCE]: ['balance', 'stability', 'proprioception', 'unilateral']
    };

    const keywords = componentKeywords[component] || [];

    return terms.filter(term =>
      keywords.some(keyword => term.toLowerCase().includes(keyword))
    );
  }

  /**
   * Filter Terms nach Exercise Purpose
   */
  filterByPurpose(terms, purpose) {
    const purposeKeywords = {
      [EXERCISE_PURPOSES.COMPETITION]: ['competition', 'powerlifting', 'olympic', 'meet'],
      [EXERCISE_PURPOSES.STRENGTH_BUILDING]: ['strength', 'building', 'development'],
      [EXERCISE_PURPOSES.HYPERTROPHY]: ['muscle', 'hypertrophy', 'bodybuilding', 'size'],
      [EXERCISE_PURPOSES.POWER_DEVELOPMENT]: ['power', 'explosive', 'speed', 'athletic'],
      [EXERCISE_PURPOSES.ACCESSORY]: ['accessory', 'assistance', 'isolation'],
      [EXERCISE_PURPOSES.CONDITIONING]: ['conditioning', 'cardio', 'metcon', 'circuit'],
      [EXERCISE_PURPOSES.MOBILITY]: ['mobility', 'flexibility', 'warmup', 'cooldown']
    };

    const keywords = purposeKeywords[purpose] || [];

    return terms.filter(term =>
      keywords.some(keyword => term.toLowerCase().includes(keyword))
    );
  }

  /**
   * Filter High-Priority Terms für bestimmte Sportart
   */
  filterHighPriorityTerms(terms, sportId) {
    if (!sportId) return terms;

    const highPriorityTerms = [];

    // Gehe durch alle Exercise Families und finde high-relevance für Sport
    Object.values(this.taxonomies).forEach(taxonomy => {
      Object.values(taxonomy).forEach(family => {
        if (family.sportRelevance && family.sportRelevance[sportId]) {
          const relevance = family.sportRelevance[sportId].score;

          if (relevance >= RELEVANCE_SCORES.IMPORTANT) {
            if (family.searchTerms) {
              highPriorityTerms.push(...family.searchTerms);
            }
          }
        }
      });
    });

    return terms.filter(term =>
      highPriorityTerms.some(priorityTerm =>
        term.toLowerCase().includes(priorityTerm.toLowerCase())
      )
    );
  }

  /**
   * Generiere Variation Terms
   */
  generateVariationTerms(baseTerms) {
    const variationSuffixes = [
      'variations', 'technique', 'form', 'tutorial', 'guide',
      'tips', 'mistakes', 'progression', 'advanced', 'beginner'
    ];

    const variationTerms = [];

    baseTerms.slice(0, 50).forEach(term => { // Nur für erste 50 Terms
      variationSuffixes.forEach(suffix => {
        variationTerms.push(`${term} ${suffix}`);
      });
    });

    return variationTerms;
  }

  // ============================================
  // ENHANCED AI DISCOVERY
  // ============================================

  /**
   * Enhanced AI Discovery für einen Suchbegriff
   * @param {string} searchTerm - Suchbegriff
   * @param {number} maxExercises - Max Anzahl Übungen
   * @param {Object} context - Discovery Context
   * @returns {Promise<Array>} Discovered Exercises
   */
  async discoverExercisesForTerm(searchTerm, maxExercises = 3, context = {}) {
    if (!this.openaiApiKey) {
      console.warn('⚠️ OpenAI API key not found - using enhanced fallback');
      return this.getEnhancedFallbackExercises(searchTerm, maxExercises, context);
    }

    const { sportFilter = null, fitnessComponent = null, purpose = null } = context;

    // Enhanced Discovery Prompt mit neuer Taxonomie
    const discoveryPrompt = this.buildEnhancedDiscoveryPrompt(searchTerm, maxExercises, context);

    try {
      const response = await this.callOpenAI(discoveryPrompt);
      const result = JSON.parse(response);

      if (!result.exercises || !Array.isArray(result.exercises)) {
        throw new Error('Invalid OpenAI response format');
      }

      // Enhanced Processing mit Sport-Relevance
      const processedExercises = result.exercises.map(exercise => ({
        ...exercise,
        searchId: `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'Enhanced MEGA AI Scout',
        originalSearchTerm: searchTerm,
        searchContext: context,

        // Enhanced Quality & Relevance
        qualityScore: this.calculateEnhancedQualityScore(exercise, context),
        relevantSports: this.calculateSportRelevance(exercise),
        fitnessComponents: this.extractFitnessComponents(exercise),
        exercisePurpose: this.determinePurpose(exercise, context),

        // Taxonomie Mapping
        taxonomyFamily: this.mapToTaxonomyFamily(exercise),
        variationType: this.determineVariationType(exercise)
      }));

      this.discoveryStats.exercisesFound += processedExercises.length;
      return processedExercises;

    } catch (error) {
      console.error(`Enhanced AI discovery failed for "${searchTerm}":`, error);
      return this.getEnhancedFallbackExercises(searchTerm, Math.min(maxExercises, 2), context);
    }
  }

  /**
   * Build Enhanced Discovery Prompt
   */
  buildEnhancedDiscoveryPrompt(searchTerm, maxExercises, context) {
    const { sportFilter, fitnessComponent, purpose } = context;

    let prompt = `You are a world-class exercise science researcher specializing in comprehensive exercise discovery.

SEARCH TERM: "${searchTerm}"
TARGET: Find ${maxExercises} SPECIFIC, HIGH-QUALITY exercises

CONTEXT:`;

    if (sportFilter) {
      prompt += `\n- Sport Focus: ${sportFilter}`;
    }
    if (fitnessComponent) {
      prompt += `\n- Fitness Component: ${fitnessComponent}`;
    }
    if (purpose) {
      prompt += `\n- Exercise Purpose: ${purpose}`;
    }

    prompt += `

ENHANCED REQUIREMENTS:
✅ Each exercise must be UNIQUE and SPECIFIC (not generic)
✅ Include detailed execution steps (minimum 4 steps)
✅ Specify exact equipment needed
✅ Include coaching cues and common mistakes
✅ Provide progression/regression options
✅ Identify target muscle groups precisely
✅ Include sport-specific applications if relevant

EXERCISE CATEGORIES TO COVER:
- Strength Training (compound and isolation)
- Power Development (explosive/ballistic)
- Endurance/Conditioning 
- Balance/Coordination
- Mobility/Flexibility
- Sport-Specific Movements

Return JSON format:
{
  "exercises": [
    {
      "name": "Specific Exercise Name (avoid generic terms)",
      "description": "Detailed description of movement and purpose (50+ words)",
      "category": "strength|power|endurance|balance|mobility|sport_specific",
      "primaryMuscleGroup": "specific muscle group",
      "secondaryMuscleGroups": ["secondary muscle 1", "secondary muscle 2"],
      "equipment": "exact equipment needed",
      "difficulty": "beginner|intermediate|advanced|elite",
      "instructions": [
        "Detailed step 1",
        "Detailed step 2", 
        "Detailed step 3",
        "Detailed step 4"
      ],
      "coachingCues": ["cue 1", "cue 2", "cue 3"],
      "commonMistakes": ["mistake 1", "mistake 2"],
      "benefits": ["specific benefit 1", "specific benefit 2"],
      "setRepGuidelines": "detailed sets/reps/tempo recommendations",
      "progressions": ["easier variation", "harder variation"],
      "sportApplications": ["sport 1", "sport 2"],
      "safetyNotes": "important safety considerations"
    }
  ]
}

Return ONLY valid JSON with ${maxExercises} comprehensive exercises.`;

    return prompt;
  }

  /**
   * Enhanced Quality Score Calculation
   */
  calculateEnhancedQualityScore(exercise, context = {}) {
    let score = 0;

    // Basic Quality (40 points)
    if (exercise.name && exercise.name.length > 10) score += 8;
    if (exercise.description && exercise.description.length > 50) score += 8;
    if (exercise.instructions && exercise.instructions.length >= 4) score += 12;
    if (exercise.coachingCues && exercise.coachingCues.length >= 2) score += 6;
    if (exercise.commonMistakes && exercise.commonMistakes.length >= 2) score += 6;

    // Detail Quality (30 points)
    if (exercise.benefits && exercise.benefits.length >= 2) score += 8;
    if (exercise.setRepGuidelines && exercise.setRepGuidelines.length > 15) score += 8;
    if (exercise.progressions && exercise.progressions.length >= 2) score += 8;
    if (exercise.safetyNotes && exercise.safetyNotes.length > 10) score += 6;

    // Specificity (20 points)
    if (exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0) score += 5;
    if (exercise.sportApplications && exercise.sportApplications.length > 0) score += 5;
    if (exercise.category && this.isValidCategory(exercise.category)) score += 5;
    if (exercise.difficulty && this.isValidDifficulty(exercise.difficulty)) score += 5;

    // Context Relevance (10 points)
    if (context.sportFilter && exercise.sportApplications?.includes(context.sportFilter)) score += 5;
    if (context.fitnessComponent && this.matchesFitnessComponent(exercise, context.fitnessComponent)) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Calculate Sport Relevance für Exercise
   */
  calculateSportRelevance(exercise) {
    const relevantSports = [];

    // Check gegen unsere Taxonomie
    Object.values(this.taxonomies).forEach(taxonomy => {
      Object.values(taxonomy).forEach(family => {
        if (family.sportRelevance) {
          Object.entries(family.sportRelevance).forEach(([sportId, relevanceData]) => {
            if (this.exerciseMatchesFamily(exercise, family)) {
              relevantSports.push({
                sportId,
                relevanceScore: relevanceData.score,
                purpose: relevanceData.purpose,
                confidence: this.calculateMatchConfidence(exercise, family)
              });
            }
          });
        }
      });
    });

    return relevantSports.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Extract Fitness Components
   */
  extractFitnessComponents(exercise) {
    const components = [];

    const categoryMapping = {
      'strength': [FITNESS_COMPONENTS.MAX_STRENGTH, FITNESS_COMPONENTS.HYPERTROPHY],
      'power': [FITNESS_COMPONENTS.POWER],
      'endurance': [FITNESS_COMPONENTS.STRENGTH_ENDURANCE, FITNESS_COMPONENTS.AEROBIC_ENDURANCE],
      'balance': [FITNESS_COMPONENTS.BALANCE, FITNESS_COMPONENTS.STABILITY],
      'mobility': [FITNESS_COMPONENTS.MOBILITY, FITNESS_COMPONENTS.FLEXIBILITY]
    };

    const mapped = categoryMapping[exercise.category] || [];
    components.push(...mapped);

    // Additional analysis based on description/name
    const text = `${exercise.name} ${exercise.description}`.toLowerCase();

    if (text.includes('explosive') || text.includes('jump') || text.includes('throw')) {
      components.push(FITNESS_COMPONENTS.POWER);
    }
    if (text.includes('single leg') || text.includes('unilateral')) {
      components.push(FITNESS_COMPONENTS.BALANCE);
    }
    if (text.includes('coordination') || text.includes('agility')) {
      components.push(FITNESS_COMPONENTS.COORDINATION);
    }

    return [...new Set(components)];
  }

  // ============================================
  // ENHANCED FALLBACK SYSTEM
  // ============================================

  /**
   * Enhanced Fallback mit Taxonomie-Integration
   */
  getEnhancedFallbackExercises(searchTerm, count = 2, context = {}) {
    console.log(`🔄 Using enhanced fallback for: "${searchTerm}"`);

    // Finde passende Taxonomie Familie
    const matchingFamily = this.findMatchingTaxonomyFamily(searchTerm);

    if (matchingFamily) {
      return this.generateFromTaxonomyFamily(matchingFamily, searchTerm, count, context);
    }

    // Generic enhanced fallback
    return this.generateGenericEnhancedFallback(searchTerm, count, context);
  }

  /**
   * Finde matching Taxonomie Familie
   */
  findMatchingTaxonomyFamily(searchTerm) {
    const term = searchTerm.toLowerCase();

    // Check gegen alle Taxonomie Familien
    for (const taxonomy of Object.values(this.taxonomies)) {
      for (const [familyKey, family] of Object.entries(taxonomy)) {
        if (family.searchTerms) {
          const isMatch = family.searchTerms.some(searchTermItem =>
            term.includes(searchTermItem.toLowerCase()) ||
            searchTermItem.toLowerCase().includes(term)
          );

          if (isMatch) {
            return { key: familyKey, family, taxonomy };
          }
        }
      }
    }

    return null;
  }

  /**
   * Generate aus Taxonomie Familie
   */
  generateFromTaxonomyFamily(matchingData, searchTerm, count, context) {
    const { family } = matchingData;
    const exercises = [];

    // Base Exercise
    exercises.push({
      name: family.baseExercise || this.capitalizeWords(searchTerm),
      description: family.description || `Comprehensive ${searchTerm} exercise for optimal performance development.`,
      category: this.inferCategoryFromFamily(family),
      primaryMuscleGroup: this.inferMuscleGroupFromFamily(family),
      equipment: 'Variable',
      difficulty: 'intermediate',
      instructions: this.generateInstructionsFromFamily(family, searchTerm),
      benefits: this.extractBenefitsFromFamily(family),
      setRepGuidelines: this.inferSetRepFromFamily(family),
      coachingTips: ['Focus on proper form', 'Control the movement', 'Breathe consistently'],
      taxonomyBased: true,
      fallbackQuality: 'high'
    });

    // Variation if needed
    if (count > 1 && family.variations) {
      const variationKey = Object.keys(family.variations)[0];
      const variation = Object.values(family.variations[variationKey])[0];

      if (variation && variation.name) {
        exercises.push({
          name: variation.name,
          description: `Advanced variation of ${family.baseExercise} with enhanced specificity.`,
          category: this.inferCategoryFromFamily(family),
          primaryMuscleGroup: this.inferMuscleGroupFromFamily(family),
          equipment: variation.equipment || 'Variable',
          difficulty: variation.difficulty || 'advanced',
          instructions: this.generateVariationInstructions(variation),
          benefits: this.extractBenefitsFromFamily(family),
          setRepGuidelines: this.inferSetRepFromFamily(family),
          coachingTips: ['Advanced technique required', 'Master basic version first'],
          taxonomyBased: true,
          fallbackQuality: 'high',
          isVariation: true
        });
      }
    }

    return exercises.slice(0, count).map(exercise => ({
      ...exercise,
      searchId: `enhanced_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'Enhanced Taxonomie Fallback',
      originalSearchTerm: searchTerm,
      searchContext: context,
      qualityScore: 80, // High score for taxonomie-based
      relevantSports: this.extractSportRelevanceFromFamily(family),
      fitnessComponents: this.extractFitnessComponentsFromFamily(family)
    }));
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  capitalizeWords(str) {
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  inferCategoryFromFamily(family) {
    if (family.fitnessComponents) {
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.MAX_STRENGTH)) return 'strength';
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.POWER)) return 'power';
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.BALANCE)) return 'balance';
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.MOBILITY)) return 'mobility';
    }
    return 'strength'; // default
  }

  inferMuscleGroupFromFamily(family) {
    const name = family.baseExercise?.toLowerCase() || '';
    if (name.includes('squat')) return 'Legs';
    if (name.includes('bench')) return 'Chest';
    if (name.includes('deadlift')) return 'Back';
    if (name.includes('press')) return 'Shoulders';
    if (name.includes('row')) return 'Back';
    if (name.includes('pull')) return 'Back';
    return 'Full Body';
  }

  generateInstructionsFromFamily(family, searchTerm) {
    return [
      `Set up properly for ${family.baseExercise || searchTerm}`,
      'Maintain correct posture and alignment throughout',
      'Execute the movement with controlled tempo',
      'Complete the full range of motion',
      'Return to starting position with control'
    ];
  }

  extractBenefitsFromFamily(family) {
    const benefits = [];
    if (family.fitnessComponents) {
      family.fitnessComponents.forEach(component => {
        switch (component) {
          case FITNESS_COMPONENTS.MAX_STRENGTH:
            benefits.push('Increased maximum strength');
            break;
          case FITNESS_COMPONENTS.POWER:
            benefits.push('Enhanced explosive power');
            break;
          case FITNESS_COMPONENTS.HYPERTROPHY:
            benefits.push('Muscle development');
            break;
          case FITNESS_COMPONENTS.BALANCE:
            benefits.push('Improved balance and stability');
            break;
          case FITNESS_COMPONENTS.MOBILITY:
            benefits.push('Enhanced mobility and flexibility');
            break;
        }
      });
    }
    return benefits.length > 0 ? benefits : ['Improved fitness', 'Enhanced performance'];
  }

  extractSportRelevanceFromFamily(family) {
    if (!family.sportRelevance) return [];

    return Object.entries(family.sportRelevance).map(([sportId, data]) => ({
      sportId,
      relevanceScore: data.score,
      purpose: data.purpose,
      confidence: 0.8 // High confidence for taxonomie-based
    }));
  }

  extractFitnessComponentsFromFamily(family) {
    return family.fitnessComponents || [FITNESS_COMPONENTS.MAX_STRENGTH];
  }

  // ============================================
  // ENHANCED CLIENT-SIDE DISCOVERY
  // ============================================

  /**
   * Enhanced Client-side Discovery
   */
  async enhancedClientSideDiscovery(options = {}) {
    const {
      testMode = true,
      maxTerms = 20,
      maxExercisesPerTerm = 2,
      sportFilter = null,
      fitnessComponentFilter = null,
      purposeFilter = null,
      priorityOnly = false
    } = options;

    console.log('🚀 ENHANCED CLIENT-SIDE DISCOVERY');
    console.log('═══════════════════════════════════');

    try {
      // 1. Generate enhanced search terms
      const searchTerms = this.generateSearchTerms({
        sportFilter,
        fitnessComponentFilter,
        purposeFilter,
        maxTerms: testMode ? Math.min(maxTerms, 10) : maxTerms,
        priorityOnly
      });

      console.log(`🔍 Processing ${searchTerms.length} enhanced search terms...`);

      const allExercises = [];
      const context = { sportFilter, fitnessComponentFilter, purposeFilter };

      // 2. Process each term with enhanced discovery
      for (let i = 0; i < searchTerms.length; i++) {
        const term = searchTerms[i];
        console.log(`🎯 [${i + 1}/${searchTerms.length}] Processing: "${term}"`);

        try {
          const exercises = await this.discoverExercisesForTerm(term, maxExercisesPerTerm, context);
          allExercises.push(...exercises);

          console.log(`   ✅ Found ${exercises.length} exercises (Avg Quality: ${this.calculateAverageQuality(exercises).toFixed(1)})`);

          // Rate limiting
          if (!testMode) {
            await this.sleep(1500);
          }
        } catch (error) {
          console.error(`   ❌ Error for "${term}":`, error.message);
        }
      }

      // 3. Enhanced post-processing
      const uniqueExercises = this.removeDuplicateExercises(allExercises);
      const qualityExercises = uniqueExercises.filter(ex => ex.qualityScore >= this.qualityThreshold);
      const sportMappedExercises = this.enhanceSportMappings(qualityExercises, sportFilter);

      // 4. Update statistics
      this.discoveryStats.duplicatesRemoved = allExercises.length - uniqueExercises.length;
      this.discoveryStats.qualityFiltered = uniqueExercises.length - qualityExercises.length;
      this.discoveryStats.sportMappings = sportMappedExercises.reduce((sum, ex) => sum + ex.relevantSports.length, 0);

      console.log('📊 ENHANCED DISCOVERY COMPLETE');
      console.log(`   🔍 Search Terms: ${searchTerms.length}`);
      console.log(`   📦 Total Found: ${allExercises.length}`);
      console.log(`   🧹 After Dedup: ${uniqueExercises.length}`);
      console.log(`   ⭐ Quality Filter: ${qualityExercises.length}`);
      console.log(`   🏆 Avg Quality: ${this.calculateAverageQuality(qualityExercises).toFixed(1)}`);
      console.log(`   🎯 Sport Mappings: ${this.discoveryStats.sportMappings}`);

      return {
        exercises: sportMappedExercises,
        stats: {
          ...this.discoveryStats,
          totalExercises: sportMappedExercises.length,
          averageQuality: this.calculateAverageQuality(sportMappedExercises),
          searchTermsProcessed: searchTerms.length,
          discoveryMode: 'enhanced_client_side',
          taxonomieVersion: '2.0'
        }
      };

    } catch (error) {
      console.error('Enhanced client-side discovery failed:', error);
      throw error;
    }
  }

  /**
   * Enhance Sport Mappings
   */
  enhanceSportMappings(exercises, primarySport = null) {
    return exercises.map(exercise => {
      // Erweitere sport relevance falls nicht vorhanden
      if (!exercise.relevantSports || exercise.relevantSports.length === 0) {
        exercise.relevantSports = this.calculateSportRelevance(exercise);
      }

      // Boost primary sport if specified
      if (primarySport && exercise.relevantSports.length > 0) {
        const primarySportMapping = exercise.relevantSports.find(sport => sport.sportId === primarySport);
        if (primarySportMapping) {
          primarySportMapping.relevanceScore += 1; // Boost
          primarySportMapping.isPrimaryTarget = true;
        }
      }

      return exercise;
    });
  }

  // ============================================
  // PUBLIC API UPDATES
  // ============================================

  /**
   * Enhanced Test Run
   */
  async enhancedTestRun(sportFilter = null) {
    console.log('🧪 RUNNING ENHANCED MEGA SCOUT TEST');

    try {
      // Probiere Server-Mode zuerst
      return await this.startMegaDiscovery({
        sessionType: 'enhanced_test',
        batchSize: 5,
        maxExercisesPerTerm: 2,
        testMode: true,
        sportFilter
      });
    } catch (error) {
      console.warn('Server-mode failed, trying enhanced client-side:', error.message);

      // Enhanced Client-Mode Fallback
      return await this.enhancedClientSideDiscovery({
        testMode: true,
        maxTerms: 8,
        maxExercisesPerTerm: 2,
        sportFilter,
        priorityOnly: true
      });
    }
  }

  /**
   * Enhanced Status mit Taxonomie Info
   */
  getEnhancedStatus() {
    const taxonomieStats = this.searchTermGenerator.getStats();

    return {
      isScanning: this.isScanning,
      currentSession: this.currentSession,
      hasOpenAI: !!this.openaiApiKey,
      hasYouTube: !!this.youtubeApiKey,
      qualityThreshold: this.qualityThreshold,

      // Enhanced Info
      taxonomieVersion: '2.0',
      supportedSports: this.searchTermGenerator.getSupportedSports(),
      taxonomieStats,
      discoveryStats: this.discoveryStats,

      // Capabilities
      capabilities: {
        sportSpecificDiscovery: true,
        fitnessComponentFiltering: true,
        purposeBasedSearch: true,
        enhancedQualityScoring: true,
        taxonomieBasedFallback: true,
        duplicateDetection: true
      }
    };
  }

  // Keep all existing methods but mark as legacy where appropriate
  async clientSideDiscovery(options = {}) {
    console.warn('⚠️ Using legacy clientSideDiscovery - consider upgrading to enhancedClientSideDiscovery');
    return this.enhancedClientSideDiscovery(options);
  }

  async testRun() {
    console.warn('⚠️ Using legacy testRun - consider upgrading to enhancedTestRun');
    return this.enhancedTestRun();
  }

  getStatus() {
    console.warn('⚠️ Using legacy getStatus - consider upgrading to getEnhancedStatus');
    return this.getEnhancedStatus();
  }

  // ... [Keep all other existing methods for backward compatibility]
  // [Previous methods: startMegaDiscovery, startProgressMonitoring, getSessionStatus,
  //  getDiscoveredExercises, approveExercise, getStats, calculateQualityScore,
  //  calculateAverageQuality, removeDuplicateExercises, createSimilarityKey,
  //  callOpenAI, sleep, stop]

  // ============================================
  // EXISTING METHODS (unchanged for compatibility)
  // ============================================

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

  async startProgressMonitoring(sessionId, onProgress, onComplete, onError) {
    const checkInterval = 2000;
    const maxChecks = 300;
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

        if (session.status === 'failed') {
          console.error('❌ MEGA Discovery failed on server');
          this.isScanning = false;

          if (onError) {
            onError(new Error('Server-side discovery failed'));
          }
          return;
        }

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

    setTimeout(monitor, checkInterval);
  }

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

  async getDiscoveredExercises(sessionId = null, filters = {}) {
    try {
      const params = new URLSearchParams();

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

  calculateQualityScore(exercise) {
    let score = 0;

    if (exercise.name && exercise.name.length > 8) score += 20;
    if (exercise.description && exercise.description.length > 30) score += 15;
    if (exercise.instructions && exercise.instructions.length >= 3) score += 20;

    if (exercise.benefits && exercise.benefits.length >= 2) score += 15;
    if (exercise.coachingTips && exercise.coachingTips.length >= 2) score += 10;
    if (exercise.setRepGuidelines && exercise.setRepGuidelines.length > 10) score += 10;

    if (exercise.category && ['strength', 'endurance', 'balance', 'mobility'].includes(exercise.category)) score += 5;
    if (exercise.difficulty && ['beginner', 'intermediate', 'advanced'].includes(exercise.difficulty)) score += 5;

    return Math.min(score, 100);
  }

  calculateAverageQuality(exercises) {
    if (exercises.length === 0) return 0;
    const totalScore = exercises.reduce((sum, ex) => sum + (ex.qualityScore || 0), 0);
    return totalScore / exercises.length;
  }

  removeDuplicateExercises(exercises) {
    const seen = new Map();
    const unique = [];

    for (const exercise of exercises) {
      const key = this.createSimilarityKey(exercise);

      if (!seen.has(key)) {
        seen.set(key, exercise);
        unique.push(exercise);
      } else {
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

  createSimilarityKey(exercise) {
    const nameWords = exercise.name.toLowerCase().split(' ').sort();
    const muscleGroup = (exercise.primaryMuscleGroup || '').toLowerCase();
    const category = (exercise.category || '').toLowerCase();

    return `${nameWords.slice(0, 3).join('_')}_${muscleGroup}_${category}`;
  }

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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isScanning = false;
    this.currentSession = null;
    console.log('⏹️ MEGA Scout stopped');
  }

  // Helper methods for new functionality
  isValidCategory(category) {
    return ['strength', 'power', 'endurance', 'balance', 'mobility', 'sport_specific'].includes(category);
  }

  isValidDifficulty(difficulty) {
    return ['beginner', 'intermediate', 'advanced', 'elite'].includes(difficulty);
  }

  matchesFitnessComponent(exercise, component) {
    const text = `${exercise.name} ${exercise.description} ${exercise.category}`.toLowerCase();

    switch (component) {
      case FITNESS_COMPONENTS.MAX_STRENGTH:
        return text.includes('strength') || text.includes('heavy') || exercise.category === 'strength';
      case FITNESS_COMPONENTS.POWER:
        return text.includes('power') || text.includes('explosive') || exercise.category === 'power';
      case FITNESS_COMPONENTS.ENDURANCE:
        return text.includes('endurance') || text.includes('cardio') || exercise.category === 'endurance';
      case FITNESS_COMPONENTS.BALANCE:
        return text.includes('balance') || text.includes('stability') || exercise.category === 'balance';
      case FITNESS_COMPONENTS.MOBILITY:
        return text.includes('mobility') || text.includes('flexibility') || exercise.category === 'mobility';
      default:
        return false;
    }
  }

  exerciseMatchesFamily(exercise, family) {
    if (!family.searchTerms) return false;

    const exerciseText = `${exercise.name} ${exercise.description}`.toLowerCase();

    return family.searchTerms.some(term =>
      exerciseText.includes(term.toLowerCase()) ||
      term.toLowerCase().includes(exercise.name.toLowerCase().split(' ')[0])
    );
  }

  calculateMatchConfidence(exercise, family) {
    let confidence = 0.5; // base confidence

    if (family.searchTerms) {
      const matches = family.searchTerms.filter(term =>
        exercise.name.toLowerCase().includes(term.toLowerCase())
      );
      confidence += (matches.length / family.searchTerms.length) * 0.4;
    }

    return Math.min(confidence, 1.0);
  }

  determinePurpose(exercise, context) {
    if (context.purpose) return context.purpose;

    const text = `${exercise.name} ${exercise.description}`.toLowerCase();

    if (text.includes('competition') || text.includes('powerlifting')) return EXERCISE_PURPOSES.COMPETITION;
    if (text.includes('muscle') || text.includes('hypertrophy')) return EXERCISE_PURPOSES.HYPERTROPHY;
    if (text.includes('power') || text.includes('explosive')) return EXERCISE_PURPOSES.POWER_DEVELOPMENT;
    if (text.includes('conditioning') || text.includes('cardio')) return EXERCISE_PURPOSES.CONDITIONING;
    if (text.includes('mobility') || text.includes('flexibility')) return EXERCISE_PURPOSES.MOBILITY;

    return EXERCISE_PURPOSES.STRENGTH_BUILDING; // default
  }

  mapToTaxonomyFamily(exercise) {
    const text = exercise.name.toLowerCase();

    if (text.includes('squat')) return 'squatFamily';
    if (text.includes('deadlift')) return 'deadliftFamily';
    if (text.includes('bench')) return 'benchFamily';
    if (text.includes('press')) return 'overheadPressFamily';
    if (text.includes('pull') && text.includes('up')) return 'pullUpFamily';
    if (text.includes('row')) return 'rowingFamily';

    return 'unknown';
  }

  determineVariationType(exercise) {
    const text = exercise.name.toLowerCase();

    if (text.includes('pause')) return 'pause';
    if (text.includes('pin')) return 'pin';
    if (text.includes('deficit')) return 'deficit';
    if (text.includes('close') || text.includes('wide')) return 'grip_variation';
    if (text.includes('single') || text.includes('unilateral')) return 'unilateral';
    if (text.includes('explosive') || text.includes('speed')) return 'tempo';

    return 'standard';
  }

  generateVariationInstructions(variation) {
    return [
      `Set up for ${variation.name || 'this variation'}`,
      'Focus on the specific technique modifications',
      'Maintain control throughout the movement',
      'Complete the exercise with proper form'
    ];
  }

  inferSetRepFromFamily(family) {
    if (family.fitnessComponents) {
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.MAX_STRENGTH)) {
        return '3-5 sets of 1-5 reps at 85-95% 1RM';
      }
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.POWER)) {
        return '3-6 sets of 3-6 reps with explosive intent';
      }
      if (family.fitnessComponents.includes(FITNESS_COMPONENTS.HYPERTROPHY)) {
        return '3-4 sets of 6-12 reps with moderate weight';
      }
    }
    return '3 sets of 8-12 reps';
  }

  generateGenericEnhancedFallback(searchTerm, count, context) {
    // Implementation for generic enhanced fallback when no taxonomy match is found
    const exercises = [];

    for (let i = 0; i < count; i++) {
      exercises.push({
        name: `${this.capitalizeWords(searchTerm)} ${i === 0 ? 'Foundation' : 'Variation ' + i}`,
        description: `Comprehensive ${searchTerm} exercise designed for optimal performance development and skill acquisition.`,
        category: context.fitnessComponentFilter || 'strength',
        primaryMuscleGroup: 'Full Body',
        equipment: 'Variable',
        difficulty: i === 0 ? 'intermediate' : 'advanced',
        instructions: [
          `Prepare for ${searchTerm} exercise`,
          'Establish proper positioning and posture',
          'Execute movement with controlled technique',
          'Complete full range of motion',
          'Return to starting position safely'
        ],
        benefits: ['Enhanced performance', 'Improved movement quality'],
        setRepGuidelines: '3 sets of 8-12 repetitions',
        coachingTips: ['Focus on quality over quantity', 'Progress gradually'],
        searchId: `generic_fallback_${Date.now()}_${i}`,
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'Generic Enhanced Fallback',
        originalSearchTerm: searchTerm,
        searchContext: context,
        qualityScore: 70,
        relevantSports: [],
        fitnessComponents: [context.fitnessComponentFilter || FITNESS_COMPONENTS.MAX_STRENGTH],
        fallbackQuality: 'medium'
      });
    }

    return exercises;
  }
}

export default MegaAIScout;