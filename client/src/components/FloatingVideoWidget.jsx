import React, { useState, useEffect } from 'react';
import { Video, Sparkles, X, ChevronUp, Zap, Play, AlertCircle } from 'lucide-react';
import VideoGenerationDashboard from './VideoGenerationDashboard';

const FloatingVideoWidget = ({ exercises = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    withVideo: 0,
    pending: 0,
    processing: 0
  });

  // Update stats when exercises change
  useEffect(() => {
    const total = exercises.length;
    const withVideo = exercises.filter(ex =>
      ex.videoDemo && ex.videoDemo !== '/api/placeholder/video'
    ).length;
    const pending = exercises.filter(ex =>
      !ex.videoDemo || ex.videoDemo === '/api/placeholder/video'
    ).length;
    const processing = exercises.filter(ex =>
      ex.videoGenerationStatus === 'processing'
    ).length;

    setStats({ total, withVideo, pending, processing });
  }, [exercises]);

  const completionPercentage = stats.total > 0 ? Math.round((stats.withVideo / stats.total) * 100) : 0;

  const generateTopExercises = async () => {
    try {
      // Get top exercises without videos
      const needingVideos = exercises
        .filter(ex => !ex.videoDemo || ex.videoDemo === '/api/placeholder/video')
        .slice(0, 10)
        .map(ex => ex._id || ex.id);

      if (needingVideos.length === 0) {
        alert('All exercises already have videos!');
        return;
      }

      const response = await fetch('/api/video-generation/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseIds: needingVideos,
          style: '3d_avatar',
          priority: 'normal'
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Started video generation for ${data.jobs.length} exercises. Estimated time: ${data.estimatedTotalTime}`);
        setIsExpanded(false);
      } else {
        alert('Failed to start batch generation: ' + data.message);
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  // Don't show widget if no exercises
  if (exercises.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className={`bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-16'
        }`}>

          {/* Collapsed State - Just the FAB */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center relative group transition-all"
            >
              <Video size={24} className="text-white" />

              {/* Notification Badge */}
              {stats.pending > 0 && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {stats.pending > 99 ? '99+' : stats.pending}
                </div>
              )}

              {/* Processing Indicator */}
              {stats.processing > 0 && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              )}

              {/* Tooltip */}
              <div className="absolute right-full mr-3 bg-black text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Video Generation
              </div>
            </button>
          )}

          {/* Expanded State */}
          {isExpanded && (
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Video size={20} className="text-purple-500" />
                  <h3 className="text-white font-medium">Video Status</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronUp size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-white font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Play size={14} className="text-green-500" />
                    <span className="text-gray-400 text-xs">Complete</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.withVideo}</div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={14} className="text-orange-500" />
                    <span className="text-gray-400 text-xs">Pending</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.pending}</div>
                </div>

                {stats.processing > 0 && (
                  <div className="bg-gray-800 p-3 rounded col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-xs">Processing Now</span>
                    </div>
                    <div className="text-white font-bold text-lg">{stats.processing}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowDashboard(true);
                    setIsExpanded(false);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles size={14} />
                  Open Dashboard
                </button>

                {stats.pending > 0 && (
                  <button
                    onClick={generateTopExercises}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Zap size={14} />
                    Generate Top {Math.min(stats.pending, 10)}
                  </button>
                )}
              </div>

              {/* Quick Info */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles size={12} className="text-orange-500" />
                  <span>Est. cost: ${(stats.pending * 0.10).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Modal */}
      {showDashboard && (
        <VideoGenerationDashboard
          onClose={() => setShowDashboard(false)}
        />
      )}
    </>
  );
};

export default FloatingVideoWidget;