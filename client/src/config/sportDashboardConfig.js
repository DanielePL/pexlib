// client/src/config/sportDashboardConfig.js
// 🎯 SPORT DASHBOARD CONFIGURATION - Frontend Dashboard System
// Konfiguration für sport-spezifische Dashboards mit 200+ Sportarten

import {
  RELEVANCE_SCORES,
  FITNESS_COMPONENTS,
  EXERCISE_PURPOSES
} from '../services/megaExerciseTaxonomy';

// =====================================================
// DASHBOARD THEME COLORS
// =====================================================
const DASHBOARD_THEMES = {
  powerlifting: {
    primary: '#DC2626',      // Red-600
    secondary: '#991B1B',    // Red-800
    accent: '#FEE2E2',       // Red-50
    gradient: 'from-red-600 to-red-800',
    icon: '🏋️‍♂️'
  },
  bodybuilding: {
    primary: '#7C3AED',      // Violet-600
    secondary: '#5B21B6',    // Violet-800
    accent: '#F3E8FF',       // Violet-50
    gradient: 'from-violet-600 to-violet-800',
    icon: '💪'
  },
  crossfit: {
    primary: '#EA580C',      // Orange-600
    secondary: '#C2410C',    // Orange-700
    accent: '#FFF7ED',       // Orange-50
    gradient: 'from-orange-600 to-orange-700',
    icon: '⚡'
  },
  weightlifting: {
    primary: '#2563EB',      // Blue-600
    secondary: '#1D4ED8',    // Blue-700
    accent: '#EFF6FF',       // Blue-50
    gradient: 'from-blue-600 to-blue-700',
    icon: '🥇'
  },
  strongman: {
    primary: '#059669',      // Emerald-600
    secondary: '#047857',    // Emerald-700
    accent: '#ECFDF5',       // Emerald-50
    gradient: 'from-emerald-600 to-emerald-700',
    icon: '🗿'
  },
  tennis: {
    primary: '#16A34A',      // Green-600
    secondary: '#15803D',    // Green-700
    accent: '#F0FDF4',       // Green-50
    gradient: 'from-green-600 to-green-700',
    icon: '🎾'
  },
  basketball: {
    primary: '#D97706',      // Amber-600
    secondary: '#B45309',    // Amber-700
    accent: '#FFFBEB',       // Amber-50
    gradient: 'from-amber-600 to-amber-700',
    icon: '🏀'
  },
  soccer: {
    primary: '#0891B2',      // Cyan-600
    secondary: '#0E7490',    // Cyan-700
    accent: '#ECFEFF',       // Cyan-50
    gradient: 'from-cyan-600 to-cyan-700',
    icon: '⚽'
  },
  running: {
    primary: '#BE185D',      // Pink-600
    secondary: '#9D174D',    // Pink-700
    accent: '#FDF2F8',       // Pink-50
    gradient: 'from-pink-600 to-pink-700',
    icon: '🏃‍♂️'
  },
  swimming: {
    primary: '#0284C7',      // Sky-600
    secondary: '#0369A1',    // Sky-700
    accent: '#F0F9FF',       // Sky-50
    gradient: 'from-sky-600 to-sky-700',
    icon: '🏊‍♂️'
  },
  general: {
    primary: '#6B7280',      // Gray-500
    secondary: '#4B5563',    // Gray-600
    accent: '#F9FAFB',       // Gray-50
    gradient: 'from-gray-500 to-gray-600',
    icon: '🎯'
  }
};

