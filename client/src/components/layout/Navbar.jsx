// client/src/components/layout/Navbar.jsx - Fixed single header
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ userAvatar }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              PROMETHEUS EXERCISE LIBRARY
            </h1>
            <p className="text-gray-400 text-sm">Professional Fitness Management System</p>
          </div>
        </div>

        {/* Navigation & User Menu */}
        <div className="flex items-center gap-4">

          {/* Avatar Coach Status */}
          {userAvatar && (
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">{userAvatar.name || 'My Coach'}</p>
                <p className="text-gray-400 text-xs capitalize">{userAvatar.personality || 'Motivational'}</p>
              </div>
            </div>
          )}

          {/* Avatar Demo Button */}
          <button
            onClick={() => navigate('/avatar-demo')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">🤖</span>
            Avatar Demo
          </button>

          {/* User Info */}
          {user && (
            <div className="text-right">
              <p className="text-white font-medium">{user.name || 'User'}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;