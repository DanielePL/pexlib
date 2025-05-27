// client/src/components/AvatarDemo.jsx - PEXLIB Avatar Demo als React Component
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AvatarDemo = () => {
  const navigate = useNavigate();
  const [demoCount, setDemoCount] = useState(0);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState('loading');
  const [loadTime, setLoadTime] = useState('--');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [coachOutput, setCoachOutput] = useState('');

  const avatarViewerRef = useRef(null);
  const sceneRef = useRef(null);
  const loadStartTime = useRef(Date.now());

  // Exercise Database
  const exercises = {
    'bench-press': {
      name: 'Bench Press',
      icon: '💪',
      motivationalMessage: "Outstanding choice! The bench press is the king of upper body exercises. You're building serious chest strength here - let's nail that perfect form together!",
      technicalTips: [
        "Plant your feet firmly on the ground for stability",
        "Maintain a slight natural arch in your lower back",
        "Lower the bar to mid-chest level with complete control",
        "Press the bar in a slight arc back over your shoulders",
        "Keep your core tight throughout the entire movement"
      ],
      benefits: [
        "Builds powerful chest, shoulder, and tricep muscles",
        "Improves functional pushing strength for daily activities",
        "Enhances upper body muscle coordination",
        "Increases bone density in the upper body"
      ],
      safetyTips: [
        "Always use a spotter for heavy weights",
        "Never bounce the bar off your chest",
        "Keep your wrists straight and strong"
      ]
    },
    'squats': {
      name: 'Squats',
      icon: '🏋️',
      motivationalMessage: "Incredible! Squats are the absolute king of all exercises. You're building functional strength that transfers to everything you do. Your legs are going to be powerhouses!",
      technicalTips: [
        "Position feet shoulder-width apart with toes slightly outward",
        "Keep your chest proud and your core braced",
        "Lower until your thighs are parallel to the floor",
        "Drive through your heels to power back up",
        "Keep your knees tracking over your toes"
      ],
      benefits: [
        "Strengthens glutes, quadriceps, and hamstrings massively",
        "Improves functional movement for daily activities",
        "Boosts overall athletic performance",
        "Increases metabolic rate and calorie burn"
      ],
      safetyTips: [
        "Never let your knees Cave inward",
        "Don't round your back at the bottom",
        "Start with bodyweight before adding load"
      ]
    },
    'push-ups': {
      name: 'Push-ups',
      icon: '🤸',
      motivationalMessage: "Fantastic! Push-ups are the ultimate bodyweight exercise. You're building functional strength and endurance - this exercise will make you strong for life!",
      technicalTips: [
        "Start in a strong plank position, hands under shoulders",
        "Keep your entire body in a perfect straight line",
        "Lower until your chest nearly touches the floor",
        "Push back up with explosive power and control",
        "Keep your core engaged throughout"
      ],
      benefits: [
        "Builds chest, shoulders, triceps, and core simultaneously",
        "Improves functional pushing patterns",
        "Enhances core stability and body awareness",
        "Can be done anywhere, anytime"
      ],
      safetyTips: [
        "Don't let your hips sag or pike up",
        "Keep your head in neutral position",
        "Start on knees if full push-ups are too challenging"
      ]
    },
    'planks': {
      name: 'Planks',
      icon: '🧘',
      motivationalMessage: "Perfect choice! Planks are building you an unshakeable foundation. Your core is getting stronger with every second you hold - you're building real functional strength!",
      technicalTips: [
        "Start in push-up position, then lower to forearms",
        "Keep your body in one perfect straight line",
        "Engage your core like someone's about to punch you",
        "Breathe steadily - don't hold your breath",
        "Keep your head in neutral alignment"
      ],
      benefits: [
        "Builds incredible core strength and stability",
        "Improves posture and spinal health",
        "Enhances full-body muscular endurance",
        "Transfers to better performance in all activities"
      ],
      safetyTips: [
        "Don't let your lower back sag",
        "Avoid piking your hips up",
        "Stop if you feel pain in your lower back"
      ]
    }
  };

  // Initialize Avatar System
  useEffect(() => {
    const initAvatar = async () => {
      try {
        console.log('🤖 Initializing PEXLIB Avatar System...');
        setAvatarStatus('loading');

        // Simulate avatar loading
        setTimeout(() => {
          setAvatarLoaded(true);
          setAvatarStatus('loaded');
          const loadTime = ((Date.now() - loadStartTime.current) / 1000).toFixed(1);
          setLoadTime(loadTime);

          setCoachOutput(`
            <div style="text-align: center; color: #4CAF50; padding: 40px;">
              <div style="font-size: 2rem; margin-bottom: 10px;">🎉</div>
              <h4 style="color: #4CAF50; margin-bottom: 15px;">Your AI Avatar Coach is Ready!</h4>
              <p>Select an exercise above to see your personalized coach in action.</p>
              <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">
                Your avatar will demonstrate proper form and provide expert coaching tips.
              </p>
            </div>
          `);
        }, 2000);

      } catch (error) {
        console.error('❌ Avatar initialization failed:', error);
        setAvatarStatus('error');
      }
    };

    initAvatar();
  }, []);

  // Exercise Demo Function
  const demoExercise = (exerciseId) => {
    if (!avatarLoaded) {
      alert('⚠️ Avatar is still loading. Please wait...');
      return;
    }

    const exercise = exercises[exerciseId];
    if (!exercise) return;

    setSelectedExercise(exerciseId);

    // Show loading
    setCoachOutput(`
      <div style="text-align: center; padding: 40px;">
        <div class="loading"></div>
        <p style="margin-top: 15px;">Your Avatar Coach is analyzing the exercise...</p>
        <p style="font-size: 0.9rem; color: #888; margin-top: 10px;">Preparing personalized demonstration and tips...</p>
      </div>
    `);

    // Simulate processing
    setTimeout(() => {
      showExerciseDemo(exercise);
      setDemoCount(prev => prev + 1);
    }, 2000);
  };

  // Show Exercise Demo
  const showExerciseDemo = (exercise) => {
    const demoHTML = `
      <div class="coach-message" style="background: rgba(255, 107, 53, 0.1); border-radius: 10px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255, 107, 53, 0.3);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: 600;">
          <span style="font-size: 1.5rem;">🤖</span>
          <span>Your PEXLIB AI Coach Says:</span>
        </div>
        <div style="font-size: 1.1rem; line-height: 1.5;">${exercise.motivationalMessage}</div>
      </div>

      <div style="background: rgba(74, 144, 226, 0.1); border-radius: 10px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(74, 144, 226, 0.3);">
        <h4 style="color: #4A90E2; margin-bottom: 15px;">🎯 Perfect Form Technique:</h4>
        <ul style="list-style: none; padding: 0;">
          ${exercise.technicalTips.map((tip, index) => `
            <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
              <span style="position: absolute; left: 0; color: #4A90E2; font-weight: bold;">${index + 1}.</span>
              ${tip}
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="background: rgba(76, 175, 80, 0.1); border-radius: 10px; padding: 15px; border: 1px solid rgba(76, 175, 80, 0.3); margin-bottom: 15px;">
        <h4 style="color: #4CAF50; margin-bottom: 10px;">🏆 Exercise Benefits:</h4>
        <ul style="list-style: none; padding: 0;">
          ${exercise.benefits.map(benefit => `
            <li style="margin-bottom: 8px; padding-left: 25px; position: relative;">
              <span style="position: absolute; left: 0; color: #4CAF50;">💪</span>
              ${benefit}
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="margin-top: 20px; text-align: center; padding: 20px; background: rgba(255, 107, 53, 0.1); border-radius: 10px; border: 1px solid rgba(255, 107, 53, 0.3);">
        <h4 style="color: #FF6B35; margin-bottom: 15px;">🎬 PEXLIB Avatar Demo Complete!</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <p style="color: #4CAF50; font-weight: 600;">✅ Form Analysis: Complete</p>
            <p style="color: #4CAF50; font-weight: 600;">✅ Coaching Tips: Delivered</p>
          </div>
          <div>
            <p style="color: #4CAF50; font-weight: 600;">✅ Safety Check: Passed</p>
            <p style="color: #4CAF50; font-weight: 600;">✅ Benefits: Explained</p>
          </div>
        </div>
        <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.9;">
          🤖 Your AI Coach is ready for the next exercise demonstration!
        </p>
      </div>
    `;

    setCoachOutput(demoHTML);
  };

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
            🤖 PEXLIB Avatar Coach Demo
          </h1>
          <p className="text-xl opacity-80 mb-6">World's First Professional AI Fitness Coach Avatar</p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              avatarStatus === 'loading' ? 'bg-orange-500 animate-pulse' :
              avatarStatus === 'loaded' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {avatarStatus === 'loading' ? '🔄 Loading Avatar...' :
               avatarStatus === 'loaded' ? '✅ Avatar Ready' : '❌ Avatar Error'}
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
              🤖 Motivational Coach
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
              🎯 General Fitness
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
          {/* Avatar Section */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg border border-white border-opacity-20">
            <h3 className="text-xl font-bold mb-6">🎭 Your Avatar Coach</h3>

            <div
              ref={avatarViewerRef}
              className="w-full h-96 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden"
            >
              {!avatarLoaded ? (
                <div className="text-center text-white">
                  <div className="text-6xl mb-4 animate-pulse">🤖</div>
                  <h4 className="text-xl font-bold">Loading Avatar Coach...</h4>
                  <p className="opacity-80">Connecting to Ready Player Me...</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎉</div>
                  <h4 className="text-xl font-bold">Avatar Loaded!</h4>
                  <p className="opacity-80">3D Avatar Ready for Demo</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                🔄 Reset View
              </button>
              <button className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                ⚡ Animate
              </button>
              <button className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                👕 Outfit
              </button>
            </div>

            <div className="mt-6 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
              <strong className="text-green-400">✅ Avatar Successfully Loaded!</strong><br/>
              <strong>Coach Name:</strong> PEXLIB Coach<br/>
              <strong>Personality:</strong> Motivational<br/>
              <strong>Specialization:</strong> General Fitness<br/>
              <strong>Status:</strong> <span className="text-green-400">Professional Ready</span>
            </div>
          </div>

          {/* Exercise Section */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg border border-white border-opacity-20">
            <h3 className="text-xl font-bold mb-6">🏋️ Exercise Demonstrations</h3>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {Object.entries(exercises).map(([key, exercise]) => (
                <button
                  key={key}
                  onClick={() => demoExercise(key)}
                  disabled={!avatarLoaded}
                  className={`p-4 rounded-xl font-semibold transition-all duration-300 flex flex-col items-center gap-2 ${
                    selectedExercise === key 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse'
                      : avatarLoaded 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-105'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl">{exercise.icon}</span>
                  {exercise.name}
                </button>
              ))}
            </div>

            <div
              className="bg-black bg-opacity-30 rounded-xl p-6 border-l-4 border-orange-500 min-h-64"
              dangerouslySetInnerHTML={{
                __html: coachOutput || `
                  <div style="text-align: center; color: #888; padding: 40px;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
                    <p>Avatar is loading... Please wait for your AI Coach to be ready!</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Once loaded, select an exercise to see demonstrations and coaching tips.</p>
                  </div>
                `
              }}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg border border-white border-opacity-20">
          <h3 className="text-xl font-bold text-center mb-8">📊 Avatar Coach Statistics</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">{demoCount}</div>
              <div className="text-sm opacity-80">Demos Given</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {avatarStatus === 'loaded' ? '✅' : avatarStatus === 'loading' ? '⏳' : '❌'}
              </div>
              <div className="text-sm opacity-80">Avatar Status</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">{loadTime}</div>
              <div className="text-sm opacity-80">Load Time (s)</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">🌟</div>
              <div className="text-sm opacity-80">World's First</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for loading animation */}
      <style jsx>{`
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #FF6B35;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .coach-message {
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default AvatarDemo;