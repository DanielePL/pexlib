// server/scripts/batchSportsTagging.js
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');
const { tagExerciseWithSports } = require('../services/sportsTaggingService');
require('dotenv').config();

async function batchTagExercises() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Gesamtzahl der zu verarbeitenden Übungen ermitteln
    const totalCount = await Exercise.countDocuments({
      $or: [
        { sports: { $exists: false } },
        { sports: { $size: 0 } },
        { sport: { $exists: true, $ne: null } } // Alte Einzelsportarten
      ]
    });
    console.log(`Found ${totalCount} exercises to process`);

    // Batch-Größe und Verzögerung definieren
    const batchSize = 20; // Anpassen nach API-Limits
    const delayBetweenRequests = 1000; // 1 Sekunde Wartezeit zwischen Anfragen

    // Verarbeitung in Batches
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    while (processedCount < totalCount) {
      // Hole den nächsten Batch
      const exercises = await Exercise.find({
        $or: [
          { sports: { $exists: false } },
          { sports: { $size: 0 } },
          { sport: { $exists: true, $ne: null } } // Alte Einzelsportarten
        ]
      }).limit(batchSize).skip(processedCount);

      // Verarbeite jeden Eintrag im Batch
      for (const exercise of exercises) {
        console.log(`Processing (${processedCount + 1}/${totalCount}): ${exercise.name}`);
        
        try {
          // Migriere alte sport-Werte, falls vorhanden
          if (exercise.sport && (!exercise.sports || exercise.sports.length === 0)) {
            exercise.sports = [exercise.sport];
          }

          // Tagge mit neuen Sportarten
          const taggedExercise = await tagExerciseWithSports(exercise);
          
          // Speichere die aktualisierten Daten
          if (taggedExercise.sports && taggedExercise.sports.length > 0) {
            exercise.sports = taggedExercise.sports;
            
            // Speichere auch die Relevanz, falls vorhanden
            if (taggedExercise.sportsRelevance) {
              exercise.sportsRelevance = taggedExercise.sportsRelevance;
            }
            
            await exercise.save();
            console.log(`  Tagged with sports: ${taggedExercise.sports.join(', ')}`);
            successCount++;
          } else {
            console.log(`  No relevant sports found for: ${exercise.name}`);
            exercise.sports = []; // Leeres Array, um erneute Verarbeitung zu vermeiden
            await exercise.save();
          }
        } catch (error) {
          console.error(`  Error processing exercise ${exercise.name}:`, error);
          errorCount++;
        }
        
        processedCount++;
        
        // Verzögerung zwischen Anfragen
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
      
      console.log(`Progress: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`);
    }

    console.log(`Batch processing completed. Success: ${successCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('Batch processing error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Skript starten
batchTagExercises();