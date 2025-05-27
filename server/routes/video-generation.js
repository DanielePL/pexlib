// server/routes/video-generation.js
const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise');

// Mock video URLs for testing
const MOCK_VIDEO_URLS = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
];

// POST /api/video-generation/generate - Generate video for exercise
router.post('/generate', async (req, res) => {
  try {
    const { exerciseId, style = '3d_avatar', priority = 'normal' } = req.body;

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Check if video already exists
    if (exercise.videoDemo && exercise.videoDemo !== '/api/placeholder/video') {
      return res.json({
        success: true,
        message: 'Video already exists',
        videoUrl: exercise.videoDemo,
        status: 'completed'
      });
    }

    // Generate mock job ID
    const jobId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Update exercise with generation status
    exercise.videoGenerationJobId = jobId;
    exercise.videoGenerationStatus = 'processing';
    exercise.videoGenerationStarted = new Date();
    exercise.videoGenerationService = style;
    exercise.videoGenerationAttempts = (exercise.videoGenerationAttempts || 0) + 1;
    await exercise.save();

    // Simulate video generation completion after 5 seconds
    setTimeout(async () => {
      try {
        const mockVideoUrl = MOCK_VIDEO_URLS[Math.floor(Math.random() * MOCK_VIDEO_URLS.length)];

        exercise.videoDemo = mockVideoUrl;
        exercise.videoGenerationStatus = 'completed';
        exercise.videoGenerationCompleted = new Date();
        exercise.videoGenerationCost = style === '3d_avatar' ? 0.10 : 0.50;
        await exercise.save();

        console.log(`Mock video generation completed for ${exercise.name}: ${mockVideoUrl}`);
      } catch (error) {
        console.error('Mock generation completion error:', error);
        exercise.videoGenerationStatus = 'failed';
        exercise.videoGenerationError = error.message;
        await exercise.save();
      }
    }, 5000);

    res.json({
      success: true,
      message: 'Video generation started',
      jobId: jobId,
      estimatedTime: '5 seconds (mock)',
      exerciseId: exerciseId
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start video generation',
      error: error.message
    });
  }
});

// GET /api/video-generation/status/:jobId - Check generation status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const exercise = await Exercise.findOne({ videoGenerationJobId: jobId });
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Calculate progress based on elapsed time
    const startTime = exercise.videoGenerationStarted;
    const now = new Date();
    const elapsed = now - startTime;
    const progress = Math.min(Math.floor((elapsed / 5000) * 100), 100);

    let status = exercise.videoGenerationStatus;
    if (status === 'processing' && elapsed >= 5000) {
      status = 'completed';
    }

    res.json({
      success: true,
      status: status,
      progress: progress,
      videoUrl: exercise.videoDemo,
      jobId: jobId,
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      service: exercise.videoGenerationService || 'mock'
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check status',
      error: error.message
    });
  }
});

// POST /api/video-generation/batch - Batch generate videos
router.post('/batch', async (req, res) => {
  try {
    const { exerciseIds, style = '3d_avatar', priority = 'normal' } = req.body;

    if (!exerciseIds || !Array.isArray(exerciseIds)) {
      return res.status(400).json({
        success: false,
        message: 'Exercise IDs array is required'
      });
    }

    const batchJobs = [];
    const errors = [];

    for (let i = 0; i < exerciseIds.length; i++) {
      const exerciseId = exerciseIds[i];
      try {
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
          errors.push({ exerciseId, error: 'Exercise not found' });
          continue;
        }

        // Skip if video already exists
        if (exercise.videoDemo && exercise.videoDemo !== '/api/placeholder/video') {
          continue;
        }

        const jobId = `mock_batch_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;

        exercise.videoGenerationJobId = jobId;
        exercise.videoGenerationStatus = 'queued';
        exercise.videoGenerationStarted = new Date();
        exercise.videoGenerationService = style;
        exercise.videoGenerationAttempts = (exercise.videoGenerationAttempts || 0) + 1;
        await exercise.save();

        batchJobs.push({
          exerciseId: exercise._id,
          exerciseName: exercise.name,
          jobId: jobId,
          status: 'queued'
        });

        // Simulate staggered completion
        const delay = i * 3000; // 3 seconds apart
        setTimeout(async () => {
          try {
            const mockVideoUrl = MOCK_VIDEO_URLS[Math.floor(Math.random() * MOCK_VIDEO_URLS.length)];

            exercise.videoGenerationStatus = 'processing';
            await exercise.save();

            // Complete after another 5 seconds
            setTimeout(async () => {
              exercise.videoDemo = mockVideoUrl;
              exercise.videoGenerationStatus = 'completed';
              exercise.videoGenerationCompleted = new Date();
              exercise.videoGenerationCost = style === '3d_avatar' ? 0.10 : 0.50;
              await exercise.save();

              console.log(`Mock batch video completed for ${exercise.name}`);
            }, 5000);

          } catch (error) {
            console.error('Mock batch completion error:', error);
            exercise.videoGenerationStatus = 'failed';
            exercise.videoGenerationError = error.message;
            await exercise.save();
          }
        }, delay);

      } catch (error) {
        errors.push({ exerciseId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Batch generation started for ${batchJobs.length} exercises`,
      jobs: batchJobs,
      errors: errors,
      batchId: `mock_batch_${Date.now()}`,
      estimatedTotalTime: `${batchJobs.length * 8} seconds (mock)`
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start batch generation',
      error: error.message
    });
  }
});

// GET /api/video-generation/exercises/pending - Get exercises needing videos
router.get('/exercises/pending', async (req, res) => {
  try {
    const { limit = 50, muscleGroup, category } = req.query;

    const filter = {
      approved: true,
      $or: [
        { videoDemo: { $exists: false } },
        { videoDemo: '/api/placeholder/video' },
        { videoDemo: '' },
        { videoDemo: null }
      ]
    };

    if (muscleGroup && muscleGroup !== 'All') {
      filter.muscleGroup = muscleGroup;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const exercises = await Exercise.find(filter)
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('name muscleGroup category difficulty equipment usageCount videoGenerationStatus');

    res.json({
      success: true,
      exercises: exercises,
      count: exercises.length
    });

  } catch (error) {
    console.error('Pending exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending exercises',
      error: error.message
    });
  }
});

// GET /api/video-generation/stats - Get video generation statistics
router.get('/stats', async (req, res) => {
  try {
    const totalExercises = await Exercise.countDocuments({ approved: true });

    const withVideo = await Exercise.countDocuments({
      approved: true,
      videoDemo: {
        $exists: true,
        $ne: '/api/placeholder/video',
        $ne: '',
        $ne: null
      }
    });

    const pending = await Exercise.countDocuments({
      approved: true,
      $or: [
        { videoDemo: { $exists: false } },
        { videoDemo: '/api/placeholder/video' },
        { videoDemo: '' },
        { videoDemo: null }
      ]
    });

    const processing = await Exercise.countDocuments({
      videoGenerationStatus: { $in: ['processing', 'queued'] }
    });

    const failed = await Exercise.countDocuments({
      videoGenerationStatus: 'failed'
    });

    const totalCost = await Exercise.aggregate([
      { $match: { videoGenerationCost: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$videoGenerationCost' } } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalExercises,
        withVideo,
        pending,
        processing,
        failed,
        totalCost: totalCost[0]?.total || 0,
        completionPercentage: totalExercises > 0 ? Math.round((withVideo / totalExercises) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

module.exports = router;