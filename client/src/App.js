import React from 'react';
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

// Protected Route Komponente
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center h-screen">Laden...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState(null);

  const handleAvatarCreated = (avatar) => {
    setUserAvatar(avatar);
    console.log('🎉 Avatar created:', avatar);
    // Optional: Show success message
    alert(`🎉 Avatar "${avatar.personality}" Coach created successfully!`);
  };

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/admin" /> : <Login />
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard
                userAvatar={userAvatar}
                onOpenAvatarModal={() => setShowAvatarModal(true)}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/avatar-demo" element={
            <ProtectedRoute>
              <AvatarDemo />
            </ProtectedRoute>
          } />
          
          <Route path="/avatar-test" element={
            /* Ihre bestehende Avatar-Test-Komponente */
          } />
          
          <Route path="/openai-test" element={<OpenAITestPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/admin" : "/login"} />} />
        </Routes>
        
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