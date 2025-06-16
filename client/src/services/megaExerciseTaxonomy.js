// client/src/services/megaExerciseTaxonomy.js
// 🚀 MEGA EXERCISE TAXONOMIE - Foundation für 50,000+ Übungen
// Systematische Erfassung aller Kraftsport-Übungen mit Sport-Zuordnung

// =====================================================
// SPORT RELEVANCE SCORING SYSTEM
// =====================================================
const RELEVANCE_SCORES = {
  ESSENTIAL: 10,    // Competition lift, absolut notwendig
  CRITICAL: 9,      // Kernübung für Sport-Performance
  IMPORTANT: 8,     // Sehr wichtig für Entwicklung
  BENEFICIAL: 7,    // Deutlicher Vorteil
  USEFUL: 6,        // Nützlich für allgemeine Fitness
  MODERATE: 5,      // Mäßiger Nutzen
  MINIMAL: 4        // Geringer Nutzen
};

// =====================================================
// KONDITIONSFAKTOREN MAPPING
// =====================================================
const FITNESS_COMPONENTS = {
  MAX_STRENGTH: 'max_strength',
  POWER: 'power',
  HYPERTROPHY: 'hypertrophy',
  STRENGTH_ENDURANCE: 'strength_endurance',
  AEROBIC_ENDURANCE: 'aerobic_endurance',
  ANAEROBIC_CAPACITY: 'anaerobic_capacity',
  BALANCE: 'balance',
  COORDINATION: 'coordination',
  AGILITY: 'agility',
  MOBILITY: 'mobility',
  STABILITY: 'stability',
  FLEXIBILITY: 'flexibility'
};

// =====================================================
// EXERCISE PURPOSE CATEGORIES
// =====================================================
const EXERCISE_PURPOSES = {
  COMPETITION: 'competition_lift',
  STRENGTH_BUILDING: 'strength_building',
  HYPERTROPHY: 'muscle_building',
  POWER_DEVELOPMENT: 'power_development',
  ACCESSORY: 'accessory_work',
  CONDITIONING: 'conditioning',
  MOBILITY: 'mobility_work',
  PREHAB: 'prehabilitation',
  REHAB: 'rehabilitation',
  WARM_UP: 'warm_up',
  COOL_DOWN: 'cool_down'
};

