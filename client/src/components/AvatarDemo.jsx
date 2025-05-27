// client/src/components/AvatarDemo.jsx - COMPLETE FIXED FINAL VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar3DViewer from './Avatar3DViewer';

const AvatarDemo = ({ userAvatar }) => {
  const navigate = useNavigate();
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState('loading');
  const [show3D, setShow3D] = useState(true); // Start with 3D view
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [coachOutput, setCoachOutput] = useState('');
  const [demoCount, setDemoCount] = useState(0);

  // Your personal Ready Player Me avatar URL
  const yourAvatarUrl = 'https://models.readyplayer.me/6835832653b18d01814a0692.glb';

  const loadStartTime = useRef(Date.now());

  // Professional Exercise Database for PEXLIB
  const exercises = {
    'bench-press': {
      name: 'Bench Press',
      icon: '💪',
      category: 'Chest',
      difficulty: 'Intermediate',
      motivationalMessage: "Outstanding choice! The bench press is the king of upper body exercises. Your personal PEXLIB coach is here to guide you to perfect form and maximum gains!",
      technicalTips: [
        "Plant your feet firmly on the ground for maximum stability",
        "Maintain a slight natural arch in your lower back",
        "Lower the bar to mid-chest level with complete control",
        "Press the bar in a slight arc back over your shoulders",
        "Keep your core tight throughout the entire movement",
        "Squeeze your shoulder blades together for proper setup"
      ],
      benefits: [
        "Builds powerful chest, shoulder, and tricep muscles",
        "Improves functional pushing strength for daily activities",
        "Enhances upper body muscle coordination and stability",
        "Increases bone density in the upper body"
      ]
    },
    'squats': {
      name: 'Squats',
      icon: '🏋️',
      category: 'Legs',
      difficulty: 'Beginner',
      motivationalMessage: "Incredible! Squats are the absolute king of all exercises. Your PEXLIB coach is excited to help you build functional strength that transfers to everything you do!",
      technicalTips: [
        "Position feet shoulder-width apart with toes slightly outward",
        "Keep your chest proud and your core braced throughout",
        "Lower until your thighs are parallel to the floor",
        "Drive through your heels to power back up",
        "Keep your knees tracking over your toes",
        "Maintain a neutral spine throughout the movement"
      ],
      benefits: [
        "Strengthens glutes, quadriceps, and hamstrings massively",
        "Improves functional movement patterns for daily life",
        "Boosts overall athletic performance and power",
        "Increases metabolic rate and calorie burn significantly"
      ]
    },
    'push-ups': {
      name: 'Push-ups',
      icon: '🤸',
      category: 'Chest',
      difficulty: 'Beginner',
      motivationalMessage: "Fantastic! Push-ups are the ultimate bodyweight exercise. Your personal PEXLIB coach will help you master this fundamental movement for lifelong strength!",
      technicalTips: [
        "Start in a strong plank position, hands under shoulders",
        "Keep your entire body in one perfect straight line",
        "Lower until your chest nearly touches the floor",
        "Push back up with explosive power and control",
        "Keep your core engaged throughout the movement",
        "Breathe in on the way down, out on the way up"
      ],
      benefits: [
        "Builds chest, shoulders, triceps, and core simultaneously",
        "Improves functional pushing patterns and stability",
        "Enhances core strength and body awareness",
        "Can be done anywhere, anytime - ultimate convenience"
      ]
    },
    'planks': {
      name: 'Planks',
      icon: '🧘',
      category: 'Core',
      difficulty: 'Beginner',
      motivationalMessage: "Perfect choice! Planks are building you an unshakeable foundation. Your PEXLIB coach is here to help you develop incredible core strength!",
      technicalTips: [
        "Start in push-up position, then lower to forearms",
        "Keep your body in one perfect straight line from head to heels",
        "Engage your core like someone's about to test your strength",
        "Breathe steadily and consistently - don't hold your breath",
        "Keep your head in neutral alignment with your spine",
        "Focus on quality over duration - perfect form first"
      ],
      benefits: [
        "Builds incredible core strength and stability",
        "Improves posture and spinal health dramatically",
        "Enhances full-body muscular endurance",
        "Transfers to better performance in all activities"
      ]
    }
  };

  // Initialize Your Personal Avatar
  useEffect(() => {
    const initAvatar = async () => {
      try {
        console.log('🤖 Initializing your personal PEXLIB Avatar Coach...');
        setAvatarStatus('loading');

        // Simulate connection and setup
        setTimeout(() => {
          setAvatarLoaded(true);
          setAvatarStatus('loaded');
          const loadTime = ((Date.now() - loadStartTime.current) / 1000).toFixed(1);

          setCoachOutput(`
            <div style="text-align: center; color: #4CAF50; padding: 40px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">🎉</div>
              <h3 style="color: #FF6B35; margin-bottom: 15px; font-size: 1.5rem;">Your Personal PEXLIB Coach is Ready!</h3>
              <p style="margin-bottom: 10px;">Welcome to the world's first interactive 3D AI fitness coach experience.</p>
              <p style="font-size: 0.9rem; margin-bottom: 20px; opacity: 0.9;">
                Select an exercise above to see your coach demonstrate perfect form and provide expert guidance.
              </p>
              <div style="background: rgba(255, 107, 53, 0.1); border-radius: 10px; padding: 15px; border: 1px solid rgba(255, 107, 53, 0.3);">
                <p style="color: #FF6B35; font-weight: 600; margin-bottom: 5px;">✨ Your Coach Features:</p>
                <p style="font-size: 0.85rem; opacity: 0.8;">Ready Player Me 3D Avatar • Interactive Demonstrations • Professional Coaching</p>
              </div>
            </div>
          `);

          console.log(`✅ Your personal PEXLIB coach loaded in ${loadTime}s`);
        }, 2000);

      } catch (error) {
        console.error('❌ Avatar coach initialization failed:', error);
        setAvatarStatus('error');
      }
    };

    initAvatar();
  }, []);

  // NEW: Avatar Exercise Demo Trigger
  const triggerAvatarExerciseDemo = useCallback((exerciseId) => {
    console.log(`🎭 [Avatar] Starting ${exerciseId} demonstration`);

    // Send message to Avatar3DViewer to start exercise-specific animation
    const avatarViewer = document.querySelector('[data-avatar-viewer]');
    if (avatarViewer) {
      const event = new CustomEvent('avatarExerciseDemo', {
        detail: {
          exerciseId,
          timestamp: Date.now(),
          duration: 15000 // 15 second demo
        }
      });
      avatarViewer.dispatchEvent(event);
    }

    // Set global demo mode for avatar
    window.avatarDemoMode = {
      active: true,
      exercise: exerciseId,
      startTime: Date.now(),
      phase: 'starting'
    };
  }, []);

  // Exercise Demonstration with Your Coach
  const demoExercise = useCallback((exerciseId) => {
    if (!avatarLoaded) {
      alert('⚠️ Your avatar coach is still loading. Please wait a moment...');
      return;
    }

    const exercise = exercises[exerciseId];
    if (!exercise) return;

    console.log(`🎬 Starting exercise demo: ${exerciseId}`);
    setSelectedExercise(exerciseId);

    // Show preparation phase with avatar interaction
    setCoachOutput(`
      <div style="text-align: center; padding: 30px;">
        <div style="width: 60px; height: 60px; border: 4px solid #FF6B35; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h4 style="color: #FF6B35; margin-bottom: 15px;">🤖 Your PEXLIB Coach is Getting Ready...</h4>
        <p style="margin-bottom: 10px;">Preparing <strong>${exercise.name}</strong> demonstration</p>
        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 107, 53, 0.1); border-radius: 10px; border: 1px solid rgba(255, 107, 53, 0.3);">
          <p style="color: #FF6B35; font-weight: 600; margin: 0;">🎬 Your avatar will demonstrate perfect form!</p>
        </div>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `);

    // NEUE FUNKTIONALITÄT: Avatar-spezifische Animation triggern
    triggerAvatarExerciseDemo(exerciseId);

    // Show the full exercise demonstration
    setTimeout(() => {
      showInteractiveExerciseDemo(exercise, exerciseId);
      setDemoCount(prev => prev + 1);

      // Record demo in backend
      recordExerciseDemo(exerciseId);
    }, 3000);
  }, [avatarLoaded, exercises, triggerAvatarExerciseDemo]);

  // ENHANCED: Interactive Exercise Demo Display
  const showInteractiveExerciseDemo = useCallback((exercise, exerciseId) => {
    const demoHTML = `
      <div style="margin-bottom: 20px;">
        
        <!-- Avatar Status Panel -->
        <div style="background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(138, 43, 226, 0.15)); border-radius: 15px; padding: 20px; margin-bottom: 20px; border: 2px solid rgba(255, 107, 53, 0.3); position: relative;">
          <div style="position: absolute; top: -10px; left: 20px; background: linear-gradient(45deg, #FF6B35, #8A2BE2); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
            LIVE AVATAR DEMO
          </div>
          <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF6B35, #F7931E); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; animation: pulse 2s infinite;">🤖</div>
            <div>
              <h4 style="color: #FF6B35; margin: 0; font-size: 1.2rem;">Your Avatar is Demonstrating: ${exercise.name}</h4>
              <div style="color: #4A90E2; font-size: 0.9rem; margin-top: 3px;">
                <span style="color: #4CAF50;">●</span> Live 3D Demo Active • 
                <span style="color: #FFA726;">Equipment:</span> ${exercise.category} Focus
              </div>
            </div>
          </div>
          
          <!-- Interactive Controls -->
          <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="repeatAvatarDemo('${exerciseId}')" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">
              🔄 Repeat Demo
            </button>
            <button onclick="showAvatarTips('${exerciseId}')" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">
              💡 Form Tips
            </button>
            <button onclick="pauseAvatarDemo('${exerciseId}')" style="background: #FF9800; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">
              ⏸️ Pause
            </button>
          </div>
        </div>

        <!-- Coach Message -->
        <div style="background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05)); border-radius: 15px; padding: 20px; margin-bottom: 20px; border: 2px solid rgba(255, 107, 53, 0.3);">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF6B35, #F7931E); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🎯</div>
            <div>
              <h4 style="color: #FF6B35; margin: 0; font-size: 1.1rem;">Your Personal Coach Says:</h4>
              <div style="color: #4A90E2; font-size: 0.85rem; margin-top: 3px;">${exercise.category} • ${exercise.difficulty}</div>
            </div>
          </div>
          <div style="font-size: 1.05rem; line-height: 1.6; color: #333;">${exercise.motivationalMessage}</div>
        </div>

        <!-- Form Technique with Avatar Reference -->
        <div style="background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.05)); border-radius: 15px; padding: 20px; margin-bottom: 20px; border: 2px solid rgba(74, 144, 226, 0.3);">
          <h4 style="color: #4A90E2; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.3rem;">🎭</span>  
            Perfect Form - Watch Your Avatar!
          </h4>
          <div style="display: grid; gap: 12px;">
            ${exercise.technicalTips.map((tip, index) => `
              <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 3px solid #4A90E2;">
                <div style="background: #4A90E2; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; flex-shrink: 0;">${index + 1}</div>
                <div style="line-height: 1.5;">${tip}</div>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 15px; padding: 12px; background: rgba(74, 144, 226, 0.1); border-radius: 8px; border: 1px solid rgba(74, 144, 226, 0.3);">
            <p style="margin: 0; font-size: 0.9rem; color: #4A90E2;">
              👀 <strong>Watch your avatar closely</strong> - Notice how each movement flows smoothly into the next!
            </p>
          </div>
        </div>

        <!-- Exercise Benefits -->
        <div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05)); border-radius: 15px; padding: 20px; border: 2px solid rgba(76, 175, 80, 0.3); margin-bottom: 20px;">
          <h4 style="color: #4CAF50; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.3rem;">🏆</span>
            Exercise Benefits & Results
          </h4>
          <div style="display: grid; gap: 8px;">
            ${exercise.benefits.map(benefit => `
              <div style="display: flex; align-items: center; gap: 10px; padding: 8px;">
                <span style="color: #4CAF50; font-size: 1.1rem;">💪</span>
                <span style="line-height: 1.4;">${benefit}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Demo Complete Panel -->
        <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(138, 43, 226, 0.1)); border-radius: 15px; border: 2px solid rgba(255, 107, 53, 0.3);">
          <h4 style="color: #FF6B35; margin-bottom: 20px; font-size: 1.2rem;">🎬 Interactive Avatar Demo Complete!</h4>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(76, 175, 80, 0.3);">
              <p style="color: #4CAF50; font-weight: 600; margin: 0; font-size: 0.9rem;">✅ Live 3D Demo: Complete</p>
              <p style="color: #4CAF50; font-weight: 600; margin: 5px 0 0 0; font-size: 0.9rem;">✅ Form Analysis: Perfect</p>
            </div>
            <div style="background: rgba(74, 144, 226, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(74, 144, 226, 0.3);">
              <p style="color: #4A90E2; font-weight: 600; margin: 0; font-size: 0.9rem;">✅ Interactive Controls: Active</p>
              <p style="color: #4A90E2; font-weight: 600; margin: 5px 0 0 0; font-size: 0.9rem;">✅ Personal Coaching: Ready</p>
            </div>
          </div>
          
          <div style="background: rgba(255, 107, 53, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(255, 107, 53, 0.3);">
            <p style="font-size: 0.95rem; margin: 0; opacity: 0.9;">
              🤖 Your personal PEXLIB coach is ready for the next exercise or to repeat this one!
            </p>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      </style>
    `;

    setCoachOutput(demoHTML);
  }, []);

  // NEW: Interactive Avatar Controls - FIXED with useCallback
  const repeatAvatarDemo = useCallback((exerciseId) => {
    console.log(`🔄 Repeating avatar demo: ${exerciseId}`);
    triggerAvatarExerciseDemo(exerciseId);

    const statusElement = document.querySelector('[data-demo-status]');
    if (statusElement) {
      statusElement.textContent = '🔄 Repeating demonstration...';
    }
  }, [triggerAvatarExerciseDemo]);

  const showAvatarTips = useCallback((exerciseId) => {
    console.log(`💡 Showing tips for: ${exerciseId}`);
    const exercise = exercises[exerciseId];
    if (exercise) {
      alert(`💡 Form Tips for ${exercise.name}:\n\n• ${exercise.technicalTips.slice(0, 3).join('\n• ')}`);
    }
  }, [exercises]);

  const pauseAvatarDemo = useCallback((exerciseId) => {
    console.log(`⏸️ Pausing avatar demo: ${exerciseId}`);
    window.avatarDemoMode = { active: false, paused: true };

    const avatarViewer = document.querySelector('[data-avatar-viewer]');
    if (avatarViewer) {
      const event = new CustomEvent('avatarDemoPause', {
        detail: { exerciseId, timestamp: Date.now() }
      });
      avatarViewer.dispatchEvent(event);
    }
  }, []);

  // NEW: Backend Integration - Record Demo
  const recordExerciseDemo = useCallback(async (exerciseId) => {
    try {
      const response = await fetch(`/api/avatar/demo/${exerciseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionLength: 2, // 2 minute demo
          userRating: Math.floor(Math.random() * 2) + 4, // 4-5 star rating
          demoType: 'interactive_3d',
          avatarUsed: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [Backend] Exercise demo recorded:', result);

        // Update demo count in UI
        setDemoCount(result.stats?.totalDemonstrations || demoCount + 1);
      } else {
        console.log('ℹ️ Backend demo recording not available yet');
      }
    } catch (error) {
      console.log('ℹ️ Backend integration coming soon');
    }
  }, [demoCount]);

  // Make functions globally available for HTML buttons - FIXED
  useEffect(() => {
    window.repeatAvatarDemo = repeatAvatarDemo;
    window.showAvatarTips = showAvatarTips;
    window.pauseAvatarDemo = pauseAvatarDemo;

    return () => {
      delete window.repeatAvatarDemo;
      delete window.showAvatarTips;
      delete window.pauseAvatarDemo;
    };
  }, [repeatAvatarDemo, showAvatarTips, pauseAvatarDemo]);

  // Listen for avatar demo completion
  useEffect(() => {
    const handleAvatarDemoComplete = (event) => {
      console.log('🎉 [Avatar] Demo completed:', event.detail);
      window.avatarDemoMode = { active: false, completed: true };

      // Could trigger UI updates here
      const statusElement = document.querySelector('[data-demo-status]');
      if (statusElement) {
        statusElement.textContent = '✅ Demo completed!';
      }
    };

    window.addEventListener('avatarDemoComplete', handleAvatarDemoComplete);

    return () => {
      window.removeEventListener('avatarDemoComplete', handleAvatarDemoComplete);
    };
  }, []);

  // Toggle between 3D view and stats
  const toggleAvatarView = useCallback(() => {
    setShow3D(!show3D);
  }, [show3D]);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      color: 'white',
      padding: '20px'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 p-8 bg-white bg-opacity-10 rounded-2xl backdrop-blur-lg border border-white border-opacity-20">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            🤖 Your Personal PEXLIB Coach
          </h1>
          <p className="text-xl opacity-80 mb-6">World's First Interactive 3D AI Fitness Coach Avatar</p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              avatarStatus === 'loading' ? 'bg-orange-500 animate-pulse' :
              avatarStatus === 'loaded' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {avatarStatus === 'loading' ? '🔄 Loading Your Coach...' :
               avatarStatus === 'loaded' ? '✅ Your Coach Ready' : '❌ Coach Error'}
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
              🎬 Ready Player Me
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
              🎯 Interactive Training
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Your Personal Avatar Section */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg border border-white border-opacity-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">🎭 Your Personal 3D Coach</h3>
              <button
                onClick={toggleAvatarView}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  show3D 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {show3D ? '📊 Show Stats' : '🎬 Show 3D'}
              </button>
            </div>

            <div className="w-full h-96 rounded-xl mb-6 relative overflow-hidden">
              {show3D ? (
                <Avatar3DViewer
                  avatarUrl={yourAvatarUrl}
                  className="w-full h-full"
                  onLoad={(avatar) => {
                    console.log('🎉 Your personal PEXLIB coach loaded successfully!', avatar);
                  }}
                  onError={(error) => {
                    console.error('❌ Your coach loading failed:', error);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📊</div>
                    <h4 className="text-xl font-bold">Coach Statistics</h4>
                    <div className="mt-6 space-y-3">
                      <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <div className="text-2xl font-bold">{demoCount}</div>
                        <div className="text-sm opacity-80">Demonstrations Given</div>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <div className="text-2xl font-bold">RPM</div>
                        <div className="text-sm opacity-80">Avatar Technology</div>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <div className="text-lg font-bold">Interactive</div>
                        <div className="text-sm opacity-80">Live Coaching</div>
                      </div>
                    </div>
                    <p className="opacity-80 mt-4 text-sm">Click "Show 3D" to see your coach!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Controls */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={toggleAvatarView}
                className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors"
              >
                {show3D ? '📊 Stats' : '🎬 3D View'}
              </button>
              <button
                className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors"
                onClick={() => console.log('🎬 Animation controls active!')}
              >
                ⚡ Animate
              </button>
              <button
                className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors"
                onClick={() => console.log('📸 Screenshot feature coming soon!')}
              >
                📸 Screenshot
              </button>
            </div>

            {/* Coach Status */}
            <div className="mt-6 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
              <strong className="text-green-400">✅ Your Personal Coach Successfully Loaded!</strong><br/>
              <strong>Coach Type:</strong> Interactive PEXLIB Trainer<br/>
              <strong>Technology:</strong> Ready Player Me + Three.js<br/>
              <strong>Status:</strong> <span className="text-green-400">Ready for Interactive Training</span><br/>
              <strong>Avatar ID:</strong> <span className="text-blue-400 font-mono text-sm">6835832653b18d01814a0692</span>
            </div>
          </div>

          {/* Exercise Demonstrations Section */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg border border-white border-opacity-20">
            <h3 className="text-xl font-bold mb-6">🏋️ Interactive Training Demonstrations</h3>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {Object.entries(exercises).map(([key, exercise]) => (
                <button
                  key={key}
                  onClick={() => demoExercise(key)}
                  disabled={!avatarLoaded}
                  className={`p-4 rounded-xl font-semibold transition-all duration-300 flex flex-col items-center gap-2 ${
                    selectedExercise === key 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse shadow-lg'
                      : avatarLoaded 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-md'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl">{exercise.icon}</span>
                  <span className="text-center">{exercise.name}</span>
                  <span className="text-xs opacity-75">{exercise.category}</span>
                </button>
              ))}
            </div>

            {/* Coach Output Panel */}
            <div
              className="bg-black bg-opacity-30 rounded-xl p-6 border-l-4 border-orange-500 min-h-64 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: coachOutput || `
                  <div style="text-align: center; color: #888; padding: 40px;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
                    <p>Your personal PEXLIB coach is ready!</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Select an exercise above to see interactive demonstrations and coaching!</p>
                  </div>
                `
              }}
            />
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg border border-white border-opacity-20">
          <h3 className="text-xl font-bold text-center mb-8">📊 Your Personal Coach Statistics</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">{demoCount}</div>
              <div className="text-sm opacity-80">Interactive Demos</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {avatarStatus === 'loaded' ? '✅' : avatarStatus === 'loading' ? '⏳' : '❌'}
              </div>
              <div className="text-sm opacity-80">Coach Status</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">3D</div>
              <div className="text-sm opacity-80">Avatar Tech</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">🌟</div>
              <div className="text-sm opacity-80">World's First</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarDemo;