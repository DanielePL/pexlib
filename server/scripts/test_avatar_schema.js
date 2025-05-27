// server/scripts/test_avatar_schema.js - Teste dein Avatar Schema
const mongoose = require('mongoose');
const Avatar = require('../models/avatar_schema');
require('dotenv').config();

const testAvatarSchema = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prometheus-exercise-library');
    console.log('✅ Connected to MongoDB');

    // Test Avatar Creation
    const testAvatar = new Avatar({
      user: new mongoose.Types.ObjectId(), // Dummy user ID
      name: 'Test PEXLIB Coach',
      avatarUrl: 'https://models.readyplayer.me/test123.glb',
      avatarId: 'test_avatar_' + Date.now(),
      personality: 'motivational',
      specialization: 'general_fitness',
      brandName: 'PEXLIB Test',
      userType: 'professional',
      metadata: {
        domain: 'localhost:3000',
        createdVia: 'test_script',
        version: '1.0',
        timestamp: new Date()
      }
    });

    const savedAvatar = await testAvatar.save();
    console.log('✅ Avatar saved successfully:', savedAvatar._id);

    // Test Avatar Methods
    await savedAvatar.incrementUsage();
    console.log('✅ Usage incremented');

    await savedAvatar.recordExerciseDemo('bench-press');
    console.log('✅ Exercise demo recorded');

    // Test Static Methods
    const activeAvatar = await Avatar.findActiveByUser(savedAvatar.user);
    console.log('✅ Active avatar found:', !!activeAvatar);

    // Cleanup
    await Avatar.findByIdAndDelete(savedAvatar._id);
    console.log('✅ Test avatar cleaned up');

    console.log('🎉 Avatar Schema Test PASSED!');

  } catch (error) {
    console.error('❌ Avatar Schema Test FAILED:', error);
  } finally {
    mongoose.connection.close();
  }
};

testAvatarSchema();