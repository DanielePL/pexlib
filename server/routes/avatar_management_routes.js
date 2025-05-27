// server/routes/avatar_management_routes.js - Complete Final Version
const express = require('express');
const router = express.Router();
const Avatar = require('../models/avatar_schema');
const auth = require('../middleware/auth');

// Middleware to log avatar operations
const logAvatarOperation = (operation) => {
  return (req, res, next) => {
    console.log(`🤖 [Avatar ${operation}] User: ${req.user?.id}, Time: ${new Date().toISOString()}`);
    next();
  };
};

// @route   POST /api/avatar/save
// @desc    Save avatar from Ready Player Me (PEXLIB specific)
// @access  Private
router.post('/save', auth, logAvatarOperation('SAVE'), async (req, res) => {
  try {
    console.log('💾 [PEXLIB] Avatar save request:', req.body);

    const {
      avatarUrl,
      avatarId,
      userType,
      customizations,
      metadata
    } = req.body;

    // Validate required fields
    if (!avatarUrl || !avatarId) {
      return res.status(400).json({
        success: false,
        error: 'Avatar URL and ID are required',
        code: 'MISSING_AVATAR_DATA'
      });
    }

    // Validate Ready Player Me URL
    if (!avatarUrl.includes('readyplayer.me') && !avatarUrl.includes('.glb')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ready Player Me avatar URL',
        code: 'INVALID_AVATAR_URL'
      });
    }

    // Check if avatar already exists for this user
    let existingAvatar = await Avatar.findOne({ user: req.user.id });

    if (existingAvatar) {
      console.log('📝 [PEXLIB] Updating existing avatar...');

      // Update existing avatar
      existingAvatar.avatarUrl = avatarUrl;
      existingAvatar.avatarId = avatarId;
      existingAvatar.personality = customizations?.coachPersonality || existingAvatar.personality;
      existingAvatar.specialization = customizations?.specialization || existingAvatar.specialization;
      existingAvatar.brandName = customizations?.brandName || existingAvatar.brandName;

      // Update appearance
      existingAvatar.appearance.readyPlayerMeUrl = avatarUrl;
      existingAvatar.appearance.avatarId = avatarId;

      // Update metadata
      existingAvatar.metadata = {
        ...existingAvatar.metadata,
        ...metadata,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      // Update health status
      existingAvatar.status.currentStatus = 'active';
      existingAvatar.status.lastHealthCheck = new Date();

      const updatedAvatar = await existingAvatar.save();

      console.log('✅ [PEXLIB] Avatar updated successfully:', updatedAvatar._id);

      return res.json({
        success: true,
        message: 'PEXLIB avatar updated successfully',
        avatar: {
          id: updatedAvatar._id,
          name: updatedAvatar.name,
          avatarUrl: updatedAvatar.avatarUrl,
          avatarId: updatedAvatar.avatarId,
          personality: updatedAvatar.personality,
          specialization: updatedAvatar.specialization,
          brandName: updatedAvatar.brandName,
          status: updatedAvatar.status.currentStatus,
          lastUsed: updatedAvatar.analytics.lastUsed
        }
      });
    } else {
      console.log('🆕 [PEXLIB] Creating new avatar...');

      // Create new avatar
      const newAvatar = new Avatar({
        user: req.user.id,
        name: customizations?.brandName || 'My PEXLIB Coach',
        avatarUrl,
        avatarId,
        personality: customizations?.coachPersonality || 'motivational',
        specialization: customizations?.specialization || 'general_fitness',
        brandName: customizations?.brandName || 'PEXLIB - Prometheus Exercise Library',
        userType: userType || 'professional',

        // Appearance configuration
        appearance: {
          readyPlayerMeUrl: avatarUrl,
          avatarId: avatarId,
          bodyType: 'halfbody'
        },

        // Default coaching style for PEXLIB
        coachingStyle: {
          motivationLevel: 8,
          technicalDetail: 7,
          encouragementFrequency: 9,
          correctionApproach: 'supportive'
        },

        // Metadata
        metadata: {
          ...metadata,
          createdVia: 'pexlib_avatar_creator',
          version: '1.0',
          domain: 'pexlib.com'
        },

        // Premium PEXLIB features
        permissions: {
          isPremium: true,
          features: {
            voiceCoaching: false, // Coming soon
            customAnimations: true,
            brandingCustomization: true,
            advancedAnalytics: true,
            exerciseCreation: true,
            clientSharing: false,
            exportData: true
          }
        },

        // Integration settings
        integrations: {
          pexlib: {
            autoSync: true,
            exerciseLibraryAccess: true,
            realTimeUpdates: true
          }
        }
      });

      const savedAvatar = await newAvatar.save();

      console.log('✅ [PEXLIB] New avatar created successfully:', savedAvatar._id);

      return res.status(201).json({
        success: true,
        message: 'PEXLIB avatar created successfully',
        avatar: {
          id: savedAvatar._id,
          name: savedAvatar.name,
          avatarUrl: savedAvatar.avatarUrl,
          avatarId: savedAvatar.avatarId,
          personality: savedAvatar.personality,
          specialization: savedAvatar.specialization,
          brandName: savedAvatar.brandName,
          status: savedAvatar.status.currentStatus,
          createdAt: savedAvatar.createdAt
        }
      });
    }

  } catch (error) {
    console.error('❌ [PEXLIB] Avatar save error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save avatar',
      code: 'AVATAR_SAVE_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// @route   GET /api/avatar/current
// @desc    Get current user's active avatar
// @access  Private
router.get('/current', auth, logAvatarOperation('GET_CURRENT'), async (req, res) => {
  try {
    const avatar = await Avatar.findActiveByUser(req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'No active avatar found for this user',
        code: 'NO_AVATAR_FOUND'
      });
    }

    // Update last used timestamp
    await avatar.incrementUsage();

    res.json({
      success: true,
      avatar: {
        id: avatar._id,
        name: avatar.name,
        avatarUrl: avatar.avatarUrl,
        avatarId: avatar.avatarId,
        personality: avatar.personality,
        specialization: avatar.specialization,
        brandName: avatar.brandName,
        status: avatar.status.currentStatus,
        analytics: {
          totalDemonstrations: avatar.analytics.totalDemonstrations,
          exercisesCoached: avatar.analytics.exercisesCoached,
          lastUsed: avatar.analytics.lastUsed,
          userSatisfactionRating: avatar.analytics.userSatisfactionRating
        },
        permissions: avatar.permissions,
        createdAt: avatar.createdAt
      }
    });

  } catch (error) {
    console.error('❌ [PEXLIB] Get current avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current avatar',
      code: 'FETCH_AVATAR_ERROR'
    });
  }
});