// =====================================================
// MEGA EXERCISE TAXONOMIE - FUNDAMENTAL MOVEMENTS
// =====================================================
export const MEGA_EXERCISE_TAXONOMY = {

  // ===== SQUAT FAMILY =====
  squatFamily: {
    baseExercise: 'Squat',
    description: 'Fundamental compound movement targeting legs, glutes, and core',

    // Sport Relevance Matrix
    sportRelevance: {
      powerlifting: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.COMPETITION },
      weightlifting: { score: RELEVANCE_SCORES.CRITICAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      bodybuilding: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.HYPERTROPHY },
      crossfit: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      strongman: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      powerbuilding: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },

      // Sport-Performance
      tennis: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.POWER_DEVELOPMENT },
      basketball: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.POWER_DEVELOPMENT },
      soccer: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      golf: { score: RELEVANCE_SCORES.USEFUL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      skiing: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      hockey: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      running: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      martial_arts: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      gymnastics: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      swimming: { score: RELEVANCE_SCORES.USEFUL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING }
    },

    // Konditionsfaktoren
    fitnessComponents: [
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.HYPERTROPHY,
      FITNESS_COMPONENTS.BALANCE,
      FITNESS_COMPONENTS.STABILITY
    ],

    // Systematic Variations
    variations: {
      equipment: {
        barbell_back_squat: {
          name: 'Barbell Back Squat',
          equipment: 'barbell',
          difficulty: 'intermediate',
          variations: ['high_bar', 'low_bar', 'safety_bar']
        },
        barbell_front_squat: {
          name: 'Barbell Front Squat',
          equipment: 'barbell',
          difficulty: 'advanced',
          variations: ['clean_grip', 'cross_arm', 'zombie']
        },
        dumbbell_squat: {
          name: 'Dumbbell Squat',
          equipment: 'dumbbell',
          difficulty: 'beginner',
          variations: ['goblet', 'dual_dumbbell']
        },
        kettlebell_squat: {
          name: 'Kettlebell Squat',
          equipment: 'kettlebell',
          difficulty: 'beginner',
          variations: ['goblet', 'dual_kettlebell', 'overhead']
        },
        bodyweight_squat: {
          name: 'Bodyweight Squat',
          equipment: 'none',
          difficulty: 'beginner',
          variations: ['air_squat', 'hindu_squat', 'cossack']
        }
      },

      technique: {
        paused_squat: { pauseLocation: 'bottom', pauseDuration: '2-5 seconds' },
        pin_squat: { startPosition: 'pins', concentric_only: true },
        box_squat: { equipment: 'box', seated_pause: true },
        anderson_squat: { startPosition: 'pins', no_eccentric: true },
        tempo_squat: { tempo: 'controlled', eccentric_focus: true },
        jump_squat: { explosive: true, plyometric: true },
        pulse_squat: { partial_reps: true, bottom_range: true }
      },

      stance: {
        narrow_squat: { stance: 'narrow', target: 'quads' },
        wide_squat: { stance: 'wide', target: 'glutes_adductors' },
        sumo_squat: { stance: 'extra_wide', target: 'inner_thighs' }
      },

      depth: {
        full_squat: { depth: 'ass_to_grass', mobility_required: 'high' },
        parallel_squat: { depth: 'hip_crease_below_knee', standard: 'powerlifting' },
        quarter_squat: { depth: 'partial', use_case: 'overload_training' },
        half_squat: { depth: 'mid_range', use_case: 'strength_specific' }
      }
    },

    // Search Terms für AI Discovery
    searchTerms: [
      'squat exercise', 'back squat', 'front squat', 'squat variations',
      'barbell squat', 'dumbbell squat', 'goblet squat', 'bodyweight squat',
      'low bar squat', 'high bar squat', 'safety bar squat',
      'paused squat', 'pin squat', 'box squat', 'anderson squat',
      'jump squat', 'pulse squat', 'tempo squat',
      'sumo squat', 'wide stance squat', 'narrow squat',
      'overhead squat', 'bulgarian split squat', 'cossack squat',
      'squat form', 'squat technique', 'squat depth', 'squat mobility'
    ]
  },

  // ===== DEADLIFT FAMILY =====
  deadliftFamily: {
    baseExercise: 'Deadlift',
    description: 'Fundamental hip hinge movement, posterior chain dominant',

    sportRelevance: {
      powerlifting: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.COMPETITION },
      strongman: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.COMPETITION },
      weightlifting: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.ACCESSORY },
      bodybuilding: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.HYPERTROPHY },
      crossfit: { score: RELEVANCE_SCORES.CRITICAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      powerbuilding: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },

      // Sport Performance
      martial_arts: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.POWER_DEVELOPMENT },
      wrestling: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      rugby: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      american_football: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      rowing: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      climbing: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING }
    },

    fitnessComponents: [
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.HYPERTROPHY,
      FITNESS_COMPONENTS.STABILITY
    ],

    variations: {
      stance: {
        conventional_deadlift: {
          name: 'Conventional Deadlift',
          stance: 'shoulder_width',
          grip: 'outside_legs',
          target: 'posterior_chain'
        },
        sumo_deadlift: {
          name: 'Sumo Deadlift',
          stance: 'wide',
          grip: 'inside_legs',
          target: 'glutes_quads'
        }
      },

      equipment: {
        barbell_deadlift: { equipment: 'barbell', standard: true },
        trap_bar_deadlift: { equipment: 'trap_bar', beginner_friendly: true },
        dumbbell_deadlift: { equipment: 'dumbbell', versatile: true },
        kettlebell_deadlift: { equipment: 'kettlebell', functional: true }
      },

      range_of_motion: {
        romanian_deadlift: {
          name: 'Romanian Deadlift',
          rom: 'partial',
          start: 'top',
          target: 'hamstrings_glutes'
        },
        stiff_leg_deadlift: {
          name: 'Stiff Leg Deadlift',
          rom: 'partial',
          knee_bend: 'minimal',
          target: 'hamstrings'
        },
        deficit_deadlift: {
          name: 'Deficit Deadlift',
          rom: 'extended',
          platform: 'elevated',
          difficulty: 'advanced'
        },
        rack_pulls: {
          name: 'Rack Pulls',
          rom: 'partial',
          start: 'elevated',
          overload: true
        }
      },

      specialty: {
        pause_deadlift: { pause: 'knee_level', duration: '2-3_seconds' },
        speed_deadlift: { tempo: 'explosive', percentage: '50-70%' },
        single_leg_deadlift: { unilateral: true, balance: 'required' },
        suitcase_deadlift: { grip: 'unilateral', core: 'anti_lateral_flexion' }
      }
    },

    searchTerms: [
      'deadlift exercise', 'conventional deadlift', 'sumo deadlift',
      'romanian deadlift', 'stiff leg deadlift', 'trap bar deadlift',
      'deficit deadlift', 'rack pulls', 'pause deadlift', 'speed deadlift',
      'single leg deadlift', 'suitcase deadlift', 'kettlebell deadlift',
      'deadlift form', 'deadlift technique', 'hip hinge', 'posterior chain'
    ]
  },

  // ===== BENCH PRESS FAMILY =====
  benchFamily: {
    baseExercise: 'Bench Press',
    description: 'Fundamental horizontal pushing movement for upper body strength',

    sportRelevance: {
      powerlifting: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.COMPETITION },
      bodybuilding: { score: RELEVANCE_SCORES.CRITICAL, purpose: EXERCISE_PURPOSES.HYPERTROPHY },
      powerbuilding: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      american_football: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      rugby: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      martial_arts: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      swimming: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING }
    },

    fitnessComponents: [
      FITNESS_COMPONENTS.MAX_STRENGTH,
      FITNESS_COMPONENTS.POWER,
      FITNESS_COMPONENTS.HYPERTROPHY,
      FITNESS_COMPONENTS.STABILITY
    ],

    variations: {
      angle: {
        flat_bench: { angle: '0_degrees', target: 'chest_triceps' },
        incline_bench: { angle: '30-45_degrees', target: 'upper_chest' },
        decline_bench: { angle: 'negative_15-30_degrees', target: 'lower_chest' }
      },

      equipment: {
        barbell_bench: { equipment: 'barbell', standard: true },
        dumbbell_bench: { equipment: 'dumbbell', unilateral: true },
        kettlebell_bench: { equipment: 'kettlebell', unstable: true },
        machine_press: { equipment: 'machine', guided: true }
      },

      grip: {
        close_grip_bench: { grip: 'narrow', target: 'triceps' },
        wide_grip_bench: { grip: 'wide', target: 'chest' },
        reverse_grip_bench: { grip: 'supinated', target: 'upper_chest' }
      },

      specialty: {
        pause_bench: { pause: 'chest', duration: '1-3_seconds' },
        pin_press: { start: 'pins', concentric_only: true },
        floor_press: { surface: 'floor', rom: 'limited' },
        spoto_press: { pause: 'above_chest', competition_prep: true },
        larsen_press: { feet: 'elevated', core_challenge: true }
      }
    },

    searchTerms: [
      'bench press', 'barbell bench press', 'dumbbell bench press',
      'incline bench press', 'decline bench press', 'close grip bench',
      'pause bench press', 'pin press', 'floor press', 'spoto press',
      'bench press form', 'bench press arch', 'bench press setup'
    ]
  },

  // ===== OVERHEAD PRESS FAMILY =====
  overheadPressFamily: {
    baseExercise: 'Overhead Press',
    description: 'Vertical pressing movement for shoulder and core strength',

    sportRelevance: {
      weightlifting: { score: RELEVANCE_SCORES.CRITICAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      strongman: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.COMPETITION },
      crossfit: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      bodybuilding: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.HYPERTROPHY },
      gymnastics: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      swimming: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      volleyball: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.POWER_DEVELOPMENT },
      basketball: { score: RELEVANCE_SCORES.USEFUL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING }
    },

    variations: {
      equipment: {
        barbell_press: { equipment: 'barbell', name: 'Military Press' },
        dumbbell_press: { equipment: 'dumbbell', unilateral: true },
        kettlebell_press: { equipment: 'kettlebell', unilateral: true },
        landmine_press: { equipment: 'landmine', angle: 'diagonal' }
      },

      position: {
        standing_press: { position: 'standing', core_demand: 'high' },
        seated_press: { position: 'seated', isolation: 'shoulders' },
        half_kneeling_press: { position: 'half_kneeling', unilateral: true },
        single_arm_press: { arms: 'unilateral', stability: 'high' }
      },

      specialty: {
        push_press: { legs: 'assist', power: 'explosive' },
        push_jerk: { technique: 'olympic', speed: 'high' },
        behind_neck_press: { position: 'behind_neck', mobility: 'required' },
        z_press: { position: 'seated_floor', core: 'maximum' }
      }
    },

    searchTerms: [
      'overhead press', 'military press', 'shoulder press', 'dumbbell press',
      'push press', 'push jerk', 'seated press', 'standing press',
      'single arm press', 'kettlebell press', 'landmine press', 'z press'
    ]
  },

  // ===== PULL-UP/CHIN-UP FAMILY =====
  pullUpFamily: {
    baseExercise: 'Pull-Up',
    description: 'Vertical pulling movement for back and bicep development',

    sportRelevance: {
      climbing: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      gymnastics: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      martial_arts: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      swimming: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      bodybuilding: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.HYPERTROPHY },
      crossfit: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      wrestling: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING }
    },

    variations: {
      grip: {
        pull_up: { grip: 'pronated', width: 'shoulder_plus' },
        chin_up: { grip: 'supinated', target: 'biceps' },
        neutral_grip: { grip: 'neutral', wrist_friendly: true },
        wide_grip: { grip: 'wide', target: 'lats' },
        close_grip: { grip: 'close', target: 'lower_lats' }
      },

      assistance: {
        assisted_pullup: { assistance: 'band_or_machine', progression: true },
        negative_pullup: { phase: 'eccentric', strength_building: true },
        jumping_pullup: { assistance: 'leg_drive', scaling: true }
      },

      advanced: {
        weighted_pullup: { load: 'external', strength: 'advanced' },
        muscle_up: { transition: 'over_bar', gymnastics: true },
        archer_pullup: { unilateral: 'partial', asymmetric: true },
        typewriter_pullup: { movement: 'lateral', advanced: true },
        one_arm_pullup: { unilateral: 'complete', elite: true }
      }
    },

    searchTerms: [
      'pull up', 'chin up', 'pull-up', 'pullup variations',
      'weighted pull up', 'assisted pull up', 'muscle up',
      'wide grip pull up', 'close grip chin up', 'neutral grip',
      'archer pull up', 'one arm pull up', 'negative pull up'
    ]
  },

  // ===== ROWING FAMILY =====
  rowingFamily: {
    baseExercise: 'Row',
    description: 'Horizontal pulling movement for back development and posture',

    sportRelevance: {
      rowing: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      bodybuilding: { score: RELEVANCE_SCORES.CRITICAL, purpose: EXERCISE_PURPOSES.HYPERTROPHY },
      swimming: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      crossfit: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING },
      powerlifting: { score: RELEVANCE_SCORES.BENEFICIAL, purpose: EXERCISE_PURPOSES.ACCESSORY }
    },

    variations: {
      equipment: {
        barbell_row: { equipment: 'barbell', bilateral: true },
        dumbbell_row: { equipment: 'dumbbell', unilateral: true },
        cable_row: { equipment: 'cable', constant_tension: true },
        t_bar_row: { equipment: 't_bar', thick_grip: true },
        landmine_row: { equipment: 'landmine', angle: 'diagonal' }
      },

      position: {
        bent_over_row: { position: 'bent_over', core: 'stability' },
        chest_supported_row: { support: 'chest', isolation: 'back' },
        single_arm_row: { arms: 'unilateral', stability: 'required' },
        inverted_row: { position: 'supine', bodyweight: true }
      },

      angle: {
        underhand_row: { grip: 'supinated', target: 'lower_lats' },
        overhand_row: { grip: 'pronated', target: 'mid_traps' },
        wide_row: { grip: 'wide', target: 'rear_delts' }
      }
    },

    searchTerms: [
      'barbell row', 'dumbbell row', 'bent over row', 'cable row',
      'single arm row', 'chest supported row', 'inverted row',
      't-bar row', 'landmine row', 'seated row', 'pendlay row'
    ]
  }
};

// =====================================================
// OLYMPIC WEIGHTLIFTING SPECIFIC
// =====================================================
export const OLYMPIC_WEIGHTLIFTING_TAXONOMY = {
  snatchFamily: {
    baseExercise: 'Snatch',
    description: 'Olympic lift - ground to overhead in one motion',

    sportRelevance: {
      weightlifting: { score: RELEVANCE_SCORES.ESSENTIAL, purpose: EXERCISE_PURPOSES.COMPETITION },
      crossfit: { score: RELEVANCE_SCORES.IMPORTANT, purpose: EXERCISE_PURPOSES.STRENGTH_BUILDING }
    },

    variations: {
      full_lifts: {
        power_snatch: { catch: 'power_position', easier: true },
        squat_snatch: { catch: 'full_squat', competition: true },
        split_snatch: { catch: 'split', alternative: true }
      },

      partial_movements: {
        snatch_pull: { phase: 'pull_only', strength: true },
        snatch_high_pull: { phase: 'pull_plus_shrug', power: true },
        hang_snatch: { start: 'hang_position', technique: true },
        snatch_deadlift: { phase: 'first_pull', strength: true }
      },

      technique: {
        muscle_snatch: { arms: 'no_leg_drive', technique: true },
        overhead_squat: { position: 'receiving', mobility: true },
        snatch_grip_deadlift: { grip: 'wide', strength: true }
      }
    },

    searchTerms: [
      'snatch', 'power snatch', 'squat snatch', 'hang snatch',
      'snatch pull', 'snatch high pull', 'muscle snatch',
      'overhead squat', 'snatch technique', 'snatch grip'
    ]
  },

  cleanJerkFamily: {
    baseExercise: 'Clean and Jerk',
    description: 'Olympic lift - ground to shoulders to overhead',

    variations: {
      clean_variations: {
        power_clean: { catch: 'power_position' },
        squat_clean: { catch: 'full_squat' },
        hang_clean: { start: 'hang_position' },
        clean_pull: { phase: 'pull_only' }
      },

      jerk_variations: {
        push_jerk: { technique: 'push_under' },
        split_jerk: { technique: 'split_position' },
        squat_jerk: { technique: 'squat_under' },
        push_press: { assistance: 'leg_drive' }
      }
    },

    searchTerms: [
      'clean and jerk', 'power clean', 'squat clean', 'hang clean',
      'split jerk', 'push jerk', 'squat jerk', 'clean pull',
      'front squat', 'clean technique', 'jerk technique'
    ]
  }
};

// =====================================================
// STRONGMAN SPECIFIC TAXONOMY
// =====================================================
export const STRONGMAN_TAXONOMY = {
  carriingFamily: {
    baseExercise: 'Loaded Carries',

    variations: {
      farmers_walk: { equipment: 'farmers_handles', bilateral: true },
      suitcase_carry: { equipment: 'single_weight', unilateral: true },
      front_loaded_carry: { position: 'front', core: 'anti_extension' },
      overhead_carry: { position: 'overhead', shoulders: 'stability' },
      yoke_walk: { equipment: 'yoke', back_loading: true }
    },

    searchTerms: [
      'farmers walk', 'suitcase carry', 'overhead carry',
      'front loaded carry', 'yoke walk', 'loaded carries'
    ]
  },

  pressFamily: {
    baseExercise: 'Strongman Press',

    variations: {
      log_press: { equipment: 'log', technique: 'clean_press' },
      axle_press: { equipment: 'axle', grip: 'thick' },
      circus_dumbbell: { equipment: 'circus_db', unilateral: true },
      viking_press: { equipment: 'viking_press', angle: 'landmine' }
    }
  }
};

// =====================================================
// CONDITIONING & ENDURANCE TAXONOMY
// =====================================================
export const CONDITIONING_TAXONOMY = {
  metabolicFamily: {
    baseExercise: 'Metabolic Conditioning',

    variations: {
      hiit: {
        burpees: { movement: 'full_body', intensity: 'high' },
        mountain_climbers: { movement: 'core_cardio', pace: 'fast' },
        jumping_jacks: { movement: 'total_body', coordination: true },
        high_knees: { movement: 'cardio', running: 'in_place' }
      },

      circuits: {
        tabata: { protocol: '20_10', rounds: 8 },
        emom: { protocol: 'every_minute', scaling: 'time' },
        amrap: { protocol: 'as_many_rounds', scaling: 'rounds' }
      }
    },

    searchTerms: [
      'HIIT workout', 'metabolic conditioning', 'circuit training',
      'tabata', 'EMOM', 'AMRAP', 'burpees', 'mountain climbers'
    ]
  }
};

