import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import {
  Search, Filter, Play, Plus, X, CheckCircle, MessageSquare,
  Sparkles, Loader, ChevronLeft, ChevronRight, Target, Trophy,
  BarChart3, Calendar, Settings, Book, Video, Users, Zap,
  Activity, TrendingUp, Award, Clock, Flame, Heart, Star,
  Share2, Download, Bookmark, Grid, List, Eye, EyeOff,
  RefreshCw, AlertCircle, CheckSquare, Square, Maximize2,
  SortAsc, SortDesc, MoreVertical, AlertTriangle
} from 'lucide-react';


// Import der Mega-Services
import { SPORT_CONFIGS } from '../config/sportDashboardConfig';
import { MegaAIScout } from '../services/megaAIScout';
import { MEGA_EXERCISE_TAXONOMY } from '../services/megaExerciseTaxonomy';
import AIDiscoveryModal from './AIDiscoveryModal';
import PrometheusExerciseLibrary from './ExerciseLibrary';


// =====================================================
// SPORT CONFIGURATION
// =====================================================

const SPORT_CONFIGS = {
  powerlifting: {
    id: 'powerlifting',
    displayName: 'Powerlifting',
    description: 'Competition-focused strength training with squat, bench press, and deadlift',
    theme: {
      primary: '#DC2626',
      secondary: '#991B1B',
      accent: '#FEE2E2',
      gradient: 'from-red-600 to-red-800',
      icon: '🏋️‍♂️'
    }
  },
  bodybuilding: {
    id: 'bodybuilding',
    displayName: 'Bodybuilding',
    description: 'Muscle development and physique enhancement training',
    theme: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#F3E8FF',
      gradient: 'from-violet-600 to-violet-800',
      icon: '💪'
    }
  },
  crossfit: {
    id: 'crossfit',
    displayName: 'CrossFit',
    description: 'Functional fitness combining strength, endurance, and skill',
    theme: {
      primary: '#EA580C',
      secondary: '#C2410C',
      accent: '#FFF7ED',
      gradient: 'from-orange-600 to-orange-700',
      icon: '⚡'
    }
  },
  general: {
    id: 'general',
    displayName: 'General Fitness',
    description: 'Well-rounded fitness for health and performance',
    theme: {
      primary: '#6B7280',
      secondary: '#4B5563',
      accent: '#F9FAFB',
      gradient: 'from-gray-500 to-gray-600',
      icon: '🎯'
    }
  }
};

// YouTube Helper Functions
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeThumbnailUrl = (url, quality = 'mqdefault') => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '/api/placeholder/400/300';
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// =====================================================
// AI DISCOVERY MODAL COMPONENT
// =====================================================

