// server/services/sportsTaxonomyService.js
const sportsTaxonomy = [
  {
    id: 'tennis',
    name: 'Tennis',
    keyAttributes: ['Beweglichkeit', 'Schnelligkeit', 'Reaktionsfähigkeit', 'Koordination', 'Armkraft'],
    specificMovements: ['Seitliche Bewegung', 'Vorhand', 'Rückhand', 'Aufschlag', 'Volley'],
    relevantMuscleGroups: ['Shoulders', 'Arms', 'Core', 'Legs', 'Back'],
    equipmentPreferences: ['Resistance Band', 'Medicine Ball', 'None'],
    searchKeywords: ['tennis', 'racket', 'court', 'volley', 'serve', 'forehand', 'backhand']
  },
  {
    id: 'hockey',
    name: 'Eishockey',
    keyAttributes: ['Stabilität', 'Explosivkraft', 'Schnelligkeit', 'Koordination', 'Ausdauer'],
    specificMovements: ['Schlittschuhlaufen', 'Richtungswechsel', 'Schießen', 'Stickhandling', 'Bodycheck'],
    relevantMuscleGroups: ['Legs', 'Core', 'Shoulders', 'Arms', 'Back'],
    equipmentPreferences: ['Resistance Band', 'Medicine Ball', 'None', 'Cable'],
    searchKeywords: ['hockey', 'ice', 'skate', 'puck', 'stick', 'skating', 'slapshot']
  },
  {
    id: 'weightlifting',
    name: 'Gewichtheben',
    keyAttributes: ['Maximalkraft', 'Explosivkraft', 'Technik', 'Beweglichkeit', 'Stabilität'],
    specificMovements: ['Reißen', 'Stoßen', 'Umsetzen', 'Kniebeugen', 'Ziehen'],
    relevantMuscleGroups: ['Legs', 'Back', 'Shoulders', 'Core', 'Glutes'],
    equipmentPreferences: ['Barbell', 'None', 'Dumbbell'],
    searchKeywords: ['olympic', 'weightlifting', 'snatch', 'clean', 'jerk', 'platform']
  },
  {
    id: 'running',
    name: 'Laufen',
    keyAttributes: ['Ausdauer', 'Beinarbeit', 'Rumpfstabilität', 'Effizienz', 'Atmung'],
    specificMovements: ['Laufen', 'Sprinten', 'Beinarbeit', 'Armarbeit'],
    relevantMuscleGroups: ['Legs', 'Core', 'Calves (Gastrocnemius)', 'Calves (Soleus)', 'Hip Flexors'],
    equipmentPreferences: ['None', 'Resistance Band'],
    searchKeywords: ['running', 'sprint', 'marathon', 'jog', 'endurance', 'stride']
  },
  {
    id: 'soccer',
    name: 'Fußball',
    keyAttributes: ['Ausdauer', 'Schnelligkeit', 'Beinarbeit', 'Koordination', 'Agilität'],
    specificMovements: ['Sprinten', 'Richtungswechsel', 'Schießen', 'Passen', 'Springen'],
    relevantMuscleGroups: ['Legs', 'Core', 'Hip Flexors', 'Glutes', 'Calves (Gastrocnemius)'],
    equipmentPreferences: ['None', 'Medicine Ball', 'Resistance Band'],
    searchKeywords: ['soccer', 'football', 'kick', 'agility', 'sprint', 'footwork']
  },
  // Weitere Sportarten nach Bedarf...
];

const getSportById = (id) => sportsTaxonomy.find(sport => sport.id === id);

const getAllSports = () => sportsTaxonomy;

const getSportKeywords = (sportId) => {
  const sport = getSportById(sportId);
  if (!sport) return [];
  
  return [
    ...sport.keyAttributes,
    ...sport.specificMovements,
    ...sport.relevantMuscleGroups,
    ...sport.searchKeywords
  ];
};

module.exports = { 
  sportsTaxonomy,
  getSportById,
  getAllSports,
  getSportKeywords
};