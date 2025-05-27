// client/src/components/AvatarTestComponent.jsx - For testing your avatar
import React, { useState } from 'react';
import Avatar3DViewer from './Avatar3DViewer';

const AvatarTestComponent = () => {
  const [currentAvatar, setCurrentAvatar] = useState('https://models.readyplayer.me/6835832653b18d01814a0692.glb');
  const [testResults, setTestResults] = useState([]);

  // Test different avatar configurations
  const testConfigs = [
    {
      name: 'Your Personal Avatar',
      url: 'https://models.readyplayer.me/6835832653b18d01814a0692.glb',
      description: 'Your personal Ready Player Me avatar'
    },
    {
      name: 'Backup Avatar 1',
      url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934c8.glb',
      description: 'Fallback fitness coach'
    },
    {
      name: 'Backup Avatar 2',
      url: 'https://models.readyplayer.me/643bfa43ddc78312c8490acd.glb',
      description: 'Alternative coach avatar'
    }
  ];

  const testAvatar = (config) => {
    console.log(`🧪 Testing avatar: ${config.name}`);
    setCurrentAvatar(config.url);

    const testResult = {
      name: config.name,
      url: config.url,
      timestamp: new Date().toISOString(),
      status: 'testing'
    };

    setTestResults(prev => [testResult, ...prev.slice(0, 4)]);
  };

  const handleAvatarLoad = (avatar, config) => {
    console.log(`✅ Avatar loaded: ${config?.name || 'Unknown'}`);
    setTestResults(prev =>
      prev.map(result =>
        result.url === currentAvatar
          ? { ...result, status: 'success', loadTime: new Date().toISOString() }
          : result
      )
    );
  };

  const handleAvatarError = (error, config) => {
    console.error(`❌ Avatar failed: ${config?.name || 'Unknown'}`, error);
    setTestResults(prev =>
      prev.map(result =>
        result.url === currentAvatar
          ? { ...result, status: 'error', error: error.message }
          : result
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🧪 PEXLIB Avatar Testing Lab
          </h1>
          <p className="text-gray-400">
            Test your Ready Player Me avatar integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Viewer */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">
              🎬 3D Avatar Test
            </h3>

            <div className="h-96 mb-4">
              <Avatar3DViewer
                avatarUrl={currentAvatar}
                className="w-full h-full"
                onLoad={(avatar) => handleAvatarLoad(avatar)}
                onError={(error) => handleAvatarError(error)}
              />
            </div>

            <div className="text-sm text-gray-400 bg-gray-700 rounded p-3">
              <strong>Current Avatar:</strong><br/>
              <code className="text-blue-400">{currentAvatar}</code>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">
              🎛️ Avatar Test Controls
            </h3>

            <div className="space-y-4 mb-6">
              {testConfigs.map((config, index) => (
                <button
                  key={index}
                  onClick={() => testAvatar(config)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    currentAvatar === config.url
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium mb-1">{config.name}</div>
                  <div className="text-sm opacity-75">{config.description}</div>
                </button>
              ))}
            </div>

            {/* Test Results */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">📊 Test Results</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-400 text-sm">No tests run yet</p>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{result.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.status === 'success' ? 'bg-green-600 text-white' :
                        result.status === 'error' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* API Tests */}
            <div className="mt-6 space-y-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/avatar/status');
                    const data = await response.json();
                    console.log('✅ Avatar API Status:', data);
                    alert('Avatar API is working! Check console for details.');
                  } catch (error) {
                    console.error('❌ Avatar API Error:', error);
                    alert('Avatar API test failed. Check console.');
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
              >
                🔌 Test Avatar API
              </button>

              <button
                onClick={() => {
                  const info = {
                    currentAvatar,
                    testResults: testResults.length,
                    lastTest: testResults[0]?.timestamp,
                    browser: navigator.userAgent.substring(0, 50)
                  };
                  console.log('🔍 Avatar Test Info:', info);
                  alert('Test info logged to console');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
              >
                🔍 Export Test Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarTestComponent;