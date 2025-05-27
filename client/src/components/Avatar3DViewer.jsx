// client/src/components/Avatar3DViewer.jsx - COMPLETE FIXED VERSION
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Avatar3DViewer = ({ avatarUrl, className, onLoad, onError }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const avatarRef = useRef(null);
  const animationFrameRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const mixerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [avatarInfo, setAvatarInfo] = useState(null);

  // Exercise Animation States
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exercisePhase, setExercisePhase] = useState('idle');
  const [demoActive, setDemoActive] = useState(false);

  // Exercise Animation Configurations
  const exerciseAnimations = {
    'bench-press': {
      name: 'Bench Press',
      phases: [
        {
          position: { y: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          duration: 1000,
          description: 'Starting position - lying on bench'
        },
        {
          position: { y: -0.1 },
          rotation: { x: 0.2, y: 0, z: 0 },
          duration: 1500,
          description: 'Lowering the weight - controlled descent'
        },
        {
          position: { y: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          duration: 1200,
          description: 'Pressing up - powerful movement'
        }
      ],
      loops: 3,
      restBetweenReps: 800,
      totalDuration: 12000
    },

    'squats': {
      name: 'Squats',
      phases: [
        {
          position: { y: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          duration: 1000,
          description: 'Standing tall - ready position'
        },
        {
          position: { y: -0.4 },
          rotation: { x: 0.3, y: 0, z: 0 },
          duration: 1800,
          description: 'Squatting down - hips back, knees out'
        },
        {
          position: { y: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          duration: 1400,
          description: 'Standing up - drive through heels'
        }
      ],
      loops: 4,
      restBetweenReps: 600,
      totalDuration: 15000
    },

    'push-ups': {
      name: 'Push-ups',
      phases: [
        {
          position: { y: 0 },
          rotation: { x: 0.1, y: 0, z: 0 },
          duration: 800,
          description: 'Plank position - body straight'
        },
        {
          position: { y: -0.2 },
          rotation: { x: 0.4, y: 0, z: 0 },
          duration: 1200,
          description: 'Lowering down - chest to floor'
        },
        {
          position: { y: 0 },
          rotation: { x: 0.1, y: 0, z: 0 },
          duration: 1000,
          description: 'Pushing up - strong extension'
        }
      ],
      loops: 5,
      restBetweenReps: 500,
      totalDuration: 18000
    },

    'planks': {
      name: 'Planks',
      phases: [
        {
          position: { y: 0 },
          rotation: { x: 0.15, y: 0, z: 0 },
          duration: 3000,
          description: 'Hold position - engage core'
        },
        {
          position: { y: 0 },
          rotation: { x: 0.18, y: 0, z: 0.02 },
          duration: 3000,
          description: 'Micro-adjustment - maintain tension'
        },
        {
          position: { y: 0 },
          rotation: { x: 0.15, y: 0, z: 0 },
          duration: 3000,
          description: 'Hold steady - breathe consistently'
        }
      ],
      loops: 2,
      restBetweenReps: 1000,
      totalDuration: 20000,
      isometric: true
    }
  };

  useEffect(() => {
    if (!avatarUrl || !mountRef.current) return;

    const mountElement = mountRef.current;
    console.log('🤖 [PEXLIB Avatar] Loading your Ready Player Me avatar:', avatarUrl);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup - Optimized for Ready Player Me avatars
    const camera = new THREE.PerspectiveCamera(
      50,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.65, 2.2);
    cameraRef.current = camera;

    // Renderer setup - Production quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    mountElement.appendChild(renderer.domElement);

    // Professional Studio Lighting for Ready Player Me
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Key light - Main illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -1;
    scene.add(keyLight);

    // Fill light - Soften shadows
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
    fillLight.position.set(-1.5, 1, 1);
    scene.add(fillLight);

    // Rim light - Edge definition
    const rimLight = new THREE.DirectionalLight(0xff6b35, 0.5);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    // Subtle ground reflection
    const groundGeometry = new THREE.PlaneGeometry(8, 8);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x2a2a3a,
      transparent: true,
      opacity: 0.15
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Exercise Animation Functions
    const startExerciseAnimation = (exerciseId, maxDuration = 15000) => {
      const animation = exerciseAnimations[exerciseId];
      if (!animation || !avatarRef.current) {
        console.log(`❌ [Avatar3D] No animation found for: ${exerciseId}`);
        return;
      }

      console.log(`🎭 [Avatar3D] Starting ${animation.name} demonstration`);

      // Store original position for reset
      const originalPosition = { ...avatarRef.current.position };
      const originalRotation = { ...avatarRef.current.rotation };

      let currentLoop = 0;
      let currentPhase = 0;
      let animationStartTime = Date.now();

      const executePhase = () => {
        // Check if we should stop
        if (exercisePhase !== 'demo' ||
            Date.now() - animationStartTime > maxDuration ||
            currentLoop >= animation.loops) {

          // Animation complete - reset avatar
          resetAvatarPosition(originalPosition, originalRotation);
          setCurrentExercise(null);
          setExercisePhase('idle');
          setDemoActive(false);

          // Dispatch completion event
          const event = new CustomEvent('avatarDemoComplete', {
            detail: {
              exerciseId,
              timestamp: Date.now(),
              loopsCompleted: currentLoop,
              phasesCompleted: currentPhase
            }
          });
          window.dispatchEvent(event);

          console.log(`✅ [Avatar3D] ${animation.name} demo completed`);
          return;
        }

        // Get current phase
        const phase = animation.phases[currentPhase];
        if (!phase) {
          // Move to next loop
          currentLoop++;
          currentPhase = 0;

          if (currentLoop < animation.loops) {
            // Rest between reps
            setTimeout(executePhase, animation.restBetweenReps || 500);
          } else {
            executePhase(); // This will trigger completion
          }
          return;
        }

        console.log(`🎯 [Avatar3D] ${animation.name} - Loop ${currentLoop + 1}/${animation.loops}, Phase ${currentPhase + 1}/${animation.phases.length}: ${phase.description}`);

        // Execute this phase
        animateToPosition(avatarRef.current, phase, phase.duration, () => {
          currentPhase++;

          // Brief pause between phases
          setTimeout(executePhase, 200);
        });
      };

      // Start the animation sequence
      executePhase();
    };

    // Smooth position/rotation animation
    const animateToPosition = (object, targetState, duration, onComplete) => {
      const startPosition = { ...object.position };
      const startRotation = { ...object.rotation };
      const startTime = Date.now();

      const animate = () => {
        // Check if animation should stop
        if (exercisePhase === 'paused' || exercisePhase === 'idle') {
          onComplete && onComplete();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function for natural movement
        const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedProgress = easeInOutQuad(progress);

        // Animate position
        if (targetState.position) {
          if (targetState.position.x !== undefined) {
            object.position.x = startPosition.x + (targetState.position.x - startPosition.x) * easedProgress;
          }
          if (targetState.position.y !== undefined) {
            object.position.y = startPosition.y + (targetState.position.y - startPosition.y) * easedProgress;
          }
          if (targetState.position.z !== undefined) {
            object.position.z = startPosition.z + (targetState.position.z - startPosition.z) * easedProgress;
          }
        }

        // Animate rotation
        if (targetState.rotation) {
          if (targetState.rotation.x !== undefined) {
            object.rotation.x = startRotation.x + (targetState.rotation.x - startRotation.x) * easedProgress;
          }
          if (targetState.rotation.y !== undefined) {
            object.rotation.y = startRotation.y + (targetState.rotation.y - startRotation.y) * easedProgress;
          }
          if (targetState.rotation.z !== undefined) {
            object.rotation.z = startRotation.z + (targetState.rotation.z - startRotation.z) * easedProgress;
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete && onComplete();
        }
      };

      animate();
    };

    // Reset avatar to idle position
    const resetAvatarPosition = (originalPosition, originalRotation) => {
      if (!avatarRef.current) return;

      console.log('🔄 [Avatar3D] Resetting to idle position');

      animateToPosition(avatarRef.current, {
        position: originalPosition,
        rotation: originalRotation
      }, 1500);
    };

    // Event Listeners for Exercise Demos
    const handleExerciseDemo = (event) => {
      const { exerciseId, duration } = event.detail;
      console.log(`🎬 [Avatar3D] Starting exercise demo: ${exerciseId}`);

      setCurrentExercise(exerciseId);
      setExercisePhase('demo');
      setDemoActive(true);

      // Start exercise-specific animation
      startExerciseAnimation(exerciseId, duration);
    };

    const handleExercisePause = (event) => {
      const { exerciseId } = event.detail;
      console.log(`⏸️ [Avatar3D] Pausing exercise demo: ${exerciseId}`);

      setExercisePhase('paused');
      setDemoActive(false);
    };

    // Set up event listeners
    if (mountElement) {
      mountElement.setAttribute('data-avatar-viewer', 'true');
      mountElement.addEventListener('avatarExerciseDemo', handleExerciseDemo);
      mountElement.addEventListener('avatarDemoPause', handleExercisePause);
    }

    // Load Ready Player Me Avatar
    const loader = new GLTFLoader();

    console.log('🎭 Loading your Ready Player Me avatar...');

    loader.load(
      avatarUrl,
      (gltf) => {
        console.log('✅ Ready Player Me avatar loaded!', gltf);

        const avatar = gltf.scene;

        // Configure avatar
        avatar.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        // Scale and position
        const box = new THREE.Box3().setFromObject(avatar);
        const center = box.getCenter(new THREE.Vector3());

        avatar.scale.setScalar(1.0);
        avatar.position.x = -center.x;
        avatar.position.y = -box.min.y;
        avatar.position.z = -center.z;

        scene.add(avatar);
        avatarRef.current = avatar;

        // Setup animations if available
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(avatar);
          mixerRef.current = mixer;

          const action = mixer.clipAction(gltf.animations[0]);
          action.play();

          console.log('🎬 Avatar animations loaded:', gltf.animations.length);
        }

        setAvatarInfo({
          type: 'Your PEXLIB Coach',
          source: 'Ready Player Me',
          polygons: 'High Quality',
          animations: gltf.animations?.length || 0
        });

        setLoading(false);
        setLoadProgress(100);
        if (onLoad) onLoad(avatar);
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        setLoadProgress(percentComplete);
      },
      (error) => {
        console.error('❌ Avatar loading failed:', error);
        setError('Failed to load avatar');
        setLoading(false);
        if (onError) onError(error);
      }
    );

    // Animation loop
    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      time += 0.003;

      // Update Ready Player Me animations
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Camera movement (always active)
      camera.position.x = Math.sin(time * 0.5) * 2.2;
      camera.position.z = Math.cos(time * 0.5) * 2.2;
      camera.lookAt(0, 1.4, 0);

      // Avatar movement - only if not in exercise demo mode
      if (avatarRef.current && exercisePhase === 'idle' && !demoActive) {
        avatarRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;

        // Gentle breathing effect
        const breathScale = 1 + Math.sin(time * 1.5) * 0.01;
        if (avatarRef.current.scale.x) {
          avatarRef.current.scale.y = avatarRef.current.scale.x * breathScale;
        }
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountElement || !camera || !renderer) return;

      const width = mountElement.clientWidth;
      const height = mountElement.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up Avatar3DViewer...');

      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }

      if (mountElement && renderer?.domElement && mountElement.contains(renderer.domElement)) {
        mountElement.removeChild(renderer.domElement);
      }

      if (mountElement) {
        mountElement.removeEventListener('avatarExerciseDemo', handleExerciseDemo);
        mountElement.removeEventListener('avatarDemoPause', handleExercisePause);
      }

      // Dispose resources
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose();
              });
            } else {
              if (object.material.map) object.material.map.dispose();
              object.material.dispose();
            }
          }
        });
      }

      if (renderer) {
        renderer.dispose();
      }
    };
  }, [avatarUrl, onLoad, onError, exercisePhase]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={mountRef}
        className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl">
          <div className="text-center text-white">
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
            <h4 className="text-xl font-bold mb-3">Loading Your PEXLIB Coach</h4>
            <div className="w-64 bg-gray-700 rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm opacity-75 mb-2">{loadProgress.toFixed(1)}% Complete</p>
            <p className="text-xs opacity-60">Loading Ready Player Me avatar...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center rounded-xl">
          <div className="text-center text-white p-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Avatar Loading Failed</h4>
            <p className="text-sm opacity-75 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Retry Loading
            </button>
          </div>
        </div>
      )}

      {/* Avatar Info Panel */}
      {!loading && !error && avatarInfo && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-4 py-3 rounded-lg text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${demoActive ? 'text-orange-400 animate-pulse' : 'text-green-400'}`}>●</span>
            <span className="font-bold text-orange-400">{avatarInfo.type}</span>
          </div>

          {demoActive && currentExercise && (
            <div className="mb-2 p-2 bg-orange-500/20 rounded border border-orange-500/30">
              <div className="font-bold text-orange-300">🎬 Live Demo:</div>
              <div className="text-xs text-orange-200">{exerciseAnimations[currentExercise]?.name || currentExercise}</div>
              <div className="text-xs text-gray-300 mt-1">Phase: {exercisePhase}</div>
            </div>
          )}

          <div className="text-gray-300 space-y-1">
            <div className="flex justify-between gap-4">
              <span>Source:</span>
              <span className="text-blue-400">{avatarInfo.source}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Quality:</span>
              <span className="text-green-400">{avatarInfo.polygons}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Status:</span>
              <span className={demoActive ? 'text-orange-400' : 'text-green-400'}>
                {demoActive ? 'Demonstrating' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {!loading && !error && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-lg transition-all duration-200 shadow-lg"
            title="Reset Camera View"
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(0, 1.65, 2.2);
                cameraRef.current.lookAt(0, 1.4, 0);
              }
            }}
          >
            🔄
          </button>

          <button
            className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-lg transition-all duration-200 shadow-lg"
            title="Avatar Information"
            onClick={() => {
              console.log('🤖 Your PEXLIB Avatar Info:', avatarInfo);
              alert(`Your PEXLIB Coach is ready!\n\nSource: ${avatarInfo?.source}\nQuality: ${avatarInfo?.polygons}\nAnimations: ${avatarInfo?.animations}`);
            }}
          >
            ℹ️
          </button>
        </div>
      )}

      {/* PEXLIB Branding */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 bg-gradient-to-r from-orange-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          <span className="flex items-center gap-1">
            <span>⚡</span>
            PEXLIB 3D Coach
          </span>
        </div>
      )}
    </div>
  );
};

export default Avatar3DViewer;