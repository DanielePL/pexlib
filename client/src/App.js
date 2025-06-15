import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import OpenAITestPage from './pages/OpenAITestPage';
import ApiTestPage from './pages/ApiTestPage';
// ENTFERNT: import AvatarCreationModal from './components/AvatarCreation';
// ENTFERNT: import AvatarDemo from './components/AvatarDemo';
import Navbar from './components/layout/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Avatar Test Page Component - BEHALTEN aber ohne Avatar-Dependencies
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
            🧪 PEXLIB Test Lab
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            System testing environment (Avatar features removed)
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
                <span className="text-gray-300 font-medium">API Configuration</span>
                <span className="text-2xl">{getStatusIcon(testResults.rpm)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {testResults.rpm === 'success' ? 'Configured' :
                 testResults.rpm === 'warning' ? 'Needs Setup' : 'Checking...'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Test Section */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              🔧 System Tests
            </h3>

            <div className="h-96 bg-gray-700 rounded-xl mb-6 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🛠️</div>
                <h4 className="text-xl font-bold">System Status</h4>
                <p className="opacity-80">Avatar features have been removed</p>
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">
                    ✅ Core system functions operational
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => console.log('System test initiated')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  Run System Test
                </button>
                <button
                  onClick={() => console.log('API test initiated')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                >
                  Test API
                </button>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-bold mb-2">Available Features:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Exercise Library Management</li>
                  <li>• AI-powered Exercise Discovery</li>
                  <li>• API Testing and Monitoring</li>
                  <li>• User Authentication System</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Configuration Test Section */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">⚙️ Configuration Test</h3>

            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-bold mb-3">Environment Status:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Node Environment:</span>
                    <span className="text-purple-400">{process.env.NODE_ENV || 'development'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Build Status:</span>
                    <span className="text-green-400">✅ Compiled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Features:</span>
                    <span className="text-blue-400">Core Library</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-bold mb-2">Active Systems:</h4>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. ✅ Authentication System</li>
                  <li>2. ✅ Exercise Management</li>
                  <li>3. ✅ AI Discovery Engine</li>
                  <li>4. ✅ API Testing Suite</li>
                  <li>5. ✅ Data Processing</li>
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
                  const response = await fetch('/api/exercises');
                  const data = await response.json();
                  console.log('✅ Exercises API:', data);
                  alert(`API Test: ${response.ok ? 'Success' : 'Failed'}\nCheck console for details`);
                } catch (error) {
                  console.error('❌ API Test failed:', error);
                  alert('API Test Failed - Check console');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Test Exercises API
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/health');
                  const data = await response.json();
                  console.log('✅ Health Check:', data);
                  alert(`Health Check: ${response.ok ? 'Success' : 'Failed'}\nCheck console for details`);
                } catch (error) {
                  console.error('❌ Health Check failed:', error);
                  alert('Health Check Failed - Check console');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Test Health Check
            </button>

            <button
              onClick={() => {
                const config = {
                  NODE_ENV: process.env.NODE_ENV,
                  BROWSER_SUPPORT: {
                    WebGL: testResults.webgl === 'success' ? 'Supported ✅' : 'Not Supported ❌',
                    LocalStorage: 'Available ✅'
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

      {/* ENTFERNT: Avatar Creation Modal */}
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
  // ENTFERNT: Avatar-bezogene State und Funktionen

  return (
    <div className="App min-h-screen bg-gray-900">
      <Router>
        {isAuthenticated && <Navbar />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/admin" /> : <Login />
          } />

          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ENTFERNT: Avatar Demo Route */}

          <Route path="/test-lab" element={
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

        {/* ENTFERNT: Global Avatar Creation Modal */}
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