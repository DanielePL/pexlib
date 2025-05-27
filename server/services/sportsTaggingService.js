// server/services/sportsTaggingService.js
const { getSportById, getAllSports } = require('./sportsTaxonomyService');
const axios = require('axios');

/**
 * Verwendet OpenAI, um Übungen mit relevanten Sportarten zu taggen
 */
const tagExerciseWithSports = async (exercise) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const allSports = getAllSports();
    
    // Erstelle Prompt für OpenAI
    const prompt = `Analysiere folgende Übung und bewerte ihre Relevanz für verschiedene Sportarten auf einer Skala von 0-10:
    
    Übung: ${exercise.name}
    Beschreibung: ${exercise.description}
    Muskelgruppe: ${exercise.muscleGroup}
    Kategorie: ${exercise.category}
    Schwierigkeit: ${exercise.difficulty}
    Ausrüstung: ${exercise.equipment}
    
    Berücksichtige dabei, ob die Übung:
    1. Für die Sportart typische Bewegungsmuster trainiert
    2. Relevante Muskelgruppen für die Sportart beansprucht
    3. Zu typischen Trainingszielen der Sportart passt
    4. Die für die Sportart wichtige Fähigkeiten (Kraft, Ausdauer, Schnelligkeit, etc.) entwickelt
    
    Bewerte die Relevanz der Übung nur für diese Sportarten: ${allSports.map(s => s.name).join(', ')}
    
    Gib nur Sportarten mit einer Relevanz von mindestens 7/10 an.
    
    Deine Antwort muss exakt dieses JSON-Format haben:
    {
      "relevantSports": [
        {"id": "sportId1", "relevance": 9, "reason": "Kurze Begründung"},
        {"id": "sportId2", "relevance": 8, "reason": "Kurze Begründung"}
      ]
    }`;

    // OpenAI API-Aufruf
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: `Du bist ein Sporttrainer-Experte, der Übungen analysiert und ihre Relevanz für verschiedene Sportarten bewertet. Die verfügbaren Sportarten sind: ${allSports.map(s => s.name).join(', ')}.` 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const content = response.data.choices[0].message.content;
    
    // Parse die Antwort
    let relevantSports = [];
    try {
      const result = JSON.parse(content);
      relevantSports = result.relevantSports || [];
    } catch (e) {
      console.error('Failed to parse API response:', e);
      relevantSports = [];
    }

    // Update exercise with sports tags
    const updatedExercise = {
      ...exercise,
      sports: relevantSports.map(s => s.id)
    };
    
    // Wenn das Exercise-Objekt ein mongoose-Dokument ist, Felder direkt setzen
    if (exercise.set) {
      const sportsRelevanceObj = {};
      relevantSports.forEach(sport => {
        sportsRelevanceObj[sport.id] = sport.relevance;
      });
      
      exercise.set('sports', relevantSports.map(s => s.id));
      exercise.set('sportsRelevance', sportsRelevanceObj);
      return exercise;
    }
    
    // Ansonsten neues Objekt zurückgeben
    return updatedExercise;
  } catch (error) {
    console.error('Error in sports tagging:', error);
    return exercise;
  }
};

module.exports = { tagExerciseWithSports };