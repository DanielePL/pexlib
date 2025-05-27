// client/src/services/completeSportsTaxonomy.js
// Komplette Sport-Taxonomie für MEGA AI Discovery

export const COMPLETE_SPORTS_TAXONOMY = {
  // =====================================================
  // TOP 10 SPORTS für ersten Test
  // =====================================================
  teamSports: {
    soccer: {
      id: 'soccer',
      name: 'Fußball',
      primaryNeeds: ['running_endurance', 'agility', 'ball_skills'],
      strengthFoci: ['leg_strength', 'core_stability', 'unilateral_strength'],
      enduranceNeeds: ['aerobic_base', 'repeated_sprint'],
      balanceNeeds: ['single_leg_stability', 'change_of_direction'],
      mobilityNeeds: ['hip_mobility', 'ankle_flexibility'],
      searchTerms: [
        'soccer training', 'football fitness', 'soccer agility',
        'soccer strength training', 'football conditioning',
        'soccer endurance', 'football leg strength'
      ]
    },
    basketball: {
      id: 'basketball',
      name: 'Basketball',
      primaryNeeds: ['jumping_power', 'agility', 'hand_eye_coordination'],
      strengthFoci: ['leg_power', 'core_strength', 'upper_body_stability'],
      enduranceNeeds: ['repeated_jump_ability', 'game_endurance'],
      balanceNeeds: ['landing_mechanics', 'directional_changes'],
      mobilityNeeds: ['ankle_mobility', 'hip_flexibility', 'shoulder_range'],
      searchTerms: [
        'basketball training', 'vertical jump training', 'basketball agility',
        'basketball strength', 'basketball conditioning', 'jump training'
      ]
    }
  },

  enduranceSports: {
    running: {
      sprint: {
        id: 'sprint',
        name: 'Sprint (100m-400m)',
        primaryNeeds: ['explosive_power', 'speed', 'acceleration'],
        strengthFoci: ['hip_power', 'leg_drive', 'core_stability'],
        enduranceNeeds: ['anaerobic_capacity', 'lactate_tolerance'],
        balanceNeeds: ['dynamic_stability', 'directional_changes'],
        mobilityNeeds: ['hip_flexor_length', 'ankle_mobility'],
        searchTerms: [
          'sprint training', 'explosive starts', 'acceleration drills',
          '100m training', 'sprint strength', 'speed development'
        ]
      },
      longDistance: {
        id: 'marathon',
        name: 'Marathon/Langstrecke',
        primaryNeeds: ['aerobic_capacity', 'endurance', 'efficiency'],
        strengthFoci: ['leg_endurance', 'postural_strength'],
        enduranceNeeds: ['aerobic_base', 'fat_oxidation'],
        balanceNeeds: ['running_economy', 'proprioception'],
        mobilityNeeds: ['hip_flexor_length', 'IT_band_mobility'],
        searchTerms: [
          'marathon training', 'distance running', 'endurance base building',
          'marathon strength', 'running endurance', 'long distance training'
        ]
      }
    },
    swimming: {
      id: 'swimming',
      name: 'Schwimmen',
      primaryNeeds: ['upper_body_power', 'stroke_efficiency', 'turns'],
      strengthFoci: ['lat_strength', 'core_rotation', 'kick_power'],
      enduranceNeeds: ['stroke_endurance', 'breath_control'],
      balanceNeeds: ['body_position', 'stroke_symmetry'],
      mobilityNeeds: ['shoulder_mobility', 'ankle_flexibility', 'thoracic_rotation'],
      searchTerms: [
        'swimming strength training', 'swimmer dryland', 'swimming flexibility',
        'swimming conditioning', 'swim training', 'swimmer strength'
      ]
    }
  },

  strengthSports: {
    weightlifting: {
      id: 'weightlifting',
      name: 'Gewichtheben',
      primaryNeeds: ['maximum_strength', 'explosive_power', 'technique'],
      strengthFoci: ['total_body_strength', 'Olympic_lifts', 'power_development'],
      enduranceNeeds: ['strength_endurance', 'recovery_capacity'],
      balanceNeeds: ['stability_under_load', 'lifting_balance'],
      mobilityNeeds: ['overhead_mobility', 'hip_flexibility', 'ankle_range'],
      searchTerms: [
        'weightlifting training', 'Olympic lifting', 'powerlifting',
        'strength training', 'barbell training', 'heavy lifting'
      ]
    },
    bodybuilding: {
      id: 'bodybuilding',
      name: 'Bodybuilding',
      primaryNeeds: ['muscle_hypertrophy', 'symmetry', 'definition'],
      strengthFoci: ['isolation_exercises', 'muscle_building', 'volume_training'],
      enduranceNeeds: ['muscular_endurance', 'training_volume'],
      balanceNeeds: ['muscle_balance', 'postural_control'],
      mobilityNeeds: ['muscle_flexibility', 'joint_range'],
      searchTerms: [
        'bodybuilding training', 'muscle building', 'hypertrophy training',
        'bodybuilding exercises', 'muscle growth', 'physique training'
      ]
    }
  },

  racketSports: {
    tennis: {
      id: 'tennis',
      name: 'Tennis',
      primaryNeeds: ['agility', 'rotational_power', 'endurance'],
      strengthFoci: ['core_rotation', 'leg_strength', 'shoulder_stability'],
      enduranceNeeds: ['match_endurance', 'recovery_between_points'],
      balanceNeeds: ['lateral_movement', 'change_of_direction'],
      mobilityNeeds: ['shoulder_range', 'hip_mobility', 'thoracic_rotation'],
      searchTerms: [
        'tennis training', 'tennis fitness', 'tennis agility',
        'tennis strength', 'tennis conditioning', 'racket sports training'
      ]
    }
  },

  combatSports: {
    boxing: {
      id: 'boxing',
      name: 'Boxen',
      primaryNeeds: ['punching_power', 'footwork', 'conditioning'],
      strengthFoci: ['rotational_power', 'leg_drive', 'core_strength'],
      enduranceNeeds: ['anaerobic_capacity', 'recovery_between_rounds'],
      balanceNeeds: ['dynamic_balance', 'weight_shifting'],
      mobilityNeeds: ['shoulder_mobility', 'hip_rotation', 'ankle_mobility'],
      searchTerms: [
        'boxing training', 'boxing conditioning', 'boxing footwork',
        'boxing strength', 'fighter training', 'combat sports training'
      ]
    }
  }
};

// =====================================================
// MEGA SPORTS ANALYZER
// =====================================================

export class MegaSportsAnalyzer {
  constructor() {
    this.taxonomy = COMPLETE_SPORTS_TAXONOMY;
  }

  // Generiert ALLE Suchbegriffe für AI Discovery
  generateAllSearchTerms() {
    const allSearchTerms = [];

    const traverseSports = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.searchTerms && Array.isArray(value.searchTerms)) {
          // Das ist eine spezifische Sportart
          const sportData = value;

          // Basis-Suchbegriffe
          allSearchTerms.push(...sportData.searchTerms);

          // Erweiterte Suchbegriffe basierend auf Bedürfnissen
          if (sportData.strengthFoci) {
            sportData.strengthFoci.forEach(focus => {
              allSearchTerms.push(`${focus.replace('_', ' ')} exercises`);
              allSearchTerms.push(`${focus.replace('_', ' ')} training for ${sportData.name}`);
            });
          }

          if (sportData.mobilityNeeds) {
            sportData.mobilityNeeds.forEach(need => {
              allSearchTerms.push(`${need.replace('_', ' ')} exercises`);
              allSearchTerms.push(`${need.replace('_', ' ')} for ${sportData.name}`);
            });
          }

          if (sportData.balanceNeeds) {
            sportData.balanceNeeds.forEach(need => {
              allSearchTerms.push(`${need.replace('_', ' ')} training`);
            });
          }

          if (sportData.enduranceNeeds) {
            sportData.enduranceNeeds.forEach(need => {
              allSearchTerms.push(`${need.replace('_', ' ')} training`);
            });
          }

        } else if (typeof value === 'object') {
          // Weiter traversieren
          traverseSports(value);
        }
      }
    };

    traverseSports(this.taxonomy);

    // Deduplizieren und sortieren
    const uniqueTerms = [...new Set(allSearchTerms)];
    console.log(`🎯 Generated ${uniqueTerms.length} unique search terms for MEGA discovery`);

    return uniqueTerms;
  }

  // Holt Sport-spezifische Informationen
  getSportDetails(sportId) {
    const findSport = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.id === sportId) {
          return value;
        }
        if (typeof value === 'object' && !value.id) {
          const found = findSport(value);
          if (found) return found;
        }
      }
      return null;
    };

    return findSport(this.taxonomy);
  }

  // Generiert Batch-Suchen für effiziente API-Nutzung
  generateBatchSearchPlans(batchSize = 25) {
    const allTerms = this.generateAllSearchTerms();
    const batches = [];

    for (let i = 0; i < allTerms.length; i += batchSize) {
      batches.push({
        batchNumber: Math.floor(i / batchSize) + 1,
        terms: allTerms.slice(i, i + batchSize),
        estimatedApiCalls: allTerms.slice(i, i + batchSize).length,
        estimatedCost: allTerms.slice(i, i + batchSize).length * 0.002 // ~$0.002 per call
      });
    }

    return {
      totalBatches: batches.length,
      totalTerms: allTerms.length,
      estimatedTotalCost: allTerms.length * 0.002,
      batches: batches
    };
  }

  // Kategorisiert Übungen nach Sport-Typ
  categorizeExerciseForSports(exercise) {
    const categories = [];
    const text = `${exercise.name} ${exercise.description}`.toLowerCase();

    const findRelevantSports = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.searchTerms) {
          // Prüfe ob diese Sportart relevant ist
          const isRelevant = value.searchTerms.some(term =>
            text.includes(term.toLowerCase().replace(' training', '').replace(' exercises', ''))
          );

          if (isRelevant) {
            categories.push({
              sportId: value.id,
              sportName: value.name,
              relevanceScore: this.calculateRelevanceScore(exercise, value)
            });
          }
        } else if (typeof value === 'object') {
          findRelevantSports(value);
        }
      }
    };

    findRelevantSports(this.taxonomy);

    return categories.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  calculateRelevanceScore(exercise, sportData) {
    let score = 0;
    const text = `${exercise.name} ${exercise.description}`.toLowerCase();

    // Basis-Score für Keyword-Matches
    sportData.searchTerms?.forEach(term => {
      if (text.includes(term.toLowerCase())) score += 10;
    });

    // Strength-Focus-Matches
    sportData.strengthFoci?.forEach(focus => {
      if (text.includes(focus.replace('_', ' '))) score += 8;
    });

    // Mobility-Need-Matches
    sportData.mobilityNeeds?.forEach(need => {
      if (text.includes(need.replace('_', ' '))) score += 6;
    });

    return score;
  }

  // Zeigt Statistiken
  getStats() {
    const allTerms = this.generateAllSearchTerms();
    const plan = this.generateBatchSearchPlans();

    return {
      totalSports: this.countSports(),
      totalSearchTerms: allTerms.length,
      estimatedExercises: allTerms.length * 5, // ~5 Übungen pro Suchbegriff
      estimatedCost: plan.estimatedTotalCost,
      topSearchTerms: allTerms.slice(0, 10)
    };
  }

  countSports() {
    let count = 0;
    const countInObj = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.id && value.searchTerms) {
          count++;
        } else if (typeof value === 'object') {
          countInObj(value);
        }
      }
    };
    countInObj(this.taxonomy);
    return count;
  }
}

export default MegaSportsAnalyzer;