// =====================================================
// BALANCE & COORDINATION TAXONOMY
// =====================================================
export const BALANCE_COORDINATION_TAXONOMY = {
  balanceFamily: {
    baseExercise: 'Balance Training',

    variations: {
      static_balance: {
        single_leg_stand: { surface: 'stable', eyes: 'open_closed' },
        bosu_stand: { surface: 'unstable', challenge: 'moderate' },
        slack_line: { surface: 'dynamic', challenge: 'high' }
      },

      dynamic_balance: {
        single_leg_reach: { movement: 'reaching', stability: 'unilateral' },
        lateral_bounds: { movement: 'side_to_side', power: true },
        balance_beam: { surface: 'narrow', precision: true }
      }
    },

    searchTerms: [
      'balance training', 'single leg balance', 'proprioception',
      'bosu ball exercises', 'stability training', 'coordination drills'
    ]
  }
};

// =====================================================
// MOBILITY & FLEXIBILITY TAXONOMY
// =====================================================
export const MOBILITY_TAXONOMY = {
  mobilityFamily: {
    baseExercise: 'Mobility Work',

    variations: {
      dynamic_warmup: {
        leg_swings: { joint: 'hip', plane: 'sagittal_frontal' },
        arm_circles: { joint: 'shoulder', plane: 'frontal' },
        walking_lunges: { movement: 'dynamic', muscles: 'hip_flexors' }
      },

      static_stretching: {
        pigeon_pose: { target: 'hip_flexors', hold: '30_60_seconds' },
        downward_dog: { target: 'calves_hamstrings', yoga: true },
        cat_cow: { target: 'spine', movement: 'segmental' }
      },

      foam_rolling: {
        it_band_roll: { tool: 'foam_roller', target: 'it_band' },
        thoracic_roll: { tool: 'foam_roller', target: 'thoracic_spine' },
        calf_roll: { tool: 'foam_roller', target: 'calves' }
      }
    },

    searchTerms: [
      'mobility exercises', 'dynamic warmup', 'static stretching',
      'foam rolling', 'hip mobility', 'shoulder mobility',
      'ankle mobility', 'thoracic spine', 'flexibility training'
    ]
  }
};

// =====================================================
// SEARCH TERM GENERATOR
// =====================================================
export class MegaSearchTermGenerator {
  constructor() {
    this.allTaxonomies = {
      ...MEGA_EXERCISE_TAXONOMY,
      ...OLYMPIC_WEIGHTLIFTING_TAXONOMY,
      ...STRONGMAN_TAXONOMY,
      ...CONDITIONING_TAXONOMY,
      ...BALANCE_COORDINATION_TAXONOMY,
      ...MOBILITY_TAXONOMY
    };
  }

  // Generiert alle Search Terms für AI Discovery
  generateAllSearchTerms() {
    const allTerms = [];

    Object.values(this.allTaxonomies).forEach(family => {
      if (family.searchTerms) {
        allTerms.push(...family.searchTerms);
      }

      // Generate terms from variations
      if (family.variations) {
        Object.values(family.variations).forEach(category => {
          Object.values(category).forEach(variation => {
            if (variation.name) {
              allTerms.push(variation.name.toLowerCase());
            }
          });
        });
      }
    });

    // Deduplicate and sort
    return [...new Set(allTerms)].sort();
  }

  // Generiert sport-spezifische Search Terms
  getSearchTermsForSport(sportId) {
    const relevantTerms = [];

    Object.values(this.allTaxonomies).forEach(family => {
      if (family.sportRelevance && family.sportRelevance[sportId]) {
        const relevanceScore = family.sportRelevance[sportId].score;

        if (relevanceScore >= RELEVANCE_SCORES.USEFUL) {
          if (family.searchTerms) {
            relevantTerms.push(...family.searchTerms);
          }
        }
      }
    });

    return [...new Set(relevantTerms)];
  }

  // Statistiken
  getStats() {
    const totalExercises = Object.keys(this.allTaxonomies).length;
    const totalSearchTerms = this.generateAllSearchTerms().length;

    return {
      totalExerciseFamilies: totalExercises,
      totalSearchTerms,
      estimatedVariations: totalSearchTerms * 3, // Durchschnitt 3 Variationen pro Term
      supportedSports: this.getSupportedSports().length
    };
  }

  // Unterstützte Sportarten
  getSupportedSports() {
    const sports = new Set();

    Object.values(this.allTaxonomies).forEach(family => {
      if (family.sportRelevance) {
        Object.keys(family.sportRelevance).forEach(sport => {
          sports.add(sport);
        });
      }
    });

    return Array.from(sports).sort();
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================
export default {
  MEGA_EXERCISE_TAXONOMY,
  OLYMPIC_WEIGHTLIFTING_TAXONOMY,
  STRONGMAN_TAXONOMY,
  CONDITIONING_TAXONOMY,
  BALANCE_COORDINATION_TAXONOMY,
  MOBILITY_TAXONOMY,
  RELEVANCE_SCORES,
  FITNESS_COMPONENTS,
  EXERCISE_PURPOSES,
  MegaSearchTermGenerator
};