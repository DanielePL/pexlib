// client/src/components/AISearchModal.jsx
import React, { useState } from 'react';
import {
  Search, X, Sparkles, Globe, Loader, Plus, Check, Clock, Trash2,
  Dumbbell, Target, Zap, Users, Play, BookOpen
} from 'lucide-react';

// Enhanced AI Search Modal with MEGA Discovery Integration
const AISearchModal = ({ isOpen, onClose, onAddExercise }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('exercise');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: '',
    equipment: '',
    muscle: '',
    sport: ''
  });
  const [pendingExercises, setPendingExercises] = useState(new Set());
  const [approvedExercises, setApprovedExercises] = useState(new Set());
  const [rejectedExercises, setRejectedExercises] = useState(new Set());
  // MEGA Discovery State
  const [megaDiscoveryStatus, setMegaDiscoveryStatus] = useState({
    isRunning: false,
    sessionId: null,
    progress: null
  });

  // Search categories
  const searchTypes = [
    { id: 'exercise', label: 'Exercises', icon: Dumbbell, color: 'orange' },
    { id: 'workout', label: 'Workouts', icon: Target, color: 'blue' },
    { id: 'equipment', label: 'Equipment', icon: Zap, color: 'green' },
    { id: 'muscle', label: 'Muscle Groups', icon: Users, color: 'purple' },
    { id: 'sport', label: 'Sports', icon: Play, color: 'red' }
  ];

  // Filter options
  const filterOptions = {
    difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Elite'],
    equipment: ['Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 'Machine', 'Cable', 'Resistance Bands', 'None'],
    muscle: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'],
    sport: ['Powerlifting', 'Bodybuilding', 'CrossFit', 'Calisthenics', 'Yoga', 'Pilates', 'Running', 'Swimming']
  };

  // YouTube Video Helper Functions
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeThumbnail = (url, quality = 'mqdefault') => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : '/api/placeholder/400/300';
  };

  // MEGA Discovery Handler - REAL AI INTEGRATION
  const handleMegaDiscovery = async () => {
    setIsLoading(true);
    setMegaDiscoveryStatus({ isRunning: true, sessionId: null, progress: null });

    try {
      console.log('🚀 Starting REAL MEGA Discovery...');

      const response = await fetch('/api/mega-discovery/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType: 'test_run',
          batchSize: 5,
          maxExercisesPerTerm: 3,
          testMode: true,
          targetSports: null // null = all sports
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎉 MEGA Discovery started:', data);

      if (data.success) {
        setMegaDiscoveryStatus({
          isRunning: true,
          sessionId: data.sessionId,
          progress: { exercisesFound: 0, currentBatch: 0, totalBatches: 0 }
        });

        // Start monitoring session progress
        monitorDiscoveryProgress(data.sessionId);

        // Update search query to show MEGA Discovery mode
        setSearchQuery(`MEGA Discovery - Session ${data.sessionId}`);

        alert(`🚀 MEGA Discovery gestartet!\n\nSession: ${data.sessionId}\nModus: ${data.config.testMode ? 'TEST (10 Begriffe)' : 'FULL (200+ Sportarten)'}\nGeschätzte Dauer: ${data.estimatedDuration}`);
      }

    } catch (error) {
      console.error('MEGA Discovery failed:', error);
      alert(`❌ Fehler beim Starten der MEGA Discovery: ${error.message}`);
      setMegaDiscoveryStatus({ isRunning: false, sessionId: null, progress: null });
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor Discovery Progress
  const monitorDiscoveryProgress = async (sessionId) => {
    const checkInterval = 3000; // Check every 3 seconds
    const maxChecks = 200; // Max 10 minutes
    let checkCount = 0;

    const checkProgress = async () => {
      try {
        checkCount++;

        if (checkCount > maxChecks) {
          console.warn('Progress monitoring timeout');
          setMegaDiscoveryStatus(prev => ({ ...prev, isRunning: false }));
          return;
        }

        const response = await fetch(`/api/mega-discovery/status/${sessionId}`);
        const statusData = await response.json();

        if (statusData.success) {
          const session = statusData.session;

          // Update progress
          setMegaDiscoveryStatus(prev => ({
            ...prev,
            progress: session.progress
          }));

          console.log(`📊 Progress: Batch ${session.progress.currentBatch}/${session.progress.totalBatches}, Exercises: ${session.progress.exercisesFound}`);

          // Check if completed
          if (session.status === 'completed') {
            console.log('✅ MEGA Discovery completed!');
            setMegaDiscoveryStatus({ isRunning: false, sessionId, progress: session.progress });

            // Load and display discovered exercises
            await loadDiscoveredExercises(sessionId);

            alert(`🎉 MEGA Discovery abgeschlossen!\n\n✅ ${session.results.totalExercises} Übungen gefunden\n⏱️ Dauer: ${session.results.duration}s\n🎥 Videos: ${session.progress.videosFound}`);
            return;
          }

          // Check if failed
          if (session.status === 'failed') {
            console.error('❌ MEGA Discovery failed on server');
            setMegaDiscoveryStatus({ isRunning: false, sessionId, progress: session.progress });
            alert('❌ MEGA Discovery ist fehlgeschlagen. Siehe Server-Logs für Details.');
            return;
          }

          // Continue monitoring if still running
          if (session.status === 'running') {
            setTimeout(checkProgress, checkInterval);
          }
        }

      } catch (error) {
        console.error('Progress monitoring error:', error);
        setTimeout(checkProgress, checkInterval); // Continue monitoring despite errors
      }
    };

    // Start monitoring
    setTimeout(checkProgress, checkInterval);
  };

  // Load Discovered Exercises
  const loadDiscoveredExercises = async (sessionId = null) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', '50');

      const response = await fetch(`/api/mega-discovery/exercises?${params}`);
      const data = await response.json();

      if (data.success) {
        console.log(`📋 Loaded ${data.exercises.length} discovered exercises`);

        // Process exercises for display
        const processedExercises = data.exercises.map(exercise => ({
          ...exercise,
          searchId: exercise._id, // Use MongoDB _id as searchId
          videoUrl: exercise.videoUrl || null,
          muscleGroup: exercise.primaryMuscleGroup,
          instructions: exercise.instructions || [],
          tips: exercise.benefits || [],
          variations: [],
          safetyNotes: exercise.coachingTips?.join('. ') || '',
          source: `MEGA AI Discovery - ${exercise.originalSearchTerm}`
        }));

        setSearchResults(processedExercises);
        setSearchQuery(`MEGA Discovery - ${processedExercises.length} exercises found`);

        // Reset approval states
        setPendingExercises(new Set());
        setApprovedExercises(new Set());
        setRejectedExercises(new Set());
      }

    } catch (error) {
      console.error('Failed to load discovered exercises:', error);
    }
  };

  // Regular AI Search (OpenAI API call)
  const performAISearch = async () => {
    if (!searchQuery.trim()) {
      console.error('Search query is empty');
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      const searchPrompt = buildSearchPrompt();
      console.log('Starting AI search with prompt:', searchPrompt);

      const apiResponse = await callOpenAIAPI(searchPrompt);

      if (!apiResponse || !apiResponse.exercises || !Array.isArray(apiResponse.exercises)) {
        console.error('Invalid API response format:', apiResponse);
        throw new Error('Invalid API response format');
      }

      const processedResults = apiResponse.exercises.map((exercise, index) => ({
        ...exercise,
        searchId: `search_${Date.now()}_${index}`,
        muscleGroup: exercise.primaryMuscleGroup || exercise.muscleGroup,
        videoUrl: null // Will be searched separately if needed
      }));

      console.log(`Found ${processedResults.length} exercises from AI search`);
      setSearchResults(processedResults);

      setPendingExercises(new Set());
      setApprovedExercises(new Set());
      setRejectedExercises(new Set());
      setVideoSearchStatus(new Map());

    } catch (error) {
      console.error('AI Search failed:', error);

      // Fallback to mock data
      const fallbackResults = getFallbackSearchResults(searchQuery);
      setSearchResults(fallbackResults);
      console.warn('Using fallback results - configure REACT_APP_OPENAI_API_KEY for real AI search');
    } finally {
      setIsLoading(false);
    }
  };

  // OpenAI API Call
  const callOpenAIAPI = async (prompt) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Set REACT_APP_OPENAI_API_KEY in your .env file.');
    }

    const systemPrompt = `You are a world-class fitness expert and exercise database. Your job is to discover and recommend exercises, workouts, and fitness content.

When asked about exercises or workouts, provide detailed, accurate information including:
- Exercise name and variations
- Detailed step-by-step instructions
- Target muscle groups
- Required equipment
- Difficulty level
- Safety considerations
- Common mistakes to avoid
- Progression and regression options

Return your response as a JSON object with this structure:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "description": "Brief description of the exercise",
      "primaryMuscleGroup": "Primary muscle group",
      "category": "Exercise category",
      "difficulty": "Beginner/Intermediate/Advanced",
      "equipment": "Required equipment",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "benefits": ["Benefit 1", "Benefit 2"],
      "coachingTips": ["Tip 1", "Tip 2"],
      "setRepGuidelines": "Recommended sets/reps"
    }
  ]
}

Provide 3-5 high-quality exercises that match the request.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid API response structure');
    }

    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse API response as JSON:', error);
      throw new Error('Invalid response format from OpenAI');
    }
  };

  // Build search prompt for API
  const buildSearchPrompt = () => {
    let prompt = `Find ${searchType}s for: "${searchQuery}"`;

    if (selectedFilters.difficulty) prompt += ` | Difficulty: ${selectedFilters.difficulty}`;
    if (selectedFilters.equipment) prompt += ` | Equipment: ${selectedFilters.equipment}`;
    if (selectedFilters.muscle) prompt += ` | Target: ${selectedFilters.muscle}`;
    if (selectedFilters.sport) prompt += ` | Sport: ${selectedFilters.sport}`;

    return prompt;
  };

  // Fallback search results for demo
  const getFallbackSearchResults = (query) => {
    const baseExercises = [
      {
        name: `${query} Exercise 1`,
        description: `A comprehensive ${query.toLowerCase()} exercise targeting multiple muscle groups with progressive difficulty levels.`,
        primaryMuscleGroup: selectedFilters.muscle || 'Full Body',
        category: 'Compound',
        difficulty: selectedFilters.difficulty || 'Intermediate',
        equipment: selectedFilters.equipment || 'Dumbbells',
        instructions: [
          'Start in the proper starting position',
          'Maintain good form throughout the movement',
          'Control the eccentric (lowering) portion',
          'Return to starting position with control'
        ],
        benefits: [
          'Focus on proper breathing technique',
          'Start with lighter weight to master form',
          'Progress gradually as strength improves'
        ],
        coachingTips: [
          'Beginner modification',
          'Advanced progression',
          'Unilateral version'
        ],
        setRepGuidelines: '3 sets of 8-12 reps',
        source: 'Exercise Database (Fallback Mode - Set OPENAI_API_KEY for real search)'
      }
    ];

    return baseExercises.map((exercise, index) => ({
      ...exercise,
      searchId: `fallback_${Date.now()}_${index}`
    }));
  };

  // Exercise management functions - FIXED APPROVE LOGIC
  const handleAddToPending = (exercise) => {
    const exerciseId = exercise._id || exercise.searchId;
    setPendingExercises(prev => new Set([...prev, exerciseId]));
    setRejectedExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });
  };

  const handleApproveExercise = (exercise) => {
    const exerciseId = exercise._id || exercise.searchId;

    // Add to library with unique data
    const newExercise = {
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.primaryMuscleGroup || exercise.muscleGroup,
      category: exercise.category,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      instructions: exercise.instructions || [],
      tips: exercise.benefits || exercise.tips || [],
      variations: exercise.variations || [],
      safetyNotes: exercise.safetyNotes || (exercise.coachingTips ? exercise.coachingTips.join('. ') : ''),
      source: exercise.source || 'MEGA AI Discovery',
      videoUrl: exercise.videoUrl,
      approved: true,
      addedFrom: 'MEGA AI Discovery',
      qualityScore: exercise.qualityScore,
      discoveryMethod: exercise.discoveryMethod,
      originalSearchTerm: exercise.originalSearchTerm,
      megaId: exerciseId
    };

    // Call onAddExercise for THIS specific exercise only
    onAddExercise(newExercise);

    // Update status for THIS exercise only
    setApprovedExercises(prev => new Set([...prev, exerciseId]));
    setPendingExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });

    // Remove ONLY this exercise from results after delay
    setTimeout(() => {
      setSearchResults(prev => prev.filter(ex =>
        (ex._id || ex.searchId) !== exerciseId
      ));
    }, 1500);

    console.log(`✅ Approved exercise: ${exercise.name} (ID: ${exerciseId})`);
  };

  const handleRejectExercise = (exercise) => {
    const exerciseId = exercise._id || exercise.searchId;

    setRejectedExercises(prev => new Set([...prev, exerciseId]));
    setPendingExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });

    // Remove ONLY this exercise from results after delay
    setTimeout(() => {
      setSearchResults(prev => prev.filter(ex =>
        (ex._id || ex.searchId) !== exerciseId
      ));
    }, 1000);

    console.log(`❌ Rejected exercise: ${exercise.name} (ID: ${exerciseId})`);
  };

  const getExerciseStatus = (exercise) => {
    const exerciseId = exercise._id || exercise.searchId;

    if (approvedExercises.has(exerciseId)) return 'approved';
    if (rejectedExercises.has(exerciseId)) return 'rejected';
    if (pendingExercises.has(exerciseId)) return 'pending';
    return 'none';
  };

  // Reset modal on close
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setPendingExercises(new Set());
    setApprovedExercises(new Set());
    setRejectedExercises(new Set());
    setVideoSearchStatus(new Map());
    setMegaDiscoveryStatus({ isRunning: false, sessionId: null, progress: null });
    setSelectedFilters({
      difficulty: '',
      equipment: '',
      muscle: '',
      sport: ''
    });
    onClose();
  };

  // Perform search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performAISearch();
  };

  // Change filter
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-orange-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Exercise Discovery</h2>
              <p className="text-gray-300 text-sm">Search the internet for exercises, workouts & training methods</p>
              {megaDiscoveryStatus.isRunning && (
                <p className="text-orange-400 text-sm font-medium">
                  🚀 MEGA Discovery läuft... Session: {megaDiscoveryStatus.sessionId}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Search & Filters */}
          <div className="w-80 bg-gray-800 p-6 border-r border-gray-700 overflow-y-auto">

            {/* Search Types */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Globe size={16} />
                Search Category
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {searchTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSearchType(type.id)}
                      className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                        searchType === type.id
                          ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon size={16} className="mx-auto mb-1" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search for ${searchType}s...`}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded text-white transition-colors"
                >
                  {isLoading && !megaDiscoveryStatus.isRunning ?
                    <Loader size={16} className="animate-spin" /> :
                    <Search size={16} />
                  }
                </button>
              </div>
            </form>

            {/* MEGA Discovery Button */}
            <button
              onClick={handleMegaDiscovery}
              disabled={isLoading || megaDiscoveryStatus.isRunning}
              className={`w-full mb-6 p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all transform ${
                megaDiscoveryStatus.isRunning 
                  ? 'bg-orange-600/50 text-orange-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white hover:scale-105'
              }`}
            >
              {megaDiscoveryStatus.isRunning ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  MEGA Discovery läuft...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-yellow-300" />
                  🌟 MEGA DISCOVERY - ALL SPORTS 🌟
                </>
              )}
            </button>

            {/* MEGA Discovery Progress */}
            {megaDiscoveryStatus.isRunning && megaDiscoveryStatus.progress && (
              <div className="mb-6 p-3 bg-orange-600/10 border border-orange-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <Zap size={14} />
                  Discovery Progress
                </h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Batch:</span>
                    <span>{megaDiscoveryStatus.progress.currentBatch}/{megaDiscoveryStatus.progress.totalBatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exercises:</span>
                    <span className="text-green-400">{megaDiscoveryStatus.progress.exercisesFound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Videos:</span>
                    <span className="text-blue-400">{megaDiscoveryStatus.progress.videosFound}</span>
                  </div>
                  {megaDiscoveryStatus.progress.currentTerm && (
                    <div className="text-xs text-orange-300 mt-2">
                      Current: {megaDiscoveryStatus.progress.currentTerm}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="space-y-4">
              {Object.entries(filterOptions).map(([filterType, options]) => (
                <div key={filterType}>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2 capitalize">{filterType}</h4>
                  <div className="flex flex-wrap gap-1">
                    {options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(filterType, option)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedFilters[filterType] === option
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Filters */}
            {Object.values(selectedFilters).some(filter => filter) && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Active Filters</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(selectedFilters).map(([type, value]) =>
                    value && (
                      <span
                        key={type}
                        className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs flex items-center gap-1"
                      >
                        {value}
                        <button
                          onClick={() => handleFilterChange(type, value)}
                          className="hover:text-orange-300"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Search Stats */}
            {searchResults.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Session Stats</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Found:</span>
                      <span className="text-white">{searchResults.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="text-yellow-400">{pendingExercises.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Added:</span>
                      <span className="text-green-400">{approvedExercises.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {isLoading && !megaDiscoveryStatus.isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Sparkles size={48} className="animate-pulse text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">AI is searching...</h3>
                <p className="text-sm">Finding the best {searchType}s for "{searchQuery}"</p>
              </div>
            )}

            {/* MEGA Discovery Loading */}
            {megaDiscoveryStatus.isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="relative">
                  <Sparkles size={64} className="animate-pulse text-orange-500 mb-4" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-lg font-medium mb-2 text-orange-400">MEGA AI Discovery läuft...</h3>
                <p className="text-sm text-center">
                  Durchsucht das Internet nach Übungen für 200+ Sportarten<br/>
                  {megaDiscoveryStatus.progress && (
                    <span className="text-green-400">
                      {megaDiscoveryStatus.progress.exercisesFound} Übungen gefunden
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !megaDiscoveryStatus.isRunning && searchResults.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-sm">Try different search terms or start MEGA Discovery</p>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && searchResults.length > 0 && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Found {searchResults.length} {searchType}s
                    {searchQuery && ` for "${searchQuery}"`}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Sparkles size={16} className="text-orange-500" />
                    {megaDiscoveryStatus.sessionId ? 'MEGA AI Discovery' : 'AI-powered search'}
                  </div>
                </div>

                <div className="space-y-4">
                  {searchResults.map((exercise) => {
                    const status = getExerciseStatus(exercise);

                    return (
                      <div
                        key={exercise.searchId || exercise._id}
                        className={`bg-gray-800 rounded-lg border p-6 transition-all duration-300 ${
                          status === 'approved' ? 'border-green-500 bg-green-900/10' :
                          status === 'rejected' ? 'border-red-500 bg-red-900/10 opacity-50' :
                          status === 'pending' ? 'border-yellow-500 bg-yellow-900/10' :
                          'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              {exercise.name}
                              {status === 'approved' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                                  <Check size={12} />
                                  Added to Library
                                </span>
                              )}
                              {status === 'pending' && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                                  <Clock size={12} />
                                  Review Pending
                                </span>
                              )}
                              {exercise.qualityScore && (
                                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                                  Quality: {exercise.qualityScore}
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-300 text-sm mb-3">{exercise.description}</p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs">
                                {exercise.primaryMuscleGroup || exercise.muscleGroup}
                              </span>
                              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                                {exercise.difficulty}
                              </span>
                              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                                {exercise.equipment}
                              </span>
                              {exercise.videoUrl && (
                                <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs flex items-center gap-1">
                                  <Play size={10} />
                                  Video
                                </span>
                              )}
                            </div>

                            {/* YouTube Video Preview */}
                            {exercise.videoUrl && (
                              <div className="mt-4 bg-gray-700/50 p-3 rounded border border-gray-600">
                                <div className="flex items-center gap-2 mb-2">
                                  <Play size={14} className="text-red-500" />
                                  <span className="text-sm font-medium text-gray-300">Tutorial Video</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={getYouTubeThumbnail(exercise.videoUrl, 'default')}
                                    alt={exercise.name}
                                    className="w-16 h-12 rounded object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-400">YouTube Tutorial</p>
                                    <p className="text-sm text-white">{exercise.name}</p>
                                  </div>
                                  <a
                                    href={exercise.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-red-400 hover:text-red-300"
                                  >
                                    Open Video
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-4">
                            {status === 'none' && (
                              <>
                                <button
                                  onClick={() => handleAddToPending(exercise)}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Clock size={14} />
                                  Review
                                </button>
                                <button
                                  onClick={() => handleApproveExercise(exercise)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Plus size={14} />
                                  Add Now
                                </button>
                              </>
                            )}

                            {status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveExercise(exercise)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Check size={14} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectExercise(exercise)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Reject
                                </button>
                              </>
                            )}

                            {status === 'approved' && (
                              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded text-sm">
                                <Check size={14} />
                                Added
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Instructions */}
                        {exercise.instructions && exercise.instructions.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Instructions</h5>
                            <ol className="list-decimal list-inside space-y-1">
                              {exercise.instructions.map((step, i) => (
                                <li key={i} className="text-gray-400 text-sm">{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Benefits & Tips */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {exercise.benefits && exercise.benefits.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-300 mb-1">Benefits</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {exercise.benefits.map((benefit, i) => (
                                  <li key={i} className="text-gray-400">{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {exercise.coachingTips && exercise.coachingTips.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-300 mb-1">Coaching Tips</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {exercise.coachingTips.map((tip, i) => (
                                  <li key={i} className="text-gray-400">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Source & Guidelines */}
                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
                          <span>Source: {exercise.source || exercise.originalSearchTerm || 'AI Discovery'}</span>
                          {exercise.setRepGuidelines && (
                            <span className="font-medium">{exercise.setRepGuidelines}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Welcome State */}
            {!searchQuery && !megaDiscoveryStatus.isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <div className="bg-gradient-to-br from-orange-600/20 to-purple-600/20 p-8 rounded-2xl border border-gray-700 max-w-md text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-orange-500" />
                  <h3 className="text-lg font-medium mb-2 text-white">Discover New Exercises</h3>
                  <p className="text-sm mb-4">Search the internet for exercises, workouts, and training methods. Review and add the best ones to your library.</p>
                  <div className="text-xs text-gray-500 mb-2">
                    Try: "functional movements", "core stability", "explosive training"
                  </div>
                  <div className="text-xs text-orange-500 font-medium">
                    🚀 Or start MEGA Discovery for 200+ sports automatically!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchModal;