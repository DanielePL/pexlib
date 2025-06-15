// client/src/components/ExerciseLibrary.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Play, Plus, X, CheckCircle, MessageSquare,
  Sparkles, Loader, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import SportsFilter from './SportsFilter';
import AISearchModal from './AISearchModal';
import { searchExerciseVideo, searchExerciseVideoForSport } from './utils/youtubeService';

const PrometheusExerciseLibrary = () => {
  // Basis-Statusvariablen
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAISearch, setIsAISearch] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState(null);

  // Video-bezogene Zustände
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoResults, setVideoResults] = useState([]);

  // Filter-Zustände
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal-Zustände
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showAISearchModal, setShowAISearchModal] = useState(false);

  // Konstanten
  const exercisesPerPage = 9;
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  // Utility functions
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

  // Sample data laden
  useEffect(() => {
    const sampleExercises = [
      {
        id: 1,
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        category: 'Strength',
        description: 'Lie on a flat bench with feet on the ground. Grip the barbell with hands slightly wider than shoulder-width apart. Lower the bar to your mid-chest, then press back up to full arm extension.',
        difficulty: 'Intermediate',
        equipment: 'Barbell, Bench',
        videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        approved: true,
        discussions: [
          { id: 1, user: 'Coach Mike', text: 'Great exercise for overall chest development.', date: '2025-04-05' }
        ],
        sports: ['weightlifting', 'powerlifting']
      },
      {
        id: 2,
        name: 'Pull-ups',
        muscleGroup: 'Back',
        category: 'Bodyweight',
        description: 'Hang from a pull-up bar with palms facing away from you. Pull your body up until your chin is above the bar, then lower back down with control.',
        difficulty: 'Advanced',
        equipment: 'Pull-up Bar',
        videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
        approved: true,
        discussions: [],
        sports: ['weightlifting', 'hockey']
      },
      {
        id: 3,
        name: 'Squat',
        muscleGroup: 'Legs',
        category: 'Compound',
        description: 'Stand with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back, as if sitting in a chair. Return to starting position.',
        difficulty: 'Beginner',
        equipment: 'None (bodyweight) or Barbell',
        videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
        approved: true,
        discussions: [],
        sports: ['weightlifting', 'soccer', 'hockey']
      },
      {
        id: 4,
        name: 'Dumbbell Shoulder Press',
        muscleGroup: 'Shoulders',
        category: 'Strength',
        description: 'Sit or stand with dumbbells at shoulder height. Press the weights upward until arms are extended, then lower back to starting position.',
        difficulty: 'Intermediate',
        equipment: 'Dumbbells',
        videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
        approved: false,
        discussions: [
          { id: 1, user: 'Coach Jen', text: 'Need to clarify seated vs standing variation.', date: '2025-04-08' }
        ],
        sports: ['tennis', 'weightlifting']
      },
      {
        id: 5,
        name: 'Plank',
        muscleGroup: 'Core',
        category: 'Isometric',
        description: 'Get into a push-up position but with forearms on the ground. Maintain a straight line from head to heels, engaging core muscles.',
        difficulty: 'Beginner',
        equipment: 'None',
        videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
        approved: true,
        discussions: [],
        sports: ['running', 'soccer', 'tennis', 'hockey']
      },
      {
        id: 6,
        name: 'Lateral Lunges',
        muscleGroup: 'Legs',
        category: 'Bodyweight',
        description: 'Step to the side and lower into a lunge, keeping the other leg straight. Perfect for sports requiring lateral movement.',
        difficulty: 'Intermediate',
        equipment: 'None or Dumbbells',
        videoUrl: 'https://www.youtube.com/watch?v=QE_39RT1t3E',
        approved: true,
        discussions: [],
        sports: ['tennis', 'hockey', 'soccer']
      }
    ];

    setExercises(sampleExercises);
    setFilteredExercises(sampleExercises);
  }, []);

  // Get unique muscle groups and categories
  const muscleGroups = ['All', ...new Set(exercises.map(ex => ex.muscleGroup))];
  const exerciseCategories = ['All', ...new Set(exercises.map(ex => ex.category))];

  // Search Functions - in der richtigen Reihenfolge definiert
  const performSearch = useCallback((query) => {
    if (!exercises || exercises.length === 0) {
      console.error('No exercises data available for search');
      return;
    }

    const results = exercises.filter(exercise =>
      (exercise?.name?.toLowerCase().includes(query.toLowerCase())) ||
      (exercise?.description?.toLowerCase().includes(query.toLowerCase())) ||
      (exercise?.muscleGroup?.toLowerCase().includes(query.toLowerCase())) ||
      (exercise?.equipment?.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredExercises(results);
    setSearchMetadata({
      query,
      totalResults: results.length,
      isAI: false
    });
    setCurrentPage(1);
    setIsAISearch(false);
  }, [exercises]);

  // Intelligente lokale Suche als Fallback
  const performIntelligentLocalSearch = useCallback((query) => {
    const lowercaseQuery = query.toLowerCase();
    const searchTerms = lowercaseQuery.split(' ');

    const results = exercises.filter(exercise => {
      let score = 0;

      // Name matching (höchste Priorität)
      if (exercise.name.toLowerCase().includes(lowercaseQuery)) {
        score += 10;
      }

      // Einzelne Wörter im Namen
      searchTerms.forEach(term => {
        if (exercise.name.toLowerCase().includes(term)) {
          score += 5;
        }
      });

      // Beschreibung matching
      if (exercise.description.toLowerCase().includes(lowercaseQuery)) {
        score += 3;
      }

      // Muskelgruppe matching
      if (exercise.muscleGroup.toLowerCase().includes(lowercaseQuery)) {
        score += 8;
      }

      // Equipment matching
      if (exercise.equipment.toLowerCase().includes(lowercaseQuery)) {
        score += 4;
      }

      // Sport-spezifische Suche
      if (selectedSport && exercise.sports && exercise.sports.includes(selectedSport)) {
        score += 6;
      }

      return score > 0;
    }).sort((a, b) => {
      // Sortiere nach Relevanz (hier vereinfacht nach Name-Match)
      const aNameMatch = a.name.toLowerCase().includes(lowercaseQuery);
      const bNameMatch = b.name.toLowerCase().includes(lowercaseQuery);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return 0;
    });

    return results;
  }, [exercises, selectedSport]);

  // AI Search Functions
  const processSearchWithAI = useCallback(async (query) => {
    try {
      const response = await axios.post('/api/exercises/ai-search', {
        query,
        options: {
          sportContext: selectedSport || null
        }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('AI search processing error:', error);
      // Fallback zur lokalen intelligenten Suche
      return performIntelligentLocalSearch(query);
    }
  }, [selectedSport, performIntelligentLocalSearch]);

  const performAISearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await processSearchWithAI(searchQuery.trim());
      setFilteredExercises(results);
      setIsAISearch(true);
      setCurrentPage(1);
      setSearchMetadata({
        query: searchQuery,
        totalResults: results.length,
        isAI: true
      });
    } catch (error) {
      console.error('AI search error:', error);
      performSearch(searchQuery.trim());
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, processSearchWithAI, performSearch]);

  // Sport Filter Handler
  const handleSportSelect = (sportId) => {
    setSelectedSport(sportId);

    if (sportId) {
      const sportFiltered = exercises.filter(exercise =>
        exercise.sports && exercise.sports.includes(sportId)
      );
      setFilteredExercises(sportFiltered);
      setSearchMetadata({
        query: `Sport: ${sportId}`,
        totalResults: sportFiltered.length,
        isAI: false,
        isSportFilter: true
      });
    } else {
      // Wenn kein Sport ausgewählt, zeige alle oder behalte Suche bei
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setFilteredExercises(exercises);
        setSearchMetadata(null);
      }
    }
    setCurrentPage(1);
  };

  // Filter effects
  useEffect(() => {
    if (!searchQuery && selectedMuscleGroup === 'All' && selectedCategory === 'All' && !selectedSport) {
      setFilteredExercises(exercises);
      setSearchMetadata(null);
      return;
    }

    let results = exercises;

    // Sport Filter
    if (selectedSport) {
      results = results.filter(exercise =>
        exercise.sports && exercise.sports.includes(selectedSport)
      );
    }

    // Muscle Group Filter
    if (selectedMuscleGroup !== 'All') {
      results = results.filter(exercise => exercise.muscleGroup === selectedMuscleGroup);
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      results = results.filter(exercise => exercise.category === selectedCategory);
    }

    setFilteredExercises(results);
    setCurrentPage(1);
  }, [selectedMuscleGroup, selectedCategory, selectedSport, exercises, searchQuery]);

  // Pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);

  const changePage = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Exercise management
  const addExercise = (newExercise) => {
    const exerciseWithId = {
      ...newExercise,
      id: exercises.length + 1,
      approved: newExercise.approved !== undefined ? newExercise.approved : false,
      discussions: [],
      sports: newExercise.sports || []
    };
    setExercises([...exercises, exerciseWithId]);
    setShowAddExerciseForm(false);
  };

  const toggleApproval = (exerciseId) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, approved: !ex.approved };
      }
      return ex;
    }));

    if (selectedExercise && selectedExercise.id === exerciseId) {
      const updatedExercise = exercises.find(ex => ex.id === exerciseId);
      setSelectedExercise(updatedExercise);
    }
  };

  const addComment = (exerciseId, comment) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          discussions: [
            ...ex.discussions,
            {
              id: ex.discussions.length + 1,
              user: 'Current Coach',
              text: comment,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return ex;
    }));

    if (selectedExercise && selectedExercise.id === exerciseId) {
      const updatedExercise = exercises.find(ex => ex.id === exerciseId);
      setSelectedExercise(updatedExercise);
    }
  };

  const openExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  };

  const handleOpenVideo = async (exercise) => {
    setSelectedExercise(exercise);
    setShowVideoModal(true);
    setLoadingVideo(true);

    try {
      // Verwende die YouTube-Service-Funktionen
      const videoUrl = selectedSport
        ? await searchExerciseVideoForSport(exercise, selectedSport)
        : await searchExerciseVideo(exercise);

      if (videoUrl) {
        setVideoResults({ videoId: getYouTubeVideoId(videoUrl), url: videoUrl });
      } else {
        // Fallback zum vorhandenen Video
        setVideoResults({ videoId: getYouTubeVideoId(exercise.videoUrl) });
      }
    } catch (error) {
      console.error('Error loading video:', error);
      // Fallback zum vorhandenen Video
      setVideoResults({ videoId: getYouTubeVideoId(exercise.videoUrl) });
    } finally {
      setLoadingVideo(false);
    }
  };

  // AI Search Component
  const AISearch = ({ searchTerm, setSearchTerm }) => {
    const [isAIMode, setIsAIMode] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const aiSuggestions = [
      "chest exercises for beginners",
      "bodyweight exercises for home workout",
      "compound movements for strength",
      "core exercises without equipment",
      "tennis specific exercises",
      "hockey training movements"
    ];

    const handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      setShowSuggestions(false);

      if (isAIMode) {
        await performAISearch();
      } else {
        performSearch(searchTerm);
      }
    };

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      if (value.length > 0) {
        setSuggestions(aiSuggestions.slice(0, 4));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };

    const handleSuggestionClick = (suggestion) => {
      setSearchTerm(suggestion);
      setShowSuggestions(false);
      if (isAIMode) {
        performAISearch();
      } else {
        performSearch(suggestion);
      }
    };

    return (
      <div className="relative mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Search size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Search</span>
          </div>
          <button
            onClick={() => setIsAIMode(!isAIMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              isAIMode 
                ? 'bg-orange-600/20 text-orange-500 border border-orange-500/30' 
                : 'bg-gray-800 text-gray-400 hover:text-orange-500 border border-gray-700'
            }`}
          >
            <Sparkles size={12} />
            AI
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder={isAIMode ? "Try: 'chest exercises for beginners'" : "Search exercises..."}
            className={`w-full p-2 pl-8 pr-10 bg-gray-800 border rounded text-white text-sm transition-colors ${
              isAIMode 
                ? 'border-orange-500/50 focus:border-orange-500' 
                : 'border-gray-700 focus:border-gray-600'
            } focus:outline-none`}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <div className="absolute left-2 top-2.5">
            {isSearching ? (
              <Loader size={14} className="text-orange-500 animate-spin" />
            ) : (
              <Search size={14} className={isAIMode ? 'text-orange-500' : 'text-gray-500'} />
            )}
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setShowSuggestions(false);
                setFilteredExercises(exercises);
                setSearchMetadata(null);
                setIsAISearch(false);
              }}
              className="absolute right-2 top-2.5 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-md mt-1 z-50 shadow-lg">
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                {isAIMode && <Sparkles size={10} />}
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-4 flex flex-col">
        <AISearch searchTerm={searchQuery} setSearchTerm={setSearchQuery} />

        {/* AI Discovery Button */}
        <button
          onClick={() => setShowAISearchModal(true)}
          className="w-full mb-4 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all transform hover:scale-105"
        >
          <Sparkles size={18} />
          AI Exercise Discovery
        </button>

        {/* Search Results Info */}
        {searchMetadata && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              {searchMetadata.isAI ? (
                <Sparkles size={14} className="text-orange-500" />
              ) : (
                <Search size={14} className="text-gray-400" />
              )}
              <span className="text-xs font-medium text-orange-500">
                {searchMetadata.isAI ? 'AI Search' : searchMetadata.isSportFilter ? 'Sport Filter' : 'Standard Search'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {searchMetadata.totalResults} results for "{searchMetadata.query}"
            </p>
          </div>
        )}

        {/* Sports Filter */}
        <SportsFilter
          selectedSport={selectedSport}
          onSportSelect={handleSportSelect}
        />

        {/* Traditional Filters */}
        <div className="mb-4">
          <h3 className="font-medium mb-2 flex items-center gap-2 text-orange-500">
            <Filter size={16} /> Muscle Group
          </h3>
          <select
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          >
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2 flex items-center gap-2 text-orange-500">
            <Filter size={16} /> Category
          </h3>
          <select
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {exerciseCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 bg-gray-800 p-3 rounded">
          <p className="text-sm text-gray-400">
            {filteredExercises.length} exercises found
          </p>
          <p className="text-sm text-gray-400">
            {exercises.filter(ex => ex.approved).length} approved / {exercises.length} total
          </p>
          {selectedSport && (
            <p className="text-sm text-orange-400 mt-1">
              Filter: {selectedSport}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto bg-gray-950">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
            <p className="text-gray-400">Manage your team's exercise collection</p>
          </div>
          <button
            onClick={() => setShowAddExerciseForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={20} />
            Add Exercise
          </button>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-2">
              <Sparkles className="text-orange-500 animate-pulse" size={20} />
              <div className="text-orange-500">
                {isAISearch ? 'AI is analyzing your search...' : 'Searching exercises...'}
              </div>
            </div>
          </div>
        )}

        {/* Exercise Grid */}
        {!isSearching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentExercises.map(exercise => (
              <div
                key={exercise.id}
                className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors border border-gray-800"
                onClick={() => openExerciseDetails(exercise)}
              >
                <div className="h-48 bg-gray-800 relative group">
                  <img
                    src={getYouTubeThumbnail(exercise.videoUrl)}
                    alt={exercise.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                    <div className="bg-red-600 rounded-full p-3">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                  {exercise.approved && (
                    <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs">
                      Approved
                    </div>
                  )}
                  {isAISearch && (
                    <div className="absolute top-2 left-2 bg-orange-600/20 text-orange-500 px-2 py-1 rounded text-xs border border-orange-500/30 flex items-center gap-1">
                      <Sparkles size={10} />
                      AI Match
                    </div>
                  )}
                  {selectedSport && exercise.sports?.includes(selectedSport) && (
                    <div className="absolute bottom-2 left-2 bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs border border-purple-500/30">
                      Sport Match
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{exercise.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                      {exercise.muscleGroup}
                    </span>
                    <span className="bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {exercise.description}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {exercise.equipment}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MessageSquare size={14} />
                      <span className="text-xs">{exercise.discussions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isSearching && filteredExercises.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No exercises found</h3>
            <p className="text-sm text-center mb-4">
              Try adjusting your search terms or filters
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddExerciseForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={16} />
                Add Exercise
              </button>
              <button
                onClick={() => setShowAISearchModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Sparkles size={16} />
                Discover Exercises
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-4 bg-gray-900 px-4 py-2 rounded">
              <button
                className={`text-gray-400 hover:text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => changePage('prev')}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={`text-gray-400 hover:text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => changePage('next')}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Search Modal - Die echte, vollausgestattete Version */}
      <AISearchModal
        isOpen={showAISearchModal}
        onClose={() => setShowAISearchModal(false)}
        onAddExercise={addExercise}
      />

      {/* Video Modal */}
      {showVideoModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-screen overflow-auto border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{selectedExercise.name}</h2>
                {selectedExercise.approved && (
                  <div className="bg-orange-600/20 text-orange-500 px-2 py-0.5 rounded text-xs border border-orange-600/30">
                    Approved
                  </div>
                )}
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
                  {selectedExercise.videoUrl ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedExercise.videoUrl)}`}
                        title={selectedExercise.name}
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No video available</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mt-4">
                    <h3 className="font-medium text-sm text-gray-400 mb-2">TAGS</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.muscleGroup}
                      </span>
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.category}
                      </span>
                      <span className="bg-gray-800 text-orange-500 px-3 py-1 rounded-full text-xs border border-orange-500/20">
                        {selectedExercise.difficulty}
                      </span>
                      {selectedExercise.sports?.map(sport => (
                        <span key={sport} className="bg-purple-800/20 text-purple-400 px-3 py-1 rounded-full text-xs border border-purple-500/20">
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-2">
                    <button
                      className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                        selectedExercise.approved 
                          ? 'bg-red-900/20 text-red-500 hover:bg-red-900/30 border border-red-500/20' 
                          : 'bg-green-900/20 text-green-500 hover:bg-green-900/30 border border-green-500/20'
                      }`}
                      onClick={() => toggleApproval(selectedExercise.id)}
                    >
                      <CheckCircle size={14} />
                      {selectedExercise.approved ? 'Remove Approval' : 'Approve'}
                    </button>

                    <button
                      onClick={() => handleOpenVideo(selectedExercise)}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 border border-red-500/20"
                    >
                      <Play size={14} />
                      Watch Video
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-3 text-orange-500">Description</h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                    {selectedExercise.description}
                  </p>

                  <h3 className="font-medium text-gray-400 text-sm mt-5 mb-2">EQUIPMENT</h3>
                  <div className="bg-gray-800/50 p-3 rounded text-sm text-gray-300 border border-gray-700">
                    {selectedExercise.equipment}
                  </div>

                  {/* Discussion section */}
                  <div className="mt-8 pt-4 border-t border-gray-800">
                    <h3 className="font-medium text-lg mb-4 text-orange-500">
                      Discussion ({selectedExercise.discussions?.length || 0})
                    </h3>

                    {selectedExercise.discussions && selectedExercise.discussions.length > 0 ? (
                      <div className="space-y-4 mb-4">
                        {selectedExercise.discussions.map(discussion => (
                          <div key={discussion.id} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-500 text-xs font-bold">
                                  {discussion.user.charAt(0)}
                                </div>
                                <span className="font-medium text-white text-sm">{discussion.user}</span>
                              </div>
                              <span className="text-xs text-gray-500">{discussion.date}</span>
                            </div>
                            <p className="mt-2 text-gray-300 text-sm pl-8">{discussion.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic mb-4 text-sm">No comments yet. Be the first to start a discussion.</p>
                    )}

                    <div className="mt-4">
                      <textarea
                        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded text-white text-sm"
                        placeholder="Add your comment..."
                        rows={2}
                        id="commentBox"
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-sm"
                          onClick={() => {
                            const commentBox = document.getElementById('commentBox');
                            if (commentBox.value.trim()) {
                              addComment(selectedExercise.id, commentBox.value);
                              commentBox.value = '';
                            }
                          }}
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Form */}
      {showAddExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Add New Exercise</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddExerciseForm(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newExercise = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  muscleGroup: formData.get('muscleGroup'),
                  category: formData.get('category'),
                  equipment: formData.get('equipment'),
                  difficulty: formData.get('difficulty'),
                  videoUrl: formData.get('videoUrl'),
                  sports: formData.get('sports') ? formData.get('sports').split(',').map(s => s.trim()) : []
                };
                addExercise(newExercise);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name*</label>
                    <input type="text" name="name" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Video URL</label>
                    <input type="url" name="videoUrl" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Muscle Group*</label>
                    <select name="muscleGroup" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" required>
                      <option value="">Select...</option>
                      <option>Chest</option>
                      <option>Back</option>
                      <option>Shoulders</option>
                      <option>Arms</option>
                      <option>Legs</option>
                      <option>Core</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category*</label>
                    <select name="category" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" required>
                      <option value="">Select...</option>
                      <option>Strength</option>
                      <option>Bodyweight</option>
                      <option>Compound</option>
                      <option>Isolation</option>
                      <option>Isometric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Equipment</label>
                    <input type="text" name="equipment" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                    <select name="difficulty" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white">
                      <option value="">Select...</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description*</label>
                  <textarea name="description" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" rows={3} required></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Sports (comma separated)</label>
                  <input type="text" name="sports" placeholder="tennis, hockey, weightlifting" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddExerciseForm(false)} className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:bg-gray-800">
                    Cancel
                  </button>
                  <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
                    Save Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrometheusExerciseLibrary;