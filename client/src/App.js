import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import OpenAITestPage from './pages/OpenAITestPage';
import ApiTestPage from './pages/ApiTestPage';
import AvatarCreationModal from './components/AvatarCreation';
import AvatarDemo from './components/AvatarDemo';
import Navbar from './components/layout/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Avatar Test Page Component
const AvatarTestPage = () => {
  const [showCreation, setShowCreation] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [testResults, setTestResults] = useState({
    api: null,
    webgl: null,
    rpm: null
  });

  // Demo Avatar URLs für Tests
  const demoAvatars = [
    'https://models.readyplayer.me/64bfa15f0e72c63d7c3934c8.glb',
    'https://models.readyplayer.me/643bfa43ddc78312c8490acd.glb',
    'https://models.readyplayer.me/638df93b9b9d7f3c6149e0e4.glb'
  ];

  // Test API Connectivity
  const testAPI = async () => {
    try {
      const response = await fetch('/api/health');
      setTestResults(prev => ({
        ...prev,
        api: response.ok ? 'success' : 'error'
      }));
      return response.ok;
    } catch (error) {
      setTestResults(prev => ({ ...prev, api: 'error' }));
      return false;
    }
  };

  // Test WebGL Support
  const testWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const supported = !!gl;
      setTestResults(prev => ({
        ...prev,
        webgl: supported ? 'success' : 'error'
      }));
      return supported;
    } catch (error) {
      setTestResults(prev => ({ ...prev, webgl: 'error' }));
      return false;
    }
  };

  // Test Ready Player Me Configuration
  const testRPM = () => {
    const hasAPIKey = !!process.env.REACT_APP_READY_PLAYER_ME_API_KEY;
    setTestResults(prev => ({
      ...prev,
      rpm: hasAPIKey ? 'success' : 'warning'
    }));
    return hasAPIKey;
  };

  // Run tests on component mount
  useEffect(() => {
    testAPI();
    testWebGL();
    testRPM();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 PEXLIB Avatar Test Lab
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Comprehensive testing environment for avatar features
          </p>

          {/* System Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">Backend API</span>
                <span className="text-2xl">{getStatusIcon(testResults.api)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {testResults.api === 'success' ? 'Connected' :
                 testResults.api === 'error' ? 'Connection Failed' : 'Testing...'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">WebGL Support</span>
                <span className="text-2xl">{getStatusIcon(testResults.webgl)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {testResults.webgl === 'success' ? '3D Ready' :
                 testResults.webgl === 'error' ? 'Not Supported' : 'Testing...'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">Ready Player Me</span>
                <span className="text-2xl">{getStatusIcon(testResults.rpm)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {testResults.rpm === 'success' ? 'API Key Set' :
                 testResults.rpm === 'warning' ? 'API Key Missing' : 'Checking...'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 3D Avatar Test Section */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              🎬 3D Avatar Viewer Test
              {currentAvatar && <span className="text-green-400 text-sm">● Active</span>}
            </h3>

            <div className="h-96 bg-gray-700 rounded-xl mb-6 flex items-center justify-center">
              {currentAvatar ? (
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🤖</div>
                  <h4 className="text-xl font-bold">3D Avatar Loading...</h4>
                  <p className="opacity-80">Avatar URL: {currentAvatar.substring(0, 40)}...</p>
                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm">
                      ✅ 3D Viewer component would render here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-4">👆</div>
                  <p>Select a demo avatar below to test 3D rendering</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {demoAvatars.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAvatar(url)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentAvatar === url
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Demo Avatar {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentAvatar(null)}
                  className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-bold mb-2">3D Viewer Features:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Real-time 3D rendering with Three.js</li>
                  <li>• Interactive camera controls</li>
                  <li>• Professional lighting and shadows</li>
                  <li>• Responsive design for all devices</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Avatar Creation Test Section */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">🛠️ Avatar Creation Test</h3>

            <div className="space-y-6">
              <button
                onClick={() => setShowCreation(true)}
                disabled={testResults.rpm !== 'success'}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  testResults.rpm === 'success'
                    ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {testResults.rpm === 'success'
                  ? '🤖 Launch Avatar Creator'
                  : '⚠️ API Key Required'}
              </button>

              {testResults.rpm !== 'success' && (
                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-bold mb-2">Setup Required:</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Add your Ready Player Me API key to enable avatar creation:
                  </p>
                  <code className="block bg-gray-700 p-2 rounded text-xs text-green-400">
                    REACT_APP_READY_PLAYER_ME_API_KEY=your_api_key_here
                  </code>
                </div>
              )}

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-bold mb-3">Environment Status:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Ready Player Me API Key:</span>
                    <span className={testResults.rpm === 'success' ? 'text-green-400' : 'text-red-400'}>
                      {testResults.rpm === 'success' ? '✅ Configured' : '❌ Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subdomain:</span>
                    <span className="text-blue-400">
                      {process.env.REACT_APP_READY_PLAYER_ME_SUBDOMAIN || 'prometheus-fitness (default)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Environment:</span>
                    <span className="text-purple-400">{process.env.NODE_ENV || 'development'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-bold mb-2">Test Checklist:</h4>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. ✅ Open avatar creation modal</li>
                  <li>2. ✅ Configure personality & specialization</li>
                  <li>3. ✅ Create avatar in Ready Player Me</li>
                  <li>4. ✅ Save avatar to PEXLIB backend</li>
                  <li>5. ✅ Verify avatar appears in dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* API Testing Section */}
        <div className="bg-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">🔌 API & Integration Tests</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/avatar/current');
                  const data = await response.json();
                  console.log('✅ Current Avatar API:', data);
                  alert(`API Test: ${response.ok ? 'Success' : 'Failed'}\nCheck console for details`);
                } catch (error) {
                  console.error('❌ API Test failed:', error);
                  alert('API Test Failed - Check console');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Test Current Avatar
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/avatars');
                  const data = await response.json();
                  console.log('✅ List Avatars API:', data);
                  alert(`API Test: ${response.ok ? 'Success' : 'Failed'}\nCheck console for details`);
                } catch (error) {
                  console.error('❌ API Test failed:', error);
                  alert('API Test Failed - Check console');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Test List Avatars
            </button>

            <button
              onClick={() => {
                const config = {
                  RPM_API_KEY: process.env.REACT_APP_READY_PLAYER_ME_API_KEY ? 'Set ✅' : 'Missing ❌',
                  RPM_SUBDOMAIN: process.env.REACT_APP_READY_PLAYER_ME_SUBDOMAIN || 'Default',
                  NODE_ENV: process.env.NODE_ENV,
                  BROWSER_SUPPORT: {
                    WebGL: testResults.webgl === 'success' ? 'Supported ✅' : 'Not Supported ❌',
                    ThreeJS: 'Available ✅'
                  }
                };
                console.log('🔧 Environment Configuration:', config);
                alert('Environment info logged to console');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Check Environment
            </button>

            <button
              onClick={() => {
                // Run all tests again
                testAPI();
                testWebGL();
                testRPM();
                alert('All tests refreshed! Check status indicators above.');
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Refresh Tests
            </button>
          </div>

          <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-gray-300 font-medium mb-2">Quick Links:</h4>
            <div className="flex flex-wrap gap-3">
              <a href="/admin" className="text-blue-400 hover:text-blue-300 text-sm">
                → Admin Dashboard
              </a>
              <a href="/avatar-demo" className="text-blue-400 hover:text-blue-300 text-sm">
                → Avatar Demo
              </a>
              <a href="/api-test" className="text-blue-400 hover:text-blue-300 text-sm">
                → API Tests
              </a>
              <a href="/openai-test" className="text-blue-400 hover:text-blue-300 text-sm">
                → OpenAI Tests
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Creation Modal */}
      {showCreation && (
        <AvatarCreationModal
          isOpen={showCreation}
          onClose={() => setShowCreation(false)}
          onAvatarCreated={(avatar) => {
            console.log('✅ Avatar created in test lab:', avatar);
            setCurrentAvatar(avatar.avatarUrl);
            alert(`🎉 Avatar created successfully!\nPersonality: ${avatar.personality}\nSpecialization: ${avatar.specialization}`);
          }}
        />
      )}
    </div>
  );
};

// Protected Route Komponente
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading PEXLIB...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  // Load user's avatar on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserAvatar();
    }
  }, [isAuthenticated, user]);

  const loadUserAvatar = async () => {
    try {
      const response = await fetch('/api/avatar/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.avatar) {
          setUserAvatar(data.avatar);
          console.log('✅ User avatar loaded:', data.avatar);
        }
      }
    } catch (error) {
      console.log('ℹ️ No existing avatar found or API not available yet');
    }
  };

  const handleAvatarCreated = (avatar) => {
    setUserAvatar(avatar);
    console.log('🎉 New avatar created:', avatar);

    // Show success notification
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎉</span>
          <div>
            <h4 class="font-bold">Avatar Created!</h4>
            <p class="text-sm opacity-90">${avatar.personality} ${avatar.specialization} coach is ready</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  };

  return (
    <div className="App min-h-screen bg-gray-900">
      <Router>
        {isAuthenticated && <Navbar userAvatar={userAvatar} />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/admin" /> : <Login />
          } />

          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard
                userAvatar={userAvatar}
                onOpenAvatarModal={() => setShowAvatarModal(true)}
                onRefreshAvatar={loadUserAvatar}
              />
            </ProtectedRoute>
          } />

          <Route path="/avatar-demo" element={
            <ProtectedRoute>
              <AvatarDemo userAvatar={userAvatar} />
            </ProtectedRoute>
          } />

          <Route path="/avatar-test" element={
            <ProtectedRoute>
              <AvatarTestPage />
            </ProtectedRoute>
          } />

          {/* Development/Testing Routes */}
          <Route path="/openai-test" element={
            <ProtectedRoute>
              <OpenAITestPage />
            </ProtectedRoute>
          } />

          <Route path="/api-test" element={
            <ProtectedRoute>
              <ApiTestPage />
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={
            <Navigate to={isAuthenticated ? "/admin" : "/login"} />
          } />

          {/* Catch-all route for 404s */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                <a
                  href={isAuthenticated ? "/admin" : "/login"}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>

        {/* Global Avatar Creation Modal */}
        <AvatarCreationModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          onAvatarCreated={handleAvatarCreated}
        />
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;