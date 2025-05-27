// client/src/components/utils/youtubeService.js
import { getSportKeywords } from '../../services/sportsTaxonomyService';

/**
 * Fallback-Funktion für Video-Ergebnisse wenn YouTube API nicht verfügbar ist
 *
 * @param {string} query - Suchbegriff
 * @param {number} maxResults - Maximale Anzahl der Ergebnisse
 * @returns {Array} - Array von Fallback-Video-Objekten
 */
const getFallbackVideoResults = (query, maxResults = 1) => {
  console.log(`🔄 Using fallback video results for: "${query}"`);

  // Bestimme den Übungstyp basierend auf dem Suchbegriff
  const queryLower = query.toLowerCase();
  let fallbackVideoId = 'rT7DgCr-3pg'; // Default: Bench Press

  // Kategorisiere basierend auf Suchbegriff
  if (queryLower.includes('chest') || queryLower.includes('bench') || queryLower.includes('push')) {
    fallbackVideoId = 'rT7DgCr-3pg'; // Bench Press
  } else if (queryLower.includes('back') || queryLower.includes('pull') || queryLower.includes('row')) {
    fallbackVideoId = 'eGo4IYlbE5g'; // Pull-ups
  } else if (queryLower.includes('leg') || queryLower.includes('squat') || queryLower.includes('deadlift')) {
    fallbackVideoId = 'ultWZbUMPL8'; // Squat
  } else if (queryLower.includes('shoulder') || queryLower.includes('press') || queryLower.includes('delt')) {
    fallbackVideoId = 'qEwKCR5JCog'; // Shoulder Press
  } else if (queryLower.includes('core') || queryLower.includes('abs') || queryLower.includes('plank')) {
    fallbackVideoId = 'ASdvN_XEl_c'; // Plank
  } else if (queryLower.includes('tennis')) {
    fallbackVideoId = 'QE_39RT1t3E'; // Tennis specific movements
  } else if (queryLower.includes('hockey') || queryLower.includes('skating')) {
    fallbackVideoId = 'ultWZbUMPL8'; // Hockey related exercises
  }

  // Erstelle Fallback-Ergebnis
  const fallbackResults = [{
    videoId: fallbackVideoId,
    title: `${query} - Exercise Tutorial`,
    description: `Exercise tutorial for ${query}. This is a fallback video when YouTube API is not available.`,
    thumbnail: `https://img.youtube.com/vi/${fallbackVideoId}/mqdefault.jpg`,
    channelTitle: 'Exercise Tutorial Channel',
    publishedAt: new Date().toISOString(),
    url: `https://www.youtube.com/watch?v=${fallbackVideoId}`,
    isFallback: true
  }];

  return fallbackResults.slice(0, maxResults);
};

/**
 * Sucht YouTube-Videos basierend auf einem Suchbegriff
 *
 * @param {string} query - Der Suchbegriff
 * @param {number} maxResults - Maximale Anzahl der Ergebnisse (Standard: 1)
 * @returns {Promise<Array>} - Ein Array von Video-Objekten oder leeres Array bei Fehler
 */
export const searchYouTubeVideos = async (query, maxResults = 1) => {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API key not found. Using fallback approach.');
    return getFallbackVideoResults(query, maxResults);
  }

  try {
    console.log(`🔍 Suche YouTube-Videos für: "${query}"`);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&videoEmbeddable=true&key=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Fehler:', errorData);

      // Fallback bei API-Fehlern
      return getFallbackVideoResults(query, maxResults);
    }

    const data = await response.json();

    // Prüfen, ob wir Ergebnisse haben
    if (!data.items || data.items.length === 0) {
      console.warn('Keine YouTube-Videos gefunden für:', query);
      return getFallbackVideoResults(query, maxResults);
    }

    console.log(`✅ ${data.items.length} YouTube-Videos gefunden für: "${query}"`);

    // Formatiere die Ergebnisse in ein einfacheres Format
    return data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('YouTube API search error:', error);
    return getFallbackVideoResults(query, maxResults);
  }
};

/**
 * Sucht nach YouTube-Videos für eine bestimmte Übung
 *
 * @param {string|object} exercise - Name der Übung oder Übungsobjekt
 * @param {string} difficulty - Schwierigkeitsgrad (optional)
 * @param {string} equipment - Benötigte Ausrüstung (optional)
 * @returns {Promise<string|null>} - URL des besten passenden Videos oder null bei Fehler
 */
export const searchExerciseVideo = async (exercise, difficulty = '', equipment = '') => {
  try {
    // Behandelt den Fall, dass exercise ein String oder ein Objekt sein kann
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;

    if (!exerciseName) {
      console.error('No exercise name provided');
      return null;
    }

    // Baue einen optimierten Suchbegriff
    let searchQuery = `${exerciseName} exercise tutorial proper form`;

    // Wenn exercise ein Objekt ist, nutze dessen Eigenschaften
    if (typeof exercise === 'object') {
      if (exercise.difficulty) {
        searchQuery += ` ${exercise.difficulty} level`;
      }

      if (exercise.equipment && !['None', 'none', 'bodyweight'].includes(exercise.equipment.toLowerCase())) {
        searchQuery += ` with ${exercise.equipment}`;
      }
    } else {
      // Füge weitere relevante Suchbegriffe hinzu, wenn verfügbar
      if (difficulty) {
        searchQuery += ` ${difficulty} level`;
      }

      if (equipment && !['None', 'none', 'bodyweight'].includes(equipment.toLowerCase())) {
        searchQuery += ` with ${equipment}`;
      }
    }

    console.log(`🎥 Searching for exercise video: "${searchQuery}"`);

    const videos = await searchYouTubeVideos(searchQuery, 1);

    if (videos && videos.length > 0) {
      console.log(`✅ Found video for ${exerciseName}: ${videos[0].url}`);
      return videos[0].url;
    }

    // Keine Videos gefunden
    console.warn(`❌ No videos found for ${exerciseName}`);
    return null;
  } catch (error) {
    console.error('Error searching for exercise video:', error);
    return null;
  }
};

/**
 * Erweiterte Funktion zur Suche nach Übungsvideos mit Sportkontext
 *
 * @param {object} exercise - Das Übungsobjekt
 * @param {string} sportId - ID der Sportart
 * @returns {Promise<string|null>} - URL des besten passenden Videos oder null bei Fehler
 */
export const searchExerciseVideoForSport = async (exercise, sportId) => {
  try {
    if (!exercise || !exercise.name) {
      console.error('Invalid exercise object provided');
      return null;
    }

    let searchQuery = `${exercise.name} exercise technique`;

    // Wenn eine bestimmte Sportart angegeben ist
    if (sportId) {
      try {
        // Hole sportspezifische Suchbegriffe
        const sportKeywords = getSportKeywords(sportId);
        if (sportKeywords && sportKeywords.length > 0) {
          // Füge bis zu 2 relevante Schlüsselwörter hinzu
          const relevantKeywords = sportKeywords
            .filter(keyword => typeof keyword === 'string')
            .slice(0, 2);

          if (relevantKeywords.length > 0) {
            searchQuery = `${exercise.name} exercise for ${sportId} ${relevantKeywords.join(' ')}`;
          }
        }
      } catch (error) {
        console.warn('Error getting sport keywords:', error);
        // Fallback zu einfacher Sportart-Integration
        searchQuery = `${exercise.name} exercise for ${sportId}`;
      }
    }

    // Füge Muskelgruppe für bessere Spezifität hinzu
    if (exercise.muscleGroup) {
      searchQuery += ` ${exercise.muscleGroup}`;
    }

    console.log(`🏃 Searching sport-specific video: "${searchQuery}"`);

    // Verwende die bestehende searchExerciseVideo Funktion
    return await searchExerciseVideo(searchQuery);
  } catch (error) {
    console.error('Error searching YouTube for sport-specific videos:', error);
    return null;
  }
};

/**
 * Hilfsfunktion um YouTube Video ID aus verschiedenen URL-Formaten zu extrahieren
 *
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID oder null
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Generiert YouTube-Thumbnail-URL basierend auf Video-URL
 *
 * @param {string} url - YouTube Video URL
 * @param {string} quality - Thumbnail-Qualität ('default', 'mqdefault', 'hqdefault', 'maxresdefault')
 * @returns {string} - Thumbnail URL
 */
export const getYouTubeThumbnailUrl = (url, quality = 'mqdefault') => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return '/api/placeholder/400/300'; // Fallback placeholder
  }

  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Validiert ob eine URL eine gültige YouTube-URL ist
 *
 * @param {string} url - URL zum Validieren
 * @returns {boolean} - True wenn gültige YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url) && extractYouTubeVideoId(url) !== null;
};

/**
 * Erstellt eine Embed-URL für YouTube-Videos
 *
 * @param {string} url - YouTube Video URL
 * @param {object} options - Embed-Optionen (autoplay, start, end, etc.)
 * @returns {string|null} - Embed URL oder null bei ungültiger URL
 */
export const createYouTubeEmbedUrl = (url, options = {}) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  let embedUrl = `https://www.youtube.com/embed/${videoId}`;

  // Füge URL-Parameter hinzu wenn Optionen gegeben sind
  const params = new URLSearchParams();

  if (options.autoplay) params.append('autoplay', '1');
  if (options.start) params.append('start', options.start.toString());
  if (options.end) params.append('end', options.end.toString());
  if (options.loop) params.append('loop', '1');
  if (options.mute) params.append('mute', '1');
  if (options.controls === false) params.append('controls', '0');

  const paramString = params.toString();
  if (paramString) {
    embedUrl += `?${paramString}`;
  }

  return embedUrl;
};