const AIDiscoveryModal = memo(({ isOpen, onClose, sportId, onExercisesDiscovered }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState(null);
  const [discoveredExercises, setDiscoveredExercises] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const startMegaDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    setDiscoveryProgress({ phase: 'Starting MEGA Discovery...', progress: 0 });

    try {
      // Start MEGA Discovery session
      const response = await fetch('/api/mega-discovery/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'sport_specific',
          batchSize: 10,
          maxExercisesPerTerm: 3,
          testMode: false,
          sportFilter: sportId,
          includeVideoSearch: true
        })
      });

      if (!response.ok) throw new Error('Failed to start discovery');

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setCurrentSessionId(data.sessionId);
      setDiscoveryProgress({ phase: 'Discovery started...', progress: 10 });

      // Monitor progress
      monitorDiscoveryProgress(data.sessionId);

    } catch (error) {
      console.error('MEGA Discovery failed:', error);
      setDiscoveryProgress({ phase: 'Discovery failed', progress: 0, error: error.message });
      setIsDiscovering(false);
    }
  }, [sportId]);

  const monitorDiscoveryProgress = useCallback(async (sessionId) => {
    const checkInterval = 3000;
    let attempts = 0;
    const maxAttempts = 200; // 10 minutes max

    const checkProgress = async () => {
      try {
        attempts++;
        if (attempts > maxAttempts) {
          setDiscoveryProgress({ phase: 'Discovery timeout', progress: 0, error: 'Session timeout' });
          setIsDiscovering(false);
          return;
        }

        const response = await fetch(`/api/mega-discovery/status/${sessionId}`);
        if (!response.ok) throw new Error('Status check failed');

        const statusData = await response.json();
        if (!statusData.success) throw new Error(statusData.error);

        const session = statusData.session;
        const progress = session.progress;

        // Update progress display
        if (progress) {
          const progressPercent = Math.min(90, (progress.processedTerms / progress.totalSearchTerms) * 100);
          setDiscoveryProgress({
            phase: `Processing batch ${progress.currentBatch}/${progress.totalBatches}`,
            progress: progressPercent,
            exercisesFound: progress.exercisesFound
          });
        }

        if (session.status === 'completed') {
          setDiscoveryProgress({ phase: 'Loading discovered exercises...', progress: 95 });
          await loadDiscoveredExercises(sessionId);
          setDiscoveryProgress({ phase: 'Discovery completed!', progress: 100 });
          setIsDiscovering(false);
          return;
        }

        if (session.status === 'failed') {
          setDiscoveryProgress({ phase: 'Discovery failed', progress: 0, error: 'Session failed' });
          setIsDiscovering(false);
          return;
        }

        if (session.status === 'running') {
          setTimeout(checkProgress, checkInterval);
        }

      } catch (error) {
        console.error('Progress monitoring error:', error);
        setTimeout(checkProgress, checkInterval * 2); // Retry with longer interval
      }
    };

    setTimeout(checkProgress, checkInterval);
  }, []);

  const loadDiscoveredExercises = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`/api/mega-discovery/exercises?sessionId=${sessionId}&limit=100`);
      if (!response.ok) throw new Error('Failed to load exercises');

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      const exercises = data.exercises.map(ex => ({
        id: ex.exerciseId,
        name: ex.name,
        description: ex.description,
        muscleGroup: ex.primaryMuscleGroup,
        category: ex.category,
        difficulty: ex.difficulty,
        equipment: ex.equipment,
        videoUrl: ex.videoUrl,
        qualityScore: ex.qualityScore,
        status: ex.status,
        discoveryMethod: ex.discoveryMethod,
        originalSearchTerm: ex.originalSearchTerm,
        instructions: ex.instructions || [],
        benefits: ex.benefits || [],
        relevantSports: ex.relevantSports || [],
        source: 'MEGA Discovery'
      }));

      setDiscoveredExercises(exercises);
      console.log(`✅ Loaded ${exercises.length} discovered exercises`);

    } catch (error) {
      console.error('Failed to load discovered exercises:', error);
      setDiscoveryProgress(prev => ({ ...prev, error: 'Failed to load exercises' }));
    }
  }, []);

  const approveExercise = useCallback(async (exerciseId, approved = true) => {
    try {
      const response = await fetch(`/api/mega-discovery/exercises/${exerciseId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      if (!response.ok) throw new Error('Approval failed');

      // Update local state
      setDiscoveredExercises(prev =>
        prev.map(ex =>
          ex.id === exerciseId
            ? { ...ex, status: approved ? 'approved' : 'rejected' }
            : ex
        )
      );

      // If approved, add to main exercise list
      if (approved) {
        const exercise = discoveredExercises.find(ex => ex.id === exerciseId);
        if (exercise && onExercisesDiscovered) {
          onExercisesDiscovered([exercise]);
        }
      }

    } catch (error) {
      console.error('Exercise approval failed:', error);
    }
  }, [discoveredExercises, onExercisesDiscovered]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setDiscoveredExercises([]);
    setDiscoveryProgress(null);
    setCurrentSessionId(null);
    setIsDiscovering(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-orange-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">MEGA AI Discovery</h2>
              <p className="text-gray-300 text-sm">Discover new exercises from across the internet</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Discovery Controls */}
          {!isDiscovering && discoveredExercises.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-orange-600/20 to-purple-600/20 p-8 rounded-2xl border border-gray-700 max-w-md mx-auto">
                <Sparkles size={48} className="mx-auto mb-4 text-orange-500" />
                <h3 className="text-lg font-medium mb-2 text-white">Start MEGA Discovery</h3>
                <p className="text-sm mb-4 text-gray-400">
                  Discover new exercises for {SPORT_CONFIGS[sportId]?.displayName || sportId} using AI-powered search across the internet.
                </p>
                <button
                  onClick={startMegaDiscovery}
                  className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  🚀 Start Discovery
                </button>
              </div>
            </div>
          )}

          {/* Discovery Progress */}
          {isDiscovering && discoveryProgress && (
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="animate-spin text-orange-500" size={24} />
                  <h3 className="text-lg font-semibold text-white">MEGA Discovery in Progress</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">{discoveryProgress.phase}</span>
                      <span className="text-gray-400">{Math.round(discoveryProgress.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${discoveryProgress.progress}%` }}
                      />
                    </div>
                  </div>

                  {discoveryProgress.exercisesFound > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Exercises Found:</span>
                      <span className="text-green-400 font-medium">{discoveryProgress.exercisesFound}</span>
                    </div>
                  )}

                  {discoveryProgress.error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertTriangle size={16} />
                      {discoveryProgress.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Discovered Exercises */}
          {discoveredExercises.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Discovered Exercises ({discoveredExercises.length})
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles size={16} className="text-orange-500" />
                  AI-powered discovery
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {discoveredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`bg-gray-800 rounded-lg border p-4 transition-all ${
                      exercise.status === 'approved' ? 'border-green-500 bg-green-900/10' :
                      exercise.status === 'rejected' ? 'border-red-500 bg-red-900/10 opacity-50' :
                      'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          {exercise.name}
                          {exercise.status === 'approved' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                              <CheckCircle size={12} />
                              Approved
                            </span>
                          )}
                          {exercise.qualityScore && (
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                              Quality: {exercise.qualityScore}%
                            </span>
                          )}
                        </h4>

                        <p className="text-gray-300 text-sm mb-3">{exercise.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs">
                            {exercise.muscleGroup}
                          </span>
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                            {exercise.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                            {exercise.equipment}
                          </span>
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            {exercise.originalSearchTerm}
                          </span>
                        </div>

                        {exercise.instructions.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-semibold text-gray-400 mb-1">Instructions:</h5>
                            <ul className="text-gray-400 text-sm list-disc list-inside">
                              {exercise.instructions.slice(0, 2).map((instruction, i) => (
                                <li key={i}>{instruction}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        {exercise.status === 'discovered' && (
                          <>
                            <button
                              onClick={() => approveExercise(exercise.id, true)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => approveExercise(exercise.id, false)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Source Info */}
                    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
                      <span>Source: {exercise.discoveryMethod}</span>
                      {exercise.videoUrl && (
                        <span className="flex items-center gap-1">
                          <Video size={12} />
                          Video Available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isDiscovering && discoveredExercises.length === 0 && discoveryProgress?.phase === 'Discovery completed!' && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-medium text-white mb-2">No exercises discovered</h3>
              <p className="text-gray-400 mb-4">Try running another discovery session with different parameters.</p>
              <button
                onClick={() => {
                  setDiscoveryProgress(null);
                  setDiscoveredExercises([]);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start New Discovery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// =====================================================
// EXERCISE CARD COMPONENT
// =====================================================

const ExerciseCard = memo(({
  exercise,
  theme,
  sportId,
  onPlayVideo,
  onExerciseClick,
  onToggleFavorite,
  onApproveExercise,
  viewMode = 'grid',
  isSelected = false,
  onSelect
}) => {
  const relevanceScore = exercise.relevantSports?.find(s => s.sportId === sportId)?.relevanceScore || exercise.qualityScore/10 || 5;
  const relevanceColor = relevanceScore >= 8 ? 'text-green-400' :
                         relevanceScore >= 6 ? 'text-yellow-400' : 'text-gray-400';

  const handleVideoClick = useCallback((e) => {
    e.stopPropagation();
    onPlayVideo(exercise);
  }, [exercise, onPlayVideo]);

  const handleCardClick = useCallback(() => {
    onExerciseClick(exercise);
  }, [exercise, onExerciseClick]);

  const handleSelectClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(exercise.id);
  }, [exercise.id, onSelect]);

  if (viewMode === 'list') {
    return (
      <div
        className={`bg-gray-900 rounded-lg p-4 border transition-all hover:bg-gray-800 cursor-pointer ${
          isSelected ? 'border-orange-500 bg-orange-900/10' : 'border-gray-800'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectClick}
            className="text-gray-400 hover:text-orange-400 transition-colors"
          >
            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>

          <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={getYouTubeThumbnailUrl(exercise.videoUrl, 'default')}
              alt={exercise.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white truncate">{exercise.name}</h3>
                <p className="text-gray-400 text-sm truncate">{exercise.description}</p>
                {exercise.status && exercise.status !== 'approved' && (
                  <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                    exercise.status === 'pending_review' ? 'bg-yellow-600/20 text-yellow-400' :
                    exercise.status === 'discovered' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {exercise.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className={`px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-60 ${relevanceColor}`}>
                  {Math.round(relevanceScore)}/10
                </div>
                {exercise.qualityScore && (
                  <div className="px-2 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-400">
                    Q: {exercise.qualityScore}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                  {exercise.muscleGroup}
                </span>
                <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                  {exercise.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {exercise.videoUrl && (
                  <button
                    onClick={handleVideoClick}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Play size={14} />
                  </button>
                )}

                {exercise.status === 'discovered' && onApproveExercise && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveExercise(exercise.id, true);
                    }}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(exercise.id);
                  }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  <Heart size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all border group cursor-pointer relative ${
        isSelected ? 'border-orange-500 bg-orange-900/10' : 'border-gray-800'
      }`}
      onClick={handleCardClick}
    >
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={handleSelectClick}
          className="text-gray-400 hover:text-orange-400 transition-colors bg-black bg-opacity-50 p-1 rounded"
        >
          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>
      </div>

      <div className="relative h-48 bg-gray-800">
        <img
          src={getYouTubeThumbnailUrl(exercise.videoUrl)}
          alt={exercise.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {exercise.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40">
            <button
              onClick={handleVideoClick}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
            >
              <Play size={24} className="ml-1" />
            </button>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-60 ${relevanceColor}`}>
            {Math.round(relevanceScore)}/10
          </div>
        </div>

        {exercise.qualityScore >= 90 && (
          <div className="absolute top-3 right-16">
            <div className="px-2 py-1 rounded text-xs font-medium bg-green-600 text-white">
              High Quality
            </div>
          </div>
        )}

        {exercise.status && exercise.status !== 'approved' && (
          <div className="absolute bottom-3 left-3">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              exercise.status === 'pending_review' ? 'bg-yellow-600 text-white' :
              exercise.status === 'discovered' ? 'bg-blue-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {exercise.status.replace('_', ' ')}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{exercise.name}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700">
            {exercise.muscleGroup}
          </span>
          <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700">
            {exercise.difficulty}
          </span>
          {exercise.qualityScore && (
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs border border-blue-600/30">
              Q: {exercise.qualityScore}
            </span>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {exercise.description}
        </p>

        <div className="flex justify-between items-center">
          <button className="text-sm font-medium hover:underline" style={{ color: theme.primary }}>
            View Details
          </button>
          <div className="flex items-center space-x-2">
            {exercise.status === 'discovered' && onApproveExercise && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApproveExercise(exercise.id, true);
                }}
                className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white"
              >
                <CheckCircle size={16} />
              </button>
            )}
            {exercise.videoUrl && (
              <button
                onClick={handleVideoClick}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                <Play size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// =====================================================
// MAIN SPORT DASHBOARD COMPONENT
// =====================================================

const SportDashboard = () => {
  const [currentSportId, setCurrentSportId] = useState('powerlifting');
  const sportConfig = SPORT_CONFIGS[currentSportId] || SPORT_CONFIGS.general;
  const theme = sportConfig.theme;

  // State Management
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSection, setSelectedSection] = useState('all');
  const [showAIDiscoveryModal, setShowAIDiscoveryModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoResults, setVideoResults] = useState({});
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedExercises, setSelectedExercises] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all'); // all, discovered, approved, pending_review

  // Advanced Filters
  const [activeFilters, setActiveFilters] = useState({
    difficulty: 'all',
    equipment: 'all',
    category: 'all',
    qualityThreshold: 0
  });

  const exercisesPerPage = 12;

  // Load exercises from MEGA Discovery API
  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading exercises from MEGA Discovery API...');

      // Build query parameters
      const params = new URLSearchParams({
        limit: '100',
        sortBy: 'qualityScore',
        sortOrder: 'desc'
      });

      if (currentSportId !== 'general') {
        params.append('sportId', currentSportId);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/mega-discovery/exercises?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const loadedExercises = data.exercises.map(ex => ({
          id: ex.exerciseId,
          name: ex.name,
          description: ex.description,
          muscleGroup: ex.primaryMuscleGroup,
          category: ex.category,
          difficulty: ex.difficulty,
          equipment: ex.equipment,
          videoUrl: ex.videoUrl,
          qualityScore: ex.qualityScore,
          status: ex.status,
          discoveryMethod: ex.discoveryMethod,
          originalSearchTerm: ex.originalSearchTerm,
          instructions: ex.instructions || [],
          benefits: ex.benefits || [],
          relevantSports: ex.relevantSports || [],
          source: ex.discoveryMethod || 'MEGA Discovery'
        }));

        setExercises(loadedExercises);
        console.log(`✅ Loaded ${loadedExercises.length} exercises from MEGA Discovery`);

        if (loadedExercises.length === 0) {
          console.log('ℹ️ No exercises found - consider running MEGA Discovery');
        }
      } else {
        throw new Error(data.error || 'Failed to load exercises');
      }

    } catch (error) {
      console.error('Failed to load exercises:', error);

      // Show empty state with discovery prompt
      setExercises([]);
      console.log('💡 Consider running MEGA Discovery to find exercises');
    } finally {
      setIsLoading(false);
    }
  }, [currentSportId, statusFilter]);

  // Load exercises on component mount and when sport changes
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Apply filters and search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [exercises, searchQuery, activeFilters, sortBy, sortOrder]);

  const applyFilters = useCallback(() => {
    let filtered = [...exercises];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.description.toLowerCase().includes(query) ||
        exercise.muscleGroup.toLowerCase().includes(query) ||
        exercise.category.toLowerCase().includes(query) ||
        exercise.originalSearchTerm?.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    Object.entries(activeFilters).forEach(([filterType, value]) => {
      if (value !== 'all' && value !== '' && value !== 0) {
        switch (filterType) {
          case 'difficulty':
            filtered = filtered.filter(ex => ex.difficulty.toLowerCase() === value.toLowerCase());
            break;
          case 'equipment':
            filtered = filtered.filter(ex => ex.equipment.toLowerCase().includes(value.toLowerCase()));
            break;
          case 'category':
            filtered = filtered.filter(ex => ex.category.toLowerCase() === value.toLowerCase());
            break;
          case 'qualityThreshold':
            filtered = filtered.filter(ex => (ex.qualityScore || 0) >= value);
            break;
        }
      }
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'relevance':
          valueA = a.relevantSports?.find(s => s.sportId === currentSportId)?.relevanceScore || a.qualityScore/10 || 0;
          valueB = b.relevantSports?.find(s => s.sportId === currentSportId)?.relevanceScore || b.qualityScore/10 || 0;
          break;
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'quality':
          valueA = a.qualityScore || 0;
          valueB = b.qualityScore || 0;
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'elite': 4 };
          valueA = difficultyOrder[a.difficulty.toLowerCase()] || 0;
          valueB = difficultyOrder[b.difficulty.toLowerCase()] || 0;
          break;
        default:
          valueA = a.qualityScore || 0;
          valueB = b.qualityScore || 0;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredExercises(filtered);
    setCurrentPage(1);
  }, [exercises, searchQuery, activeFilters, sortBy, sortOrder, currentSportId]);

  // Get current page exercises
  const getCurrentPageExercises = useCallback(() => {
    const startIndex = (currentPage - 1) * exercisesPerPage;
    return filteredExercises.slice(startIndex, startIndex + exercisesPerPage);
  }, [filteredExercises, currentPage, exercisesPerPage]);

  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  // Exercise actions
  const handleExerciseClick = useCallback((exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  }, []);

  const handlePlayVideo = useCallback(async (exercise) => {
    setSelectedExercise(exercise);
    setShowVideoModal(true);
    setLoadingVideo(true);

    try {
      if (exercise.videoUrl) {
        setVideoResults({
          videoId: getYouTubeVideoId(exercise.videoUrl),
          url: exercise.videoUrl
        });
      } else {
        setVideoResults({ videoId: null });
      }
    } catch (error) {
      console.error('Error loading video:', error);
      setVideoResults({ videoId: null });
    } finally {
      setLoadingVideo(false);
    }
  }, []);

  const toggleFavorite = useCallback((exerciseId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(exerciseId)) {
        newFavorites.delete(exerciseId);
      } else {
        newFavorites.add(exerciseId);
      }
      return newFavorites;
    });
  }, []);

  const toggleSelection = useCallback((exerciseId) => {
    setSelectedExercises(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(exerciseId)) {
        newSelected.delete(exerciseId);
      } else {
        newSelected.add(exerciseId);
      }
      return newSelected;
    });
  }, []);

  const approveExercise = useCallback(async (exerciseId, approved = true) => {
    try {
      const response = await fetch(`/api/mega-discovery/exercises/${exerciseId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        // Update local state
        setExercises(prev =>
          prev.map(ex =>
            ex.id === exerciseId
              ? { ...ex, status: approved ? 'approved' : 'rejected' }
              : ex
          )
        );
      }
    } catch (error) {
      console.error('Exercise approval failed:', error);
    }
  }, []);

  const handleExercisesDiscovered = useCallback((newExercises) => {
    setExercises(prev => [...prev, ...newExercises]);
  }, []);

  const gradientClass = `bg-gradient-to-r ${theme.gradient}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${gradientClass} animate-pulse mb-4 mx-auto`}></div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Loading {sportConfig.displayName} Dashboard
          </h2>
          <p className="text-gray-400">Loading exercises from MEGA Discovery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className={`${gradientClass} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{theme.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {sportConfig.displayName}
                </h1>
                <p className="text-white/80">
                  {sportConfig.description} • {filteredExercises.length} exercises
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sport Selector */}
              <select
                value={currentSportId}
                onChange={(e) => setCurrentSportId(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
              >
                {Object.entries(SPORT_CONFIGS).map(([id, config]) => (
                  <option key={id} value={id} className="text-black">
                    {config.icon} {config.displayName}
                  </option>
                ))}
              </select>

              {/* MEGA Discovery */}
              <button
                onClick={() => setShowAIDiscoveryModal(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-sm transition-colors"
              >
                <Sparkles size={18} />
                <span>Discover</span>
              </button>

              {/* Refresh */}
              <button
                onClick={loadExercises}
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg backdrop-blur-sm transition-colors"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Target className="text-white/80" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">{filteredExercises.length}</p>
                  <p className="text-white/80 text-sm">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-white/80" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {filteredExercises.filter(ex => ex.status === 'approved').length}
                  </p>
                  <p className="text-white/80 text-sm">Approved</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Clock className="text-white/80" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {filteredExercises.filter(ex => ex.status === 'discovered' || ex.status === 'pending_review').length}
                  </p>
                  <p className="text-white/80 text-sm">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <BarChart3 className="text-white/80" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(filteredExercises.reduce((sum, ex) => sum + (ex.qualityScore || 0), 0) / filteredExercises.length) || 0}
                  </p>
                  <p className="text-white/80 text-sm">Avg Quality</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Heart className="text-white/80" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">{favorites.size}</p>
                  <p className="text-white/80 text-sm">Favorites</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Search */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.primary }}>
                <Search size={18} />
                Search Exercises
              </h3>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status Filter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.primary }}>
                <Filter size={18} />
                Status Filter
              </h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Exercises</option>
                <option value="approved">Approved Only</option>
                <option value="discovered">Newly Discovered</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>

            {/* MEGA Discovery */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.primary }}>
                <Sparkles size={18} />
                MEGA Discovery
              </h3>
              <button
                onClick={() => setShowAIDiscoveryModal(true)}
                className="w-full p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all transform bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white hover:scale-105"
              >
                <Sparkles size={18} className="text-yellow-300" />
                🚀 Discover New Exercises
              </button>
              <p className="text-gray-400 text-sm mt-2">
                AI-powered discovery from across the internet
              </p>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.primary }}>
                <Filter size={18} />
                Filters
              </h3>
              <div className="space-y-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                  <select
                    value={activeFilters.difficulty}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                {/* Quality Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Min Quality: {activeFilters.qualityThreshold}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={activeFilters.qualityThreshold}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, qualityThreshold: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveFilters({ difficulty: 'all', equipment: 'all', category: 'all', qualityThreshold: 0 })}
                className="w-full mt-4 p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {statusFilter === 'all' ? 'All Exercises' :
                   statusFilter === 'approved' ? 'Approved Exercises' :
                   statusFilter === 'discovered' ? 'Newly Discovered' :
                   'Pending Review'}
                </h2>
                <p className="text-gray-400">
                  {getCurrentPageExercises().length} of {filteredExercises.length} exercises
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="quality">Quality</option>
                  <option value="relevance">Relevance</option>
                  <option value="name">Name</option>
                  <option value="difficulty">Difficulty</option>
                </select>

                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </button>

                {/* View Mode */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise Grid/List */}
            {getCurrentPageExercises().length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{theme.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No exercises found
                </h3>
                <p className="text-gray-400 mb-6">
                  {exercises.length === 0
                    ? `Start by discovering exercises for ${sportConfig.displayName}`
                    : 'Try adjusting your search or filters'}
                </p>
                <button
                  onClick={() => setShowAIDiscoveryModal(true)}
                  className={`px-6 py-3 ${gradientClass} rounded-lg text-white font-medium hover:opacity-90 transition-opacity`}
                >
                  🚀 Start MEGA Discovery
                </button>
              </div>
            ) : (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                }`}>
                  {getCurrentPageExercises().map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      theme={theme}
                      sportId={currentSportId}
                      onPlayVideo={handlePlayVideo}
                      onExerciseClick={handleExerciseClick}
                      onToggleFavorite={toggleFavorite}
                      onApproveExercise={approveExercise}
                      viewMode={viewMode}
                      isSelected={selectedExercises.has(exercise.id)}
                      onSelect={toggleSelection}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-4 bg-gray-900 px-6 py-3 rounded-lg">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <span className="text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Discovery Modal */}
      <AIDiscoveryModal
        isOpen={showAIDiscoveryModal}
        onClose={() => setShowAIDiscoveryModal(false)}
        sportId={currentSportId}
        onExercisesDiscovered={handleExercisesDiscovered}
      />

      {/* Video Modal */}
      {showVideoModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{selectedExercise.name} - Video</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowVideoModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {loadingVideo ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="text-orange-500 animate-spin" size={32} />
                </div>
              ) : videoResults?.videoId ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoResults.videoId}`}
                    title={selectedExercise.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No video available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Details Modal */}
      {showExerciseDetails && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-auto border border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{theme.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedExercise.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedExercise.qualityScore && (
                      <span className="text-sm font-medium text-blue-400">
                        Quality: {selectedExercise.qualityScore}%
                      </span>
                    )}
                    {selectedExercise.status && (
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        selectedExercise.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                        selectedExercise.status === 'discovered' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {selectedExercise.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowExerciseDetails(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="relative h-64 bg-gray-800 rounded-lg overflow-hidden mb-4">
                    <img
                      src={getYouTubeThumbnailUrl(selectedExercise.videoUrl)}
                      alt={selectedExercise.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedExercise.videoUrl && (
                      <button
                        onClick={() => handlePlayVideo(selectedExercise)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-colors"
                      >
                        <div className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors">
                          <Play size={24} className="ml-1" />
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">EXERCISE DETAILS</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {selectedExercise.muscleGroup}
                        </span>
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {selectedExercise.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {selectedExercise.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {selectedExercise.equipment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.primary }}>
                    Description
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {selectedExercise.description}
                  </p>

                  {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                    <>
                      <h4 className="text-md font-semibold mb-3" style={{ color: theme.primary }}>
                        Instructions
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-300 mb-6">
                        {selectedExercise.instructions.map((step, i) => (
                          <li key={i} className="text-sm">{step}</li>
                        ))}
                      </ol>
                    </>
                  )}

                  {selectedExercise.benefits && selectedExercise.benefits.length > 0 && (
                    <>
                      <h4 className="text-md font-semibold mb-3" style={{ color: theme.primary }}>
                        Benefits
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 mb-6">
                        {selectedExercise.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm">{benefit}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-semibold mb-3" style={{ color: theme.primary }}>
                      Discovery Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedExercise.discoveryMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method:</span>
                          <span className="text-gray-300">{selectedExercise.discoveryMethod}</span>
                        </div>
                      )}
                      {selectedExercise.originalSearchTerm && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Search Term:</span>
                          <span className="text-gray-300">{selectedExercise.originalSearchTerm}</span>
                        </div>
                      )}
                      {selectedExercise.qualityScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quality Score:</span>
                          <span className="text-green-400">{selectedExercise.qualityScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportDashboard;