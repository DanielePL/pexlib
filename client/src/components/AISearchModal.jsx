// client/src/components/AISearchModal.jsx - FIXED WITH BACKEND INTEGRATION
import React, { useState } from 'react';
import {
  Search, X, Sparkles, Globe, Loader, Plus, Check, Clock, Trash2,
  Dumbbell, Target, Zap, Users, Play, BookOpen
} from 'lucide-react';

// Enhanced AI Search Modal - BACKEND + CLIENT-SIDE HYBRID
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

  // Discovery Status State
  const [discoveryStatus, setDiscoveryStatus] = useState({
    isRunning: false,
    sessionId: null,
    progress: null,
    exercisesFound: 0,
    mode: 'unknown' // 'backend', 'client', 'unknown'
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

  // Backend API Base URL Detection
  const getBackendURL = () => {
    if (process.env.NODE_ENV === 'production') {
      return ''; // Same origin in production
    }
    return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  };

  // MEGA Discovery Handler - WITH BACKEND FALLBACK
  const handleMegaDiscovery = async () => {
    setIsLoading(true);
    setDiscoveryStatus({
      isRunning: true,
      sessionId: null,
      progress: null,
      exercisesFound: 0,
      mode: 'unknown'
    });

    try {
      console.log('🚀 Starting MEGA Discovery...');

      // Try Backend First
      const backendResult = await tryBackendMegaDiscovery();
      if (backendResult.success) {
        return; // Backend processing started
      }

      // Fallback to Client-Side
      console.log('🔄 Backend unavailable, switching to client-side mode...');
      await startClientSideMegaDiscovery();

    } catch (error) {
      console.error('MEGA Discovery failed:', error);
      setDiscoveryStatus({
        isRunning: false,
        sessionId: null,
        progress: null,
        exercisesFound: 0,
        mode: 'failed'
      });
      alert(`❌ MEGA Discovery failed: ${error.message}`);
    } finally {
      if (!discoveryStatus.isRunning) {
        setIsLoading(false);
      }
    }
  };

  // Try Backend MEGA Discovery
  const tryBackendMegaDiscovery = async () => {
    try {
      const backendURL = getBackendURL();
      console.log(`🔗 Trying backend at: ${backendURL}/api/mega-discovery/start`);

      const response = await fetch(`${backendURL}/api/mega-discovery/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType: 'test_run',
          batchSize: 5,
          maxExercisesPerTerm: 3,
          testMode: true,
          targetSports: null
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎉 Backend MEGA Discovery started:', data);

      if (data.success) {
        setDiscoveryStatus({
          isRunning: true,
          sessionId: data.sessionId,
          progress: { exercisesFound: 0, currentBatch: 0, totalBatches: 0 },
          exercisesFound: 0,
          mode: 'backend'
        });

        // Start monitoring backend progress
        monitorBackendProgress(data.sessionId);
        setSearchQuery(`MEGA Discovery - Backend Session ${data.sessionId}`);

        alert(`🚀 Backend MEGA Discovery started!\n\nSession: ${data.sessionId}\nEstimated Duration: ${data.estimatedDuration}`);

        return { success: true };
      } else {
        throw new Error(data.error || 'Backend start failed');
      }

    } catch (error) {
      console.warn('⚠️ Backend MEGA Discovery failed:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Monitor Backend Progress
  const monitorBackendProgress = async (sessionId) => {
    const checkInterval = 3000;
    const maxChecks = 200;
    let checkCount = 0;

    const checkProgress = async () => {
      try {
        checkCount++;

        if (checkCount > maxChecks) {
          console.warn('Backend monitoring timeout');
          setDiscoveryStatus(prev => ({ ...prev, isRunning: false }));
          setIsLoading(false);
          return;
        }

        const backendURL = getBackendURL();
        const response = await fetch(`${backendURL}/api/mega-discovery/status/${sessionId}`);
        const statusData = await response.json();

        if (statusData.success) {
          const session = statusData.session;

          setDiscoveryStatus(prev => ({
            ...prev,
            progress: session.progress,
            exercisesFound: session.progress?.exercisesFound || 0
          }));

          console.log(`📊 Backend Progress: Batch ${session.progress?.currentBatch}/${session.progress?.totalBatches}, Exercises: ${session.progress?.exercisesFound}`);

          if (session.status === 'completed') {
            console.log('✅ Backend MEGA Discovery completed!');
            setDiscoveryStatus(prev => ({
              ...prev,
              isRunning: false,
              exercisesFound: session.results?.totalExercises || 0
            }));
            setIsLoading(false);

            await loadBackendExercises(sessionId);
            alert(`🎉 Backend MEGA Discovery completed!\n\n✅ ${session.results?.totalExercises} exercises found\n⏱️ Duration: ${session.results?.duration}s`);
            return;
          }

          if (session.status === 'failed') {
            console.error('❌ Backend MEGA Discovery failed');
            setDiscoveryStatus(prev => ({ ...prev, isRunning: false }));
            setIsLoading(false);
            alert('❌ Backend MEGA Discovery failed. Check server logs.');
            return;
          }

          if (session.status === 'running') {
            setTimeout(checkProgress, checkInterval);
          }
        }

      } catch (error) {
        console.error('Backend monitoring error:', error);
        setTimeout(checkProgress, checkInterval); // Continue monitoring
      }
    };

    setTimeout(checkProgress, checkInterval);
  };

  // Load Backend Exercises
  const loadBackendExercises = async (sessionId = null) => {
    try {
      const backendURL = getBackendURL();
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', '50');

      const response = await fetch(`${backendURL}/api/mega-discovery/exercises?${params}`);
      const data = await response.json();

      if (data.success) {
        console.log(`📋 Loaded ${data.exercises.length} backend exercises`);

        const processedExercises = data.exercises.map(exercise => ({
          ...exercise,
          searchId: exercise._id,
          muscleGroup: exercise.primaryMuscleGroup,
          instructions: exercise.instructions || [],
          tips: exercise.specificBenefits || [],
          variations: [],
          safetyNotes: exercise.keyCoachingCues?.join('. ') || '',
          source: `Backend MEGA Discovery - ${exercise.originalSearchTerm}`
        }));

        setSearchResults(processedExercises);
        setSearchQuery(`Backend MEGA Discovery - ${processedExercises.length} exercises found`);

        setPendingExercises(new Set());
        setApprovedExercises(new Set());
        setRejectedExercises(new Set());
      }

    } catch (error) {
      console.error('Failed to load backend exercises:', error);
    }
  };

  // Client-Side MEGA Discovery Fallback
  const startClientSideMegaDiscovery = async () => {
    setDiscoveryStatus(prev => ({
      ...prev,
      mode: 'client',
      progress: { exercisesFound: 0, currentBatch: 0, totalBatches: 15 }
    }));

    const megaSearchTerms = [
      'strength training exercises',
      'cardio workouts',
      'flexibility stretches',
      'powerlifting movements',
      'bodyweight exercises',
      'core strengthening',
      'athletic conditioning',
      'functional movements',
      'mobility drills',
      'endurance training',
      'balance training',
      'plyometric exercises',
      'resistance band workouts',
      'kettlebell training',
      'olympic lifting'
    ];

    const allExercises = [];

    for (let i = 0; i < megaSearchTerms.length; i++) {
      const term = megaSearchTerms[i];
      console.log(`🔍 Client: ${term} (${i + 1}/${megaSearchTerms.length})`);

      setDiscoveryStatus(prev => ({
        ...prev,
        progress: {
          exercisesFound: allExercises.length,
          currentTerm: term,
          currentBatch: i + 1,
          totalBatches: megaSearchTerms.length
        }
      }));

      try {
        const exercises = await discoverExercisesForTerm(term);
        allExercises.push(...exercises);

        setDiscoveryStatus(prev => ({
          ...prev,
          exercisesFound: allExercises.length
        }));

        console.log(`   ✅ Found ${exercises.length} exercises for "${term}"`);
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error(`   ❌ Error for "${term}":`, error.message);
      }
    }

    const uniqueExercises = removeDuplicateExercises(allExercises);
    setSearchResults(uniqueExercises);
    setSearchQuery(`Client MEGA Discovery - ${uniqueExercises.length} exercises found`);

    setPendingExercises(new Set());
    setApprovedExercises(new Set());
    setRejectedExercises(new Set());

    setDiscoveryStatus({
      isRunning: false,
      sessionId: null,
      progress: null,
      exercisesFound: uniqueExercises.length,
      mode: 'client'
    });
    setIsLoading(false);

    alert(`🎉 Client MEGA Discovery completed!\n\n✅ ${uniqueExercises.length} unique exercises discovered\n🤖 Client-side AI processing`);
  };

  // AI Discovery for a specific search term
  const discoverExercisesForTerm = async (searchTerm) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not found - using fallback');
      return getFallbackExercises(searchTerm, 2);
    }

    const discoveryPrompt = `
You are a world-class exercise science researcher and sports performance expert.

SEARCH TERM: "${searchTerm}"

Find 2-3 SPECIFIC, HIGH-QUALITY exercises for this search term.

REQUIREMENTS:
✅ Unique and specific exercises (not generic)
✅ Proven effective for the application
✅ Include: STRENGTH, ENDURANCE, BALANCE, MOBILITY exercises
✅ Practical and safe for real-world use
✅ Focus on specialized techniques

Return JSON format:
{
  "exercises": [
    {
      "name": "Specific Exercise Name",
      "description": "Clear description of what makes this exercise special",
      "category": "strength|endurance|balance|mobility",
      "primaryMuscleGroup": "specific muscle group",
      "equipment": "required equipment",
      "difficulty": "beginner|intermediate|advanced",
      "instructions": ["step 1", "step 2", "step 3"],
      "benefits": ["benefit 1", "benefit 2"],
      "setRepGuidelines": "recommended sets/reps",
      "coachingTips": ["tip 1", "tip 2"]
    }
  ]
}

Return ONLY valid JSON.`;

    try {
      const response = await callOpenAI(discoveryPrompt);
      const result = JSON.parse(response);

      if (!result.exercises || !Array.isArray(result.exercises)) {
        throw new Error('Invalid OpenAI response format');
      }

      return result.exercises.map(exercise => ({
        ...exercise,
        searchId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        discoveredAt: new Date().toISOString(),
        discoveryMethod: 'Client AI Discovery',
        originalSearchTerm: searchTerm,
        qualityScore: calculateQualityScore(exercise),
        source: `AI Discovery - ${searchTerm}`
      }));

    } catch (error) {
      console.error(`AI discovery failed for "${searchTerm}":`, error);
      return getFallbackExercises(searchTerm, 2);
    }
  };

  // Fallback exercises when AI fails
  const getFallbackExercises = (searchTerm, count = 2) => {
    const fallbackTemplates = [
      {
        name: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} Power Circuit`,
        description: `High-intensity circuit targeting ${searchTerm} performance enhancement.`,
        category: 'strength',
        primaryMuscleGroup: 'Full Body',
        equipment: 'Minimal Equipment',
        difficulty: 'intermediate',
        instructions: [
          'Set up exercise stations',
          'Perform each exercise for 30 seconds',
          'Rest 15 seconds between exercises',
          'Complete 3 rounds'
        ],
        benefits: ['Improved power', 'Enhanced conditioning'],
        setRepGuidelines: '3 rounds of 30s work / 15s rest',
        coachingTips: ['Focus on form', 'Maintain intensity']
      },
      {
        name: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} Mobility Sequence`,
        description: `Dynamic mobility routine for ${searchTerm} movement preparation.`,
        category: 'mobility',
        primaryMuscleGroup: 'Multi-Joint',
        equipment: 'None',
        difficulty: 'beginner',
        instructions: [
          'Begin with gentle movements',
          'Progress to dynamic stretching',
          'Focus on full range of motion',
          'Hold positions for 2-3 seconds'
        ],
        benefits: ['Improved mobility', 'Injury prevention'],
        setRepGuidelines: '2-3 sets of 8-12 reps',
        coachingTips: ['Move slowly', 'Breathe deeply']
      }
    ];

    return fallbackTemplates.slice(0, count).map(exercise => ({
      ...exercise,
      searchId: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discoveredAt: new Date().toISOString(),
      discoveryMethod: 'Fallback System',
      originalSearchTerm: searchTerm,
      qualityScore: 75,
      source: `Fallback Discovery - ${searchTerm}`,
      isFallback: true
    }));
  };

  // Quality score calculation
  const calculateQualityScore = (exercise) => {
    let score = 0;
    if (exercise.name && exercise.name.length > 8) score += 20;
    if (exercise.description && exercise.description.length > 30) score += 15;
    if (exercise.instructions && exercise.instructions.length >= 3) score += 20;
    if (exercise.benefits && exercise.benefits.length >= 2) score += 15;
    if (exercise.coachingTips && exercise.coachingTips.length >= 2) score += 10;
    if (exercise.setRepGuidelines && exercise.setRepGuidelines.length > 10) score += 10;
    if (exercise.category && ['strength', 'endurance', 'balance', 'mobility'].includes(exercise.category)) score += 5;
    if (exercise.difficulty && ['beginner', 'intermediate', 'advanced'].includes(exercise.difficulty)) score += 5;
    return Math.min(score, 100);
  };

  // Remove duplicates
  const removeDuplicateExercises = (exercises) => {
    const seen = new Map();
    const unique = [];

    for (const exercise of exercises) {
      const key = createSimilarityKey(exercise);
      if (!seen.has(key)) {
        seen.set(key, exercise);
        unique.push(exercise);
      } else {
        const existing = seen.get(key);
        if (exercise.qualityScore > existing.qualityScore) {
          const index = unique.indexOf(existing);
          unique[index] = exercise;
          seen.set(key, exercise);
        }
      }
    }

    return unique;
  };

  const createSimilarityKey = (exercise) => {
    const nameWords = exercise.name.toLowerCase().split(' ').sort();
    const muscleGroup = (exercise.primaryMuscleGroup || '').toLowerCase();
    const category = (exercise.category || '').toLowerCase();
    return `${nameWords.slice(0, 3).join('_')}_${muscleGroup}_${category}`;
  };

  // OpenAI API Call
  const callOpenAI = async (prompt) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a world-class exercise science researcher and sports performance expert.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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

      const apiResponse = await callOpenAI(searchPrompt);

      if (!apiResponse) {
        throw new Error('No response from OpenAI');
      }

      const processedResults = JSON.parse(apiResponse);

      if (!processedResults.exercises || !Array.isArray(processedResults.exercises)) {
        console.error('Invalid API response format:', processedResults);
        throw new Error('Invalid API response format');
      }

      const resultsWithIds = processedResults.exercises.map((exercise, index) => ({
        ...exercise,
        searchId: `search_${Date.now()}_${index}`,
        muscleGroup: exercise.primaryMuscleGroup || exercise.muscleGroup,
        source: `AI Search - ${searchQuery}`
      }));

      console.log(`Found ${resultsWithIds.length} exercises from AI search`);
      setSearchResults(resultsWithIds);

      setPendingExercises(new Set());
      setApprovedExercises(new Set());
      setRejectedExercises(new Set());

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

  // Exercise management functions
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
      approved: true,
      addedFrom: 'MEGA AI Discovery',
      qualityScore: exercise.qualityScore,
      discoveryMethod: exercise.discoveryMethod,
      originalSearchTerm: exercise.originalSearchTerm
    };

    onAddExercise(newExercise);

    setApprovedExercises(prev => new Set([...prev, exerciseId]));
    setPendingExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });

    setTimeout(() => {
      setSearchResults(prev => prev.filter(ex =>
        (ex._id || ex.searchId) !== exerciseId
      ));
    }, 1500);

    console.log(`✅ Approved exercise: ${exercise.name}`);
  };

  const handleRejectExercise = (exercise) => {
    const exerciseId = exercise._id || exercise.searchId;

    setRejectedExercises(prev => new Set([...prev, exerciseId]));
    setPendingExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });

    setTimeout(() => {
      setSearchResults(prev => prev.filter(ex =>
        (ex._id || ex.searchId) !== exerciseId
      ));
    }, 1000);

    console.log(`❌ Rejected exercise: ${exercise.name}`);
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
    setDiscoveryStatus({
      isRunning: false,
      sessionId: null,
      progress: null,
      exercisesFound: 0,
      mode: 'unknown'
    });
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
              <p className="text-gray-300 text-sm">Search and discover exercises with AI power</p>
              {discoveryStatus.isRunning && (
                <p className="text-orange-400 text-sm font-medium">
                  🚀 MEGA Discovery running...
                  {discoveryStatus.mode === 'backend' ? `Backend Session: ${discoveryStatus.sessionId}` : 'Client-side mode'}
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
                  {isLoading && !discoveryStatus.isRunning ?
                    <Loader size={16} className="animate-spin" /> :
                    <Search size={16} />
                  }
                </button>
              </div>
            </form>

            {/* MEGA Discovery Button */}
            <button
              onClick={handleMegaDiscovery}
              disabled={isLoading || discoveryStatus.isRunning}
              className={`w-full mb-6 p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all transform ${
                discoveryStatus.isRunning 
                  ? 'bg-orange-600/50 text-orange-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white hover:scale-105'
              }`}
            >
              {discoveryStatus.isRunning ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  MEGA Discovery running...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-yellow-300" />
                  🌟 MEGA DISCOVERY 🌟
                </>
              )}
            </button>

            {/* MEGA Discovery Progress */}
            {discoveryStatus.isRunning && discoveryStatus.progress && (
              <div className="mb-6 p-3 bg-orange-600/10 border border-orange-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <Zap size={14} />
                  Discovery Progress
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {discoveryStatus.mode === 'backend' ? 'Backend' : 'Client'}
                  </span>
                </h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Batch:</span>
                    <span>{discoveryStatus.progress.currentBatch}/{discoveryStatus.progress.totalBatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exercises:</span>
                    <span className="text-green-400">{discoveryStatus.progress.exercisesFound}</span>
                  </div>
                  {discoveryStatus.progress.videosFound !== undefined && (
                    <div className="flex justify-between">
                      <span>Videos:</span>
                      <span className="text-blue-400">{discoveryStatus.progress.videosFound}</span>
                    </div>
                  )}
                  {discoveryStatus.progress.currentTerm && (
                    <div className="text-xs text-orange-300 mt-2">
                      Current: {discoveryStatus.progress.currentTerm}
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
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className={discoveryStatus.mode === 'backend' ? 'text-blue-400' : 'text-purple-400'}>
                        {discoveryStatus.mode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {isLoading && !discoveryStatus.isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Sparkles size={48} className="animate-pulse text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">AI is searching...</h3>
                <p className="text-sm">Finding the best {searchType}s for "{searchQuery}"</p>
              </div>
            )}

            {/* MEGA Discovery Loading */}
            {discoveryStatus.isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="relative">
                  <Sparkles size={64} className="animate-pulse text-orange-500 mb-4" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-lg font-medium mb-2 text-orange-400">
                  MEGA AI Discovery running...
                </h3>
                <p className="text-sm text-center">
                  {discoveryStatus.mode === 'backend' ?
                    'Backend server processing comprehensive exercise database' :
                    'Client-side processing with AI assistance'
                  }
                  <br/>
                  {discoveryStatus.progress && (
                    <span className="text-green-400">
                      {discoveryStatus.progress.exercisesFound} exercises found
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !discoveryStatus.isRunning && searchResults.length === 0 && searchQuery && (
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
                    {discoveryStatus.mode === 'backend' ? 'Backend MEGA Discovery' :
                     discoveryStatus.mode === 'client' ? 'Client-side AI Discovery' :
                     'AI-powered search'}
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
                            </div>
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
            {!searchQuery && !discoveryStatus.isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <div className="bg-gradient-to-br from-orange-600/20 to-purple-600/20 p-8 rounded-2xl border border-gray-700 max-w-md text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-orange-500" />
                  <h3 className="text-lg font-medium mb-2 text-white">Discover New Exercises</h3>
                  <p className="text-sm mb-4">Search for exercises and training methods. Review and add the best ones to your library.</p>
                  <div className="text-xs text-gray-500 mb-2">
                    Try: "functional movements", "core stability", "explosive training"
                  </div>
                  <div className="text-xs text-orange-500 font-medium">
                    🚀 Or start MEGA Discovery for comprehensive search!
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