// @route   POST /api/avatar/demo/:exerciseName
// @desc    Record exercise demonstration
// @access  Private
router.post('/demo/:exerciseName', auth, logAvatarOperation('DEMO'), async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const { sessionLength = 0, userRating } = req.body;

    const avatar = await Avatar.findActiveByUser(req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'No active avatar found',
        code: 'NO_AVATAR_FOUND'
      });
    }

    // Record the exercise demonstration
    await avatar.recordExerciseDemo(exerciseName, sessionLength);

    // Add user rating if provided
    if (userRating && userRating >= 1 && userRating <= 5) {
      await avatar.addUserFeedback(userRating, '', 'demonstration');
    }

    console.log(`🎬 [PEXLIB] Exercise demo recorded: ${exerciseName} for user ${req.user.id}`);

    res.json({
      success: true,
      message: `Exercise demonstration recorded: ${exerciseName}`,
      stats: {
        totalDemonstrations: avatar.analytics.totalDemonstrations,
        exercisesCoached: avatar.analytics.exercisesCoached,
        totalCoachingTime: avatar.analytics.totalCoachingTime
      }
    });

  } catch (error) {
    console.error('❌ [PEXLIB] Demo recording error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record demonstration',
      code: 'DEMO_RECORD_ERROR'
    });
  }
});

// @route   GET /api/avatar/analytics
// @desc    Get avatar analytics and statistics
// @access  Private
router.get('/analytics', auth, logAvatarOperation('ANALYTICS'), async (req, res) => {
  try {
    const avatar = await Avatar.findActiveByUser(req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'No active avatar found',
        code: 'NO_AVATAR_FOUND'
      });
    }

    // Get comprehensive analytics
    const analytics = {
      overview: {
        totalDemonstrations: avatar.analytics.totalDemonstrations,
        exercisesCoached: avatar.analytics.exercisesCoached,
        totalCoachingTime: avatar.analytics.totalCoachingTime,
        userInteractions: avatar.analytics.userInteractions,
        averageSessionLength: avatar.analytics.averageSessionLength,
        userSatisfactionRating: avatar.analytics.userSatisfactionRating
      },
      popularExercises: avatar.analytics.popularExercises.sort((a, b) =>
        b.demonstrationCount - a.demonstrationCount
      ).slice(0, 10),
      recentActivity: avatar.exerciseCapabilities.demonstratedExercises
        .sort((a, b) => new Date(b.lastDemonstrated) - new Date(a.lastDemonstrated))
        .slice(0, 5),
      feedback: {
        totalRatings: avatar.feedback.userRatings.length,
        averageRating: avatar.analytics.userSatisfactionRating,
        recentFeedback: avatar.feedback.userRatings.slice(-5)
      },
      status: {
        currentStatus: avatar.status.currentStatus,
        lastHealthCheck: avatar.status.lastHealthCheck,
        errorCount: avatar.status.errorCount,
        uptime: new Date() - avatar.createdAt
      }
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ [PEXLIB] Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      code: 'ANALYTICS_ERROR'
    });
  }
});

// @route   PUT /api/avatar/settings
// @desc    Update avatar settings and preferences
// @access  Private
router.put('/settings', auth, logAvatarOperation('UPDATE_SETTINGS'), async (req, res) => {
  try {
    const { personality, specialization, coachingStyle, brandName } = req.body;

    const avatar = await Avatar.findActiveByUser(req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'No active avatar found',
        code: 'NO_AVATAR_FOUND'
      });
    }

    // Update settings
    if (personality) avatar.personality = personality;
    if (specialization) avatar.specialization = specialization;
    if (brandName) avatar.brandName = brandName;
    if (coachingStyle) {
      avatar.coachingStyle = { ...avatar.coachingStyle, ...coachingStyle };
    }

    await avatar.save();

    res.json({
      success: true,
      message: 'Avatar settings updated successfully',
      avatar: {
        personality: avatar.personality,
        specialization: avatar.specialization,
        brandName: avatar.brandName,
        coachingStyle: avatar.coachingStyle
      }
    });

  } catch (error) {
    console.error('❌ [PEXLIB] Settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      code: 'SETTINGS_UPDATE_ERROR'
    });
  }
});

// @route   POST /api/avatar/feedback
// @desc    Submit feedback for avatar
// @access  Private
router.post('/feedback', auth, logAvatarOperation('FEEDBACK'), async (req, res) => {
  try {
    const { rating, comment, category = 'general' } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
        code: 'INVALID_RATING'
      });
    }

    const avatar = await Avatar.findActiveByUser(req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'No active avatar found',
        code: 'NO_AVATAR_FOUND'
      });
    }

    await avatar.addUserFeedback(rating, comment, category);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      currentRating: avatar.analytics.userSatisfactionRating
    });

  } catch (error) {
    console.error('❌ [PEXLIB] Feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      code: 'FEEDBACK_ERROR'
    });
  }
});

// @route   GET /api/avatar/health
// @desc    Check avatar health status
// @access  Private
router.get('/health', auth, async (req, res) => {
  try {
    const avatar = await Avatar.findActiveByUser(req.user.id);

    if (!avatar) {
      return res.json({
        success: true,
        status: 'no_avatar',
        message: 'No avatar configured'
      });
    }

    // Update health status
    await avatar.updateHealthStatus('active');

    res.json({
      success: true,
      status: 'healthy',
      avatar: {
        id: avatar._id,
        name: avatar.name,
        status: avatar.status.currentStatus,
        lastHealthCheck: avatar.status.lastHealthCheck,
        uptime: new Date() - avatar.createdAt,
        readyPlayerMeConnected: !!avatar.avatarUrl
      }
    });

  } catch (error) {
    console.error('❌ [PEXLIB] Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
});

// Legacy routes for compatibility
router.get('/', auth, async (req, res) => {
  // Redirect to current avatar
  res.redirect('/api/avatar/current');
});

router.post('/', auth, async (req, res) => {
  // Redirect to save avatar
  res.redirect(307, '/api/avatar/save');
});

module.exports = router;