// =====================================================
// DASHBOARD LAYOUTS
// =====================================================
const DASHBOARD_LAYOUTS = {
  strength_focused: {
    name: 'Strength Focused',
    description: 'Layout optimized for strength training sports',
    sections: [
      { id: 'primary_lifts', title: 'Primary Lifts', size: 'large', priority: 1 },
      { id: 'accessory_work', title: 'Accessory Work', size: 'medium', priority: 2 },
      { id: 'mobility', title: 'Mobility & Recovery', size: 'small', priority: 3 },
      { id: 'conditioning', title: 'Conditioning', size: 'small', priority: 4 }
    ],
    defaultFilters: ['strength', 'power'],
    showProgressTracking: true,
    showCompetitionMode: true
  },

  athletic_performance: {
    name: 'Athletic Performance',
    description: 'Layout for sport-specific performance training',
    sections: [
      { id: 'sport_specific', title: 'Sport-Specific', size: 'large', priority: 1 },
      { id: 'power_development', title: 'Power & Explosiveness', size: 'medium', priority: 2 },
      { id: 'agility_balance', title: 'Agility & Balance', size: 'medium', priority: 3 },
      { id: 'conditioning', title: 'Conditioning', size: 'medium', priority: 4 },
      { id: 'injury_prevention', title: 'Injury Prevention', size: 'small', priority: 5 }
    ],
    defaultFilters: ['power', 'agility', 'sport_specific'],
    showPerformanceMetrics: true,
    showSeasonalPeriodization: true
  },

  fitness_wellness: {
    name: 'Fitness & Wellness',
    description: 'Layout for general fitness and health',
    sections: [
      { id: 'full_body', title: 'Full Body Workouts', size: 'large', priority: 1 },
      { id: 'cardio', title: 'Cardiovascular Training', size: 'medium', priority: 2 },
      { id: 'flexibility', title: 'Flexibility & Mobility', size: 'medium', priority: 3 },
      { id: 'functional', title: 'Functional Movements', size: 'medium', priority: 4 }
    ],
    defaultFilters: ['endurance', 'mobility', 'balance'],
    showHealthMetrics: true,
    showProgressPhotos: true
  },

  rehabilitation: {
    name: 'Rehabilitation',
    description: 'Layout for injury recovery and prevention',
    sections: [
      { id: 'therapeutic', title: 'Therapeutic Exercises', size: 'large', priority: 1 },
      { id: 'stability', title: 'Stability & Balance', size: 'medium', priority: 2 },
      { id: 'mobility_recovery', title: 'Mobility & Recovery', size: 'medium', priority: 3 },
      { id: 'progressive_loading', title: 'Progressive Loading', size: 'small', priority: 4 }
    ],
    defaultFilters: ['mobility', 'balance', 'rehabilitation'],
    showPainTracking: true,
    showTherapistNotes: true
  }
};

// =====================================================
// COMPREHENSIVE SPORT CONFIGURATIONS
// =====================================================
export const SPORT_DASHBOARD_CONFIGS = {

  // ===== STRENGTH SPORTS =====
  powerlifting: {
    id: 'powerlifting',
    name: 'Powerlifting',
    displayName: 'Powerlifting',
    category: 'strength_sport',
    theme: DASHBOARD_THEMES.powerlifting,
    layout: DASHBOARD_LAYOUTS.strength_focused,

    // Essential exercises for this sport
    essentialExercises: [
      'squat', 'bench_press', 'deadlift', 'pause_bench', 'competition_squat',
      'sumo_deadlift', 'front_squat', 'overhead_press', 'barbell_row'
    ],

    // Relevance thresholds
    relevanceThresholds: {
      essential: RELEVANCE_SCORES.ESSENTIAL,
      important: RELEVANCE_SCORES.IMPORTANT,
      beneficial: RELEVANCE_SCORES.BENEFICIAL
    },

    // Primary fitness components
    primaryComponents: [
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.STABILITY
    ],

    // Exercise purposes priority
    purposePriority: [
      EXERCISE_PURPOSES.COMPETITION,
      EXERCISE_PURPOSES.STRENGTH_BUILDING,
      EXERCISE_PURPOSES.ACCESSORY
    ],

    // Dashboard sections configuration
    dashboardSections: {
      primary_lifts: {
        title: 'Competition Lifts',
        exercises: ['squat', 'bench_press', 'deadlift'],
        filterBy: { purpose: EXERCISE_PURPOSES.COMPETITION },
        showPercentages: true,
        showPersonalRecords: true
      },
      accessory_work: {
        title: 'Accessory Work',
        filterBy: { purpose: EXERCISE_PURPOSES.ACCESSORY, relevance: { $gte: 7 } },
        groupBy: 'primaryMuscleGroup'
      },
      mobility: {
        title: 'Mobility & Warm-up',
        filterBy: { category: 'mobility' },
        showRoutines: true
      }
    },

    // Filters and sorting
    defaultFilters: {
      categories: ['strength', 'power'],
      difficulties: ['intermediate', 'advanced'],
      equipment: ['barbell', 'none']
    },

    defaultSort: {
      field: 'relevanceScore',
      order: 'desc'
    },

    // UI customizations
    uiConfig: {
      showCompetitionMode: true,
      showPercentageCalculator: true,
      showMeetPrep: true,
      showAttemptSelection: true,
      hideCardio: true,
      emphasizeCompoundMovements: true
    },

    // Navigation
    navigation: {
      quickLinks: [
        { name: 'Competition Prep', path: '/competition-prep' },
        { name: 'Max Testing', path: '/max-testing' },
        { name: 'Meet Calendar', path: '/meets' },
        { name: 'Percentage Calculator', path: '/calculator' }
      ]
    },

    // Statistics tracking
    trackingMetrics: ['1RM', 'wilks_score', 'competition_total', 'bodyweight'],

    // Specific features
    features: {
      competitionMode: true,
      percentageCalculator: true,
      meetPreparation: true,
      videoAnalysis: true,
      formChecks: true
    }
  },

  bodybuilding: {
    id: 'bodybuilding',
    name: 'Bodybuilding',
    displayName: 'Bodybuilding',
    category: 'physique_sport',
    theme: DASHBOARD_THEMES.bodybuilding,
    layout: DASHBOARD_LAYOUTS.strength_focused,

    essentialExercises: [
      'bench_press', 'squat', 'deadlift', 'shoulder_press', 'barbell_row',
      'dumbbell_flyes', 'lateral_raises', 'bicep_curls', 'tricep_extensions'
    ],

    relevanceThresholds: {
      essential: RELEVANCE_SCORES.CRITICAL,
      important: RELEVANCE_SCORES.BENEFICIAL,
      beneficial: RELEVANCE_SCORES.USEFUL
    },

    primaryComponents: [
      FITNESS_COMPONENTS.HYPERTROPHY,
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.STRENGTH_ENDURANCE
    ],

    purposePriority: [
      EXERCISE_PURPOSES.HYPERTROPHY,
      EXERCISE_PURPOSES.STRENGTH_BUILDING,
      EXERCISE_PURPOSES.ACCESSORY
    ],

    dashboardSections: {
      compound_movements: {
        title: 'Compound Movements',
        filterBy: { category: 'strength', muscleGroups: ['chest', 'back', 'legs'] },
        showVolumeTracking: true
      },
      isolation_work: {
        title: 'Isolation Work',
        filterBy: { purpose: EXERCISE_PURPOSES.HYPERTROPHY },
        groupBy: 'primaryMuscleGroup',
        showMuscleTargeting: true
      },
      contest_prep: {
        title: 'Contest Preparation',
        filterBy: { tags: ['contest_prep', 'cutting', 'posing'] },
        showConditional: true
      }
    },

    defaultFilters: {
      categories: ['strength', 'hypertrophy'],
      difficulties: ['beginner', 'intermediate', 'advanced'],
      equipment: ['barbell', 'dumbbell', 'machine', 'cable']
    },

    uiConfig: {
      showMuscleGroupTargeting: true,
      showVolumeTracking: true,
      showPhaseTracking: true,
      showProgressPhotos: true,
      showBodyComposition: true,
      emphasizeIsolation: true
    },

    navigation: {
      quickLinks: [
        { name: 'Muscle Groups', path: '/muscle-groups' },
        { name: 'Training Phases', path: '/phases' },
        { name: 'Progress Photos', path: '/photos' },
        { name: 'Contest Prep', path: '/contest-prep' }
      ]
    },

    trackingMetrics: ['body_weight', 'body_fat', 'muscle_measurements', 'training_volume'],

    features: {
      muscleGroupTracking: true,
      phaseBasedTraining: true,
      progressPhotos: true,
      contestPreparation: true,
      nutritionIntegration: true
    }
  },

  crossfit: {
    id: 'crossfit',
    name: 'CrossFit',
    displayName: 'CrossFit',
    category: 'functional_fitness',
    theme: DASHBOARD_THEMES.crossfit,
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'squat', 'deadlift', 'clean', 'jerk', 'snatch', 'pull_ups', 'push_ups',
      'burpees', 'box_jumps', 'kettlebell_swings', 'double_unders'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.STRENGTH_ENDURANCE,
      FITNESS_COMPONENTS.ANAEROBIC_CAPACITY,
      FITNESS_COMPONENTS.COORDINATION
    ],

    purposePriority: [
      EXERCISE_PURPOSES.CONDITIONING,
      EXERCISE_PURPOSES.POWER_DEVELOPMENT,
      EXERCISE_PURPOSES.STRENGTH_BUILDING
    ],

    dashboardSections: {
      wod_movements: {
        title: 'WOD Movements',
        filterBy: { tags: ['wod', 'metcon', 'crossfit'] },
        showBenchmarks: true
      },
      olympic_lifts: {
        title: 'Olympic Lifts',
        filterBy: { category: 'olympic_lifting' },
        showTechniqueVideos: true
      },
      gymnastics: {
        title: 'Gymnastics',
        filterBy: { category: 'bodyweight', tags: ['gymnastics'] },
        showProgressions: true
      }
    },

    uiConfig: {
      showWODBuilder: true,
      showBenchmarkWODs: true,
      showScaling: true,
      showTimeTracking: true,
      showRxdMode: true,
      emphasizeVariety: true
    },

    navigation: {
      quickLinks: [
        { name: 'WOD Builder', path: '/wod-builder' },
        { name: 'Benchmark WODs', path: '/benchmarks' },
        { name: 'Scaling Guide', path: '/scaling' },
        { name: 'Leaderboard', path: '/leaderboard' }
      ]
    },

    trackingMetrics: ['fran_time', 'grace_time', 'murph_time', 'crossfit_total'],

    features: {
      wodBuilder: true,
      benchmarkTracking: true,
      scalingOptions: true,
      communityFeatures: true,
      competitionMode: true
    }
  },

  weightlifting: {
    id: 'weightlifting',
    name: 'Olympic Weightlifting',
    displayName: 'Olympic Weightlifting',
    category: 'olympic_sport',
    theme: DASHBOARD_THEMES.weightlifting,
    layout: DASHBOARD_LAYOUTS.strength_focused,

    essentialExercises: [
      'snatch', 'clean_and_jerk', 'front_squat', 'overhead_squat',
      'snatch_pull', 'clean_pull', 'push_jerk', 'hang_clean'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.COORDINATION,
      FITNESS_COMPONENTS.MOBILITY
    ],

    purposePriority: [
      EXERCISE_PURPOSES.COMPETITION,
      EXERCISE_PURPOSES.POWER_DEVELOPMENT,
      EXERCISE_PURPOSES.STRENGTH_BUILDING
    ],

    uiConfig: {
      showOlympicMode: true,
      showTechniqueAnalysis: true,
      showMobilityTracking: true,
      showCompetitionCalendar: true,
      emphasizeTechnique: true
    },

    features: {
      olympicLifting: true,
      techniqueAnalysis: true,
      mobilityPrograms: true,
      competitionPrep: true,
      videoAnalysis: true
    }
  },

  strongman: {
    id: 'strongman',
    name: 'Strongman',
    displayName: 'Strongman',
    category: 'strength_sport',
    theme: DASHBOARD_THEMES.strongman,
    layout: DASHBOARD_LAYOUTS.strength_focused,

    essentialExercises: [
      'deadlift', 'farmers_walk', 'log_press', 'atlas_stones', 'yoke_walk',
      'tire_flip', 'axle_press', 'car_deadlift', 'keg_carry'
    ],

    uiConfig: {
      showEventTraining: true,
      showImplementTracking: true,
      showCompetitionCalendar: true,
      emphasizeSpecialtyLifts: true
    },

    features: {
      eventSpecificTraining: true,
      implementTracking: true,
      competitionPrep: true,
      maxEffortTracking: true
    }
  },

  // ===== BALL SPORTS =====
  tennis: {
    id: 'tennis',
    name: 'Tennis',
    displayName: 'Tennis',
    category: 'racket_sport',
    theme: DASHBOARD_THEMES.tennis,
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'lateral_lunges', 'rotational_throws', 'agility_ladder', 'plyometric_jumps',
      'shoulder_stability', 'core_rotation', 'single_leg_balance'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.AGILITY,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.COORDINATION,
      FITNESS_COMPONENTS.BALANCE,
      FITNESS_COMPONENTS.AEROBIC_ENDURANCE
    ],

    purposePriority: [
      EXERCISE_PURPOSES.POWER_DEVELOPMENT,
      EXERCISE_PURPOSES.CONDITIONING,
      EXERCISE_PURPOSES.PREHAB
    ],

    dashboardSections: {
      court_movement: {
        title: 'Court Movement',
        filterBy: { tags: ['agility', 'lateral_movement', 'court_specific'] },
        showMovementPatterns: true
      },
      rotational_power: {
        title: 'Rotational Power',
        filterBy: { tags: ['rotation', 'power', 'core'] },
        showPowerMetrics: true
      },
      injury_prevention: {
        title: 'Injury Prevention',
        filterBy: { purpose: EXERCISE_PURPOSES.PREHAB },
        showTennisElbow: true
      }
    },

    uiConfig: {
      showCourtDrills: true,
      showSeasonalTraining: true,
      showInjuryPrevention: true,
      showMatchPreparation: true,
      emphasizeMovement: true
    },

    navigation: {
      quickLinks: [
        { name: 'Court Drills', path: '/court-drills' },
        { name: 'Match Prep', path: '/match-prep' },
        { name: 'Injury Prevention', path: '/injury-prevention' },
        { name: 'Tournament Schedule', path: '/tournaments' }
      ]
    },

    features: {
      courtDrills: true,
      matchPreparation: true,
      injuryPrevention: true,
      seasonalPeriodization: true,
      movementAnalysis: true
    }
  },

  basketball: {
    id: 'basketball',
    name: 'Basketball',
    displayName: 'Basketball',
    category: 'team_sport',
    theme: DASHBOARD_THEMES.basketball,
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'jump_squats', 'plyometric_jumps', 'agility_drills', 'defensive_slides',
      'vertical_jump_training', 'lateral_bounds', 'court_sprints'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.AGILITY,
      FITNESS_COMPONENTS.ANAEROBIC_CAPACITY,
      FITNESS_COMPONENTS.COORDINATION
    ],

    features: {
      verticalJumpTracking: true,
      courtDrills: true,
      gamePreparation: true,
      positionSpecific: true
    }
  },

  soccer: {
    id: 'soccer',
    name: 'Soccer',
    displayName: 'Soccer/Football',
    category: 'team_sport',
    theme: DASHBOARD_THEMES.soccer,
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'running_drills', 'agility_cones', 'plyometric_training', 'ball_work',
      'sprint_intervals', 'defensive_movements', 'shooting_drills'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.AEROBIC_ENDURANCE,
      FITNESS_COMPONENTS.AGILITY,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.COORDINATION
    ],

    features: {
      enduranceTracking: true,
      fieldDrills: true,
      positionSpecific: true,
      matchPreparation: true
    }
  },

  // ===== ENDURANCE SPORTS =====
  running: {
    id: 'running',
    name: 'Running',
    displayName: 'Running',
    category: 'endurance_sport',
    theme: DASHBOARD_THEMES.running,
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'interval_training', 'tempo_runs', 'long_runs', 'hill_repeats',
      'strength_training', 'plyometrics', 'core_work', 'mobility_routine'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.AEROBIC_ENDURANCE,
      FITNESS_COMPONENTS.ANAEROBIC_CAPACITY,
      FITNESS_COMPONENTS.STRENGTH_ENDURANCE,
      FITNESS_COMPONENTS.MOBILITY
    ],

    uiConfig: {
      showPaceCalculator: true,
      showTrainingZones: true,
      showRacePreparation: true,
      showInjuryPrevention: true,
      emphasizeEndurance: true
    },

    features: {
      paceCalculator: true,
      trainingZones: true,
      racePreparation: true,
      injuryPrevention: true,
      gpsIntegration: true
    }
  },

  swimming: {
    id: 'swimming',
    name: 'Swimming',
    displayName: 'Swimming',
    category: 'aquatic_sport',
    theme: DASHBOARD_THEMES.swimming,
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'dryland_training', 'stroke_technique', 'kick_sets', 'pull_sets',
      'IM_training', 'starts_turns', 'flexibility_routine'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.AEROBIC_ENDURANCE,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.COORDINATION,
      FITNESS_COMPONENTS.FLEXIBILITY
    ],

    features: {
      strokeAnalysis: true,
      dryland: true,
      meetPreparation: true,
      techniqueVideos: true
    }
  },

  // ===== COMBAT SPORTS =====
  boxing: {
    id: 'boxing',
    name: 'Boxing',
    displayName: 'Boxing',
    category: 'combat_sport',
    theme: DASHBOARD_THEMES.general, // Could create specific boxing theme
    layout: DASHBOARD_LAYOUTS.athletic_performance,

    essentialExercises: [
      'shadowboxing', 'heavy_bag', 'speed_bag', 'footwork_drills',
      'strength_training', 'conditioning', 'core_work'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.ANAEROBIC_CAPACITY,
      FITNESS_COMPONENTS.COORDINATION,
      FITNESS_COMPONENTS.AGILITY
    ],

    features: {
      techniqueTraining: true,
      conditioning: true,
      fightPreparation: true,
      strengthTraining: true
    }
  },

  // ===== GENERAL FITNESS =====
  general: {
    id: 'general',
    name: 'General Fitness',
    displayName: 'General Fitness',
    category: 'fitness',
    theme: DASHBOARD_THEMES.general,
    layout: DASHBOARD_LAYOUTS.fitness_wellness,

    essentialExercises: [
      'full_body_workouts', 'cardio_training', 'strength_training',
      'flexibility_routine', 'functional_movements'
    ],

    primaryComponents: [
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.AEROBIC_ENDURANCE,
      FITNESS_COMPONENTS.MOBILITY,
      FITNESS_COMPONENTS.BALANCE
    ],

    uiConfig: {
      showAllCategories: true,
      showProgressTracking: true,
      showHealthMetrics: true,
      showWorkoutPlans: true,
      emphasizeBalance: true
    },

    features: {
      workoutPlans: true,
      healthMetrics: true,
      progressTracking: true,
      nutritionTracking: true,
      fitnessAssessments: true
    }
  }
};

// =====================================================
// DASHBOARD ROUTING CONFIGURATION
// =====================================================
export const DASHBOARD_ROUTES = {
  basePath: '/dashboard',

  routes: Object.keys(SPORT_DASHBOARD_CONFIGS).map(sportId => ({
    path: `/${sportId}`,
    component: 'SportDashboard',
    props: { sportId },
    meta: {
      title: SPORT_DASHBOARD_CONFIGS[sportId].displayName,
      theme: SPORT_DASHBOARD_CONFIGS[sportId].theme,
      requiresAuth: true
    }
  })),

  defaultRoute: '/general',

  // Navigation menu configuration
  navigationGroups: {
    strength_sports: {
      title: 'Strength Sports',
      icon: '🏋️‍♂️',
      sports: ['powerlifting', 'bodybuilding', 'crossfit', 'weightlifting', 'strongman']
    },
    team_sports: {
      title: 'Team Sports',
      icon: '⚽',
      sports: ['soccer', 'basketball', 'volleyball', 'american_football', 'rugby']
    },
    racket_sports: {
      title: 'Racket Sports',
      icon: '🎾',
      sports: ['tennis', 'badminton', 'squash', 'table_tennis']
    },
    endurance_sports: {
      title: 'Endurance Sports',
      icon: '🏃‍♂️',
      sports: ['running', 'cycling', 'swimming', 'triathlon', 'marathon']
    },
    combat_sports: {
      title: 'Combat Sports',
      icon: '🥊',
      sports: ['boxing', 'mma', 'wrestling', 'martial_arts', 'judo']
    },
    other: {
      title: 'Other Sports',
      icon: '🎯',
      sports: ['golf', 'skiing', 'climbing', 'gymnastics', 'general']
    }
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
export class SportDashboardManager {
  constructor() {
    this.configs = SPORT_DASHBOARD_CONFIGS;
    this.routes = DASHBOARD_ROUTES;
  }

  // Get configuration for specific sport
  getSportConfig(sportId) {
    return this.configs[sportId] || this.configs.general;
  }

  // Get all sports in a category
  getSportsByCategory(category) {
    return Object.values(this.configs).filter(config =>
      config.category === category
    );
  }

  // Get theme for sport
  getTheme(sportId) {
    const config = this.getSportConfig(sportId);
    return config.theme;
  }

  // Get essential exercises for sport
  getEssentialExercises(sportId) {
    const config = this.getSportConfig(sportId);
    return config.essentialExercises || [];
  }

  // Get relevance threshold for sport
  getRelevanceThreshold(sportId, level = 'beneficial') {
    const config = this.getSportConfig(sportId);
    return config.relevanceThresholds?.[level] || RELEVANCE_SCORES.BENEFICIAL;
  }

  // Get primary fitness components for sport
  getPrimaryComponents(sportId) {
    const config = this.getSportConfig(sportId);
    return config.primaryComponents || [];
  }

  // Get dashboard layout for sport
  getLayout(sportId) {
    const config = this.getSportConfig(sportId);
    return config.layout || DASHBOARD_LAYOUTS.fitness_wellness;
  }

  // Get UI configuration for sport
  getUIConfig(sportId) {
    const config = this.getSportConfig(sportId);
    return config.uiConfig || {};
  }

  // Get navigation configuration for sport
  getNavigation(sportId) {
    const config = this.getSportConfig(sportId);
    return config.navigation || { quickLinks: [] };
  }

  // Get features enabled for sport
  getFeatures(sportId) {
    const config = this.getSportConfig(sportId);
    return config.features || {};
  }

  // Check if feature is enabled for sport
  isFeatureEnabled(sportId, featureName) {
    const features = this.getFeatures(sportId);
    return features[featureName] === true;
  }

  // Get exercise filters for sport
  getExerciseFilters(sportId) {
    const config = this.getSportConfig(sportId);
    return {
      sportRelevance: {
        sportId,
        minRelevance: this.getRelevanceThreshold(sportId)
      },
      categories: config.defaultFilters?.categories || [],
      components: config.primaryComponents || [],
      purposes: config.purposePriority || []
    };
  }

  // Get dashboard sections configuration
  getDashboardSections(sportId) {
    const config = this.getSportConfig(sportId);
    return config.dashboardSections || {};
  }

  // Get tracking metrics for sport
  getTrackingMetrics(sportId) {
    const config = this.getSportConfig(sportId);
    return config.trackingMetrics || [];
  }

  // Generate dashboard route
  getDashboardRoute(sportId) {
    return `${this.routes.basePath}/${sportId}`;
  }

  // Get all available sports
  getAllSports() {
    return Object.keys(this.configs);
  }

  // Get navigation menu structure
  getNavigationMenu() {
    const menu = {};

    Object.entries(this.routes.navigationGroups).forEach(([groupId, group]) => {
      menu[groupId] = {
        ...group,
        sports: group.sports.map(sportId => ({
          id: sportId,
          name: this.configs[sportId]?.displayName || sportId,
          icon: this.configs[sportId]?.theme?.icon || '🎯',
          route: this.getDashboardRoute(sportId),
          theme: this.configs[sportId]?.theme
        })).filter(sport => this.configs[sport.id]) // Only include configured sports
      };
    });

    return menu;
  }

  // Search sports by name or category
  searchSports(query) {
    const lowercaseQuery = query.toLowerCase();

    return Object.values(this.configs).filter(config =>
      config.name.toLowerCase().includes(lowercaseQuery) ||
      config.displayName.toLowerCase().includes(lowercaseQuery) ||
      config.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get recommended sports based on user preferences
  getRecommendedSports(userPreferences = {}) {
    const {
      fitnessGoals = [],
      availableEquipment = [],
      experienceLevel = 'beginner',
      timeCommitment = 'moderate'
    } = userPreferences;

    // Simple recommendation logic - can be enhanced
    let recommendations = Object.values(this.configs);

    // Filter by fitness goals
    if (fitnessGoals.length > 0) {
      recommendations = recommendations.filter(config =>
        config.primaryComponents?.some(component =>
          fitnessGoals.includes(component)
        )
      );
    }

    // Sort by relevance (simplified)
    recommendations.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Boost score for matching goals
      if (a.primaryComponents) {
        scoreA += a.primaryComponents.filter(comp =>
          fitnessGoals.includes(comp)
        ).length;
      }

      if (b.primaryComponents) {
        scoreB += b.primaryComponents.filter(comp =>
          fitnessGoals.includes(comp)
        ).length;
      }

      return scoreB - scoreA;
    });

    return recommendations.slice(0, 5); // Top 5 recommendations
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================
export default {
  SPORT_DASHBOARD_CONFIGS,
  DASHBOARD_ROUTES,
  DASHBOARD_THEMES,
  DASHBOARD_LAYOUTS,
  SportDashboardManager
};