// src/components/AvatarCreation.jsx - COMPLETE PEXLIB.COM VERSION
import React, { useState, useEffect, useRef } from 'react';

const AvatarCreationModal = ({ isOpen, onClose, onAvatarCreated }) => {
  const [currentStep, setCurrentStep] = useState('intro');
  const [avatarData, setAvatarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState('motivational');
  const [selectedSpecialization, setSelectedSpecialization] = useState('general_fitness');
  const [businessName, setBusinessName] = useState('');
  const iframeRef = useRef(null);

  // PEXLIB.COM Ready Player Me Configuration
  const getAvatarCreatorUrl = () => {
    const apiKey = process.env.REACT_APP_READY_PLAYER_ME_API_KEY;
    const subdomain = process.env.REACT_APP_READY_PLAYER_ME_SUBDOMAIN || 'prometheus-fitness';
    const isProduction = window.location.hostname.includes('pexlib.com');
    const isDevelopment = window.location.hostname.includes('localhost');

    if (!apiKey) {
      console.error('❌ [PEXLIB] Ready Player Me API Key not found');
      setError('Ready Player Me API Key not configured. Please check your environment settings.');
      return null;
    }

    console.log('🔧 [PEXLIB] Avatar Creator Configuration:', {
      domain: window.location.hostname,
      isProduction,
      isDevelopment,
      apiKeyPresent: !!apiKey
    });

    const params = new URLSearchParams({
      frameApi: 'true',
      clearCache: 'true',
      bodyType: 'halfbody',
      quickStart: 'false',
      language: 'en',
      // Add PEXLIB branding info
      ...(isProduction && {
        source: 'pexlib.com',
        brand: 'prometheus-exercise-library'
      })
    });

    // Use custom subdomain for production, demo for development
    const domain = isProduction ? subdomain : 'demo';
    const creatorUrl = `https://${domain}.readyplayer.me/avatar?${params.toString()}`;

    console.log('🚀 [PEXLIB] Avatar Creator URL:', creatorUrl);
    return creatorUrl;
  };

  // Enhanced message handling for PEXLIB.COM
  useEffect(() => {
    const handleMessage = (event) => {
      // Comprehensive origin checking for Ready Player Me
      const allowedOrigins = [
        'https://readyplayer.me',
        'https://demo.readyplayer.me',
        'https://prometheus-fitness.readyplayer.me'
      ];

      const isAllowedOrigin = allowedOrigins.some(origin =>
        event.origin === origin || event.origin.includes('readyplayer.me')
      );

      if (!isAllowedOrigin) {
        console.warn('🚫 [PEXLIB] Blocked message from unauthorized origin:', event.origin);
        return;
      }

      const { eventName, data } = event.data;
      console.log('🤖 [PEXLIB] Ready Player Me Event:', eventName, data);

      switch (eventName) {
        case 'v1.frame.ready':
          console.log('✅ [PEXLIB] Ready Player Me frame loaded successfully');
          break;

        case 'v1.avatar.exported':
          console.log('🎉 [PEXLIB] Avatar exported successfully!', data);
          setAvatarData({
            url: data.url,
            id: data.id || extractAvatarId(data.url),
            metadata: {
              createdAt: new Date().toISOString(),
              domain: window.location.hostname,
              version: '1.0',
              source: 'pexlib.com'
            }
          });
          setCurrentStep('preview');
          break;

        case 'v1.user.set':
          console.log('👤 [PEXLIB] User authenticated in Ready Player Me');
          break;

        case 'v1.user.logout':
          console.log('👋 [PEXLIB] User logged out of Ready Player Me');
          break;

        case 'v1.frame.navigate':
          console.log('🧭 [PEXLIB] Ready Player Me navigation:', data);
          break;

        default:
          console.log('ℹ️ [PEXLIB] Unknown RPM event:', eventName, data);
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
      console.log('👂 [PEXLIB] Message listener attached');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('🔇 [PEXLIB] Message listener removed');
    };
  }, [isOpen]);

  // Enhanced avatar ID extraction
  const extractAvatarId = (url) => {
    if (!url) return null;

    // Try multiple patterns for avatar ID extraction
    const patterns = [
      /\/([a-zA-Z0-9]+)\.glb/,  // Standard pattern
      /avatars\/([a-zA-Z0-9]+)/, // Alternative pattern
      /models\/([a-zA-Z0-9]+)/   // Another pattern
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        console.log('🔍 [PEXLIB] Extracted avatar ID:', match[1]);
        return match[1];
      }
    }

    // Fallback ID generation
    const fallbackId = `pexlib_avatar_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    console.log('🆔 [PEXLIB] Generated fallback ID:', fallbackId);
    return fallbackId;
  };

  // Enhanced avatar save with PEXLIB branding
  const handleSaveAvatar = async () => {
    if (!avatarData) {
      setError('No avatar data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💾 [PEXLIB] Saving avatar to backend...', avatarData);

      const isProduction = window.location.hostname.includes('pexlib.com');
      const apiUrl = isProduction ? 'https://api.pexlib.com' : '/api';

      const avatarPayload = {
        avatarUrl: avatarData.url,
        avatarId: avatarData.id,
        userType: 'professional',
        customizations: {
          coachPersonality: selectedPersonality,
          specialization: selectedSpecialization,
          brandName: businessName || 'PEXLIB - Prometheus Exercise Library'
        },
        metadata: {
          domain: window.location.hostname,
          createdVia: 'pexlib_avatar_creator',
          version: '1.0',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.substring(0, 100)
        }
      };

      console.log('📤 [PEXLIB] Sending avatar payload:', avatarPayload);

      const response = await fetch(`${apiUrl}/avatar/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Domain': 'pexlib.com',
          'X-Source': 'avatar-creation-modal'
        },
        body: JSON.stringify(avatarPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ [PEXLIB] Avatar saved successfully!', result);

        // Enhanced avatar data for callback
        const enhancedAvatar = {
          ...result.avatar,
          domain: 'pexlib.com',
          createdAt: new Date().toISOString(),
          source: 'pexlib-avatar-creator'
        };

        onAvatarCreated(enhancedAvatar);

        // Success tracking
        console.log('📊 [PEXLIB] Avatar creation completed successfully');

        onClose();
      } else {
        throw new Error(result.error || 'Failed to save avatar');
      }
    } catch (error) {
      console.error('❌ [PEXLIB] Avatar save error:', error);
      setError(`Save failed: ${error.message}`);

      // Error tracking
      console.error('📊 [PEXLIB] Avatar creation failed:', {
        error: error.message,
        avatarId: avatarData?.id,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced modal reset
  const handleClose = () => {
    console.log('🚪 [PEXLIB] Closing avatar creation modal');
    setCurrentStep('intro');
    setAvatarData(null);
    setError(null);
    setSelectedPersonality('motivational');
    setSelectedSpecialization('general_fitness');
    setBusinessName('');
    onClose();
  };

  // Configuration test function
  const testConfiguration = () => {
    const apiKey = process.env.REACT_APP_READY_PLAYER_ME_API_KEY;
    const config = {
      apiKeyPresent: !!apiKey,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not found',
      subdomain: process.env.REACT_APP_READY_PLAYER_ME_SUBDOMAIN,
      domain: window.location.hostname,
      isProduction: window.location.hostname.includes('pexlib.com'),
      environment: process.env.NODE_ENV
    };

    console.log('🔍 [PEXLIB] Configuration Test:', config);
    alert(`PEXLIB Configuration:\n${JSON.stringify(config, null, 2)}`);
  };

  // Coach personality options
  const personalityOptions = [
    {
      id: 'motivational',
      name: 'Motivational & Encouraging',
      icon: '🔥',
      description: 'Uplifting and inspiring coaching style',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'technical',
      name: 'Technical & Precise',
      icon: '🎯',
      description: 'Detailed form and technique focus',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'energetic',
      name: 'Energetic & Fun',
      icon: '⚡',
      description: 'High-energy and enthusiastic approach',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'supportive',
      name: 'Calm & Supportive',
      icon: '🤗',
      description: 'Gentle and encouraging guidance',
      color: 'from-green-400 to-teal-500'
    }
  ];

  // Specialization options
  const specializationOptions = [
    {
      id: 'general_fitness',
      name: 'General Fitness',
      icon: '🎯',
      description: 'All-around fitness and wellness'
    },
    {
      id: 'strength_training',
      name: 'Strength Training',
      icon: '💪',
      description: 'Muscle building and power development'
    },
    {
      id: 'cardio',
      name: 'Cardio & Endurance',
      icon: '🏃',
      description: 'Cardiovascular fitness and stamina'
    },
    {
      id: 'flexibility',
      name: 'Flexibility & Mobility',
      icon: '🧘',
      description: 'Movement quality and flexibility'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-700 shadow-2xl">

        {/* Enhanced Header with PEXLIB Branding */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-orange-600/20 via-purple-600/20 to-blue-600/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">PE</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  🤖 PEXLIB Avatar Coach Creator
                  <span className="text-xs bg-orange-600 px-2 py-1 rounded-full">WORLD'S FIRST</span>
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Powered by Ready Player Me • Professional Exercise Library System
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Close Avatar Creator"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">

          {/* Configuration Error Display */}
          {!process.env.REACT_APP_READY_PLAYER_ME_API_KEY && (
            <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-red-400 font-bold text-lg">Configuration Error</h3>
                  <p className="text-red-300 text-sm">Ready Player Me integration not configured</p>
                </div>
              </div>
              <p className="text-red-300 text-sm mb-4">
                Please add your Ready Player Me API key to the environment configuration:
                <code className="block mt-2 p-2 bg-red-900/50 rounded text-xs">
                  REACT_APP_READY_PLAYER_ME_API_KEY=your_api_key_here
                </code>
              </p>
              <button
                onClick={testConfiguration}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔧 Test Configuration
              </button>
            </div>
          )}

          {/* Step: Introduction */}
          {currentStep === 'intro' && process.env.REACT_APP_READY_PLAYER_ME_API_KEY && (
            <div className="text-center max-w-3xl mx-auto">
              {/* Hero Section */}
              <div className="mb-12">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-500 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-5xl text-white">🤖</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  Welcome to PEXLIB Avatar Coach
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Create your personalized AI fitness coach avatar that will demonstrate
                  exercises with perfect form, provide expert coaching tips, and represent
                  your professional brand in the fitness industry.
                </p>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl">🎬</span>
                    </div>
                    <h4 className="text-white font-bold mb-2">3D Demonstrations</h4>
                    <p className="text-gray-400 text-sm">Your avatar shows perfect exercise form</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl">🧠</span>
                    </div>
                    <h4 className="text-white font-bold mb-2">AI Coaching</h4>
                    <p className="text-gray-400 text-sm">Personalized tips and motivation</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl">💼</span>
                    </div>
                    <h4 className="text-white font-bold mb-2">Pro Branding</h4>
                    <p className="text-gray-400 text-sm">Custom business integration</p>
                  </div>
                </div>
              </div>

              {/* Coach Style Selection */}
              <div className="mb-12">
                <h4 className="text-xl font-bold text-white mb-6">Choose Your Coach Personality</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalityOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedPersonality(option.id)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedPersonality === option.id
                          ? 'border-orange-500 bg-orange-600/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center`}>
                          <span className="text-white text-xl">{option.icon}</span>
                        </div>
                        <div>
                          <h5 className="text-white font-bold">{option.name}</h5>
                          <p className="text-gray-400 text-sm">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setCurrentStep('create')}
                className="bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 hover:from-orange-700 hover:via-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                🚀 Create My Avatar Coach
              </button>
            </div>
          )}

          {/* Step: Avatar Creation */}
          {currentStep === 'create' && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Design Your Professional Avatar</h3>
                <p className="text-gray-400 text-lg">
                  Use Ready Player Me to create your personalized fitness coach avatar
                </p>
              </div>

              {getAvatarCreatorUrl() ? (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                  <div className="bg-gray-700/50 px-6 py-3 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">RPM</span>
                      </div>
                      <span className="text-white font-medium">Ready Player Me Avatar Creator</span>
                      <div className="flex-1"></div>
                      <span className="text-green-400 text-sm">🟢 Connected</span>
                    </div>
                  </div>
                  <iframe
                    ref={iframeRef}
                    src={getAvatarCreatorUrl()}
                    allow="camera *; microphone *; clipboard-write"
                    className="w-full h-[600px] border-none"
                    title="PEXLIB Ready Player Me Avatar Creator"
                  />
                </div>
              ) : (
                <div className="bg-gray-800 rounded-2xl border border-red-500/50 p-12 text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl">❌</span>
                  </div>
                  <h4 className="text-red-400 font-bold text-xl mb-4">Cannot Load Avatar Creator</h4>
                  <p className="text-gray-400 mb-6">
                    There's an issue with the Ready Player Me configuration.
                    Please check your API key settings.
                  </p>
                  <button
                    onClick={testConfiguration}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    🔧 Test Configuration
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() => setCurrentStep('intro')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                >
                  ← Back to Setup
                </button>
                <div className="text-gray-400 text-sm max-w-md text-center">
                  💡 <strong>Tip:</strong> Create a professional-looking avatar that represents
                  your coaching style and brand identity
                </div>
              </div>
            </div>
          )}

          {/* Step: Preview & Configuration */}
          {currentStep === 'preview' && avatarData && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🎉 Your Avatar Coach is Ready!
                </h3>
                <p className="text-gray-400 text-lg">
                  Configure your professional settings and save your AI fitness coach
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Avatar Preview Section */}
                <div>
                  <h4 className="text-white font-bold text-lg mb-6">Avatar Preview</h4>
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 h-96 flex items-center justify-center shadow-xl">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-white text-4xl">🎉</span>
                      </div>
                      <h5 className="text-white font-bold text-xl mb-3">Avatar Created Successfully!</h5>
                      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                        <p className="text-gray-300 text-sm mb-1">Avatar ID:</p>
                        <p className="text-orange-400 font-mono text-sm">{avatarData.id}</p>
                      </div>
                      <p className="text-gray-500 text-sm">
                        3D preview and animations coming in Week 2 update
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Configuration */}
                <div>
                  <h4 className="text-white font-bold text-lg mb-6">Professional Configuration</h4>
                  <div className="space-y-6">

                    {/* Personality Selection */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-3">
                        Coach Personality Style
                      </label>
                      <div className="space-y-2">
                        {personalityOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedPersonality(option.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                              selectedPersonality === option.id
                                ? 'border-orange-500 bg-orange-600/10'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{option.icon}</span>
                              <div>
                                <p className="text-white font-medium">{option.name}</p>
                                <p className="text-gray-400 text-sm">{option.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Specialization Selection */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-3">
                        Training Specialization
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {specializationOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedSpecialization(option.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              selectedSpecialization === option.id
                                ? 'border-blue-500 bg-blue-600/10'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{option.icon}</span>
                              <div>
                                <p className="text-white font-medium">{option.name}</p>
                                <p className="text-gray-400 text-sm">{option.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Business Branding */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-3">
                        Business/Brand Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your gym, studio, or personal brand name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    {/* Premium Features Preview */}
                    <div className="bg-gradient-to-r from-orange-600/10 via-purple-600/10 to-blue-600/10 border border-orange-500/30 rounded-xl p-6">
                      <h5 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        PEXLIB Professional Features
                      </h5>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">✅</span>
                          <span className="text-gray-300 text-sm">Unlimited exercise demonstrations</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">✅</span>
                          <span className="text-gray-300 text-sm">AI-powered coaching tips & motivation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">✅</span>
                          <span className="text-gray-300 text-sm">Professional branding customization</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">✅</span>
                          <span className="text-gray-300 text-sm">Client sharing and collaboration</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400">🔮</span>
                          <span className="text-gray-300 text-sm">Voice coaching (Coming Soon)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-6 mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">❌</span>
                    </div>
                    <div>
                      <h5 className="text-red-400 font-bold">Save Error</h5>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-12">
                <button
                  onClick={() => setCurrentStep('create')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                >
                  ← Recreate Avatar
                </button>

                <button
                  onClick={handleSaveAvatar}
                  disabled={loading}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl ${
                    loading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 hover:from-orange-700 hover:via-purple-700 hover:to-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Saving to PEXLIB...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎉</span>
                      Save My Avatar Coach
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarCreationModal;