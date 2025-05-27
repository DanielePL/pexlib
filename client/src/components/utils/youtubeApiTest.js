// client/src/components/utils/youtubeApiTest.js
import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, AlertCircle, Key, Search } from 'lucide-react';
import { searchYouTubeVideos } from './youtubeService';

/**
 * YouTube API Connection Tester Component
 * Tests the connection to YouTube API and verifies the API key
 */
const YouTubeApiTest = ({ onConnectionStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [apiKeyStatus, setApiKeyStatus] = useState({
    exists: false,
    valid: false,
    masked: ''
  });
  const [errorDetails, setErrorDetails] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [query, setQuery] = useState('bench press tutorial');
  const [maxResults, setMaxResults] = useState(2);

  // Check if API key exists in environment
  useEffect(() => {
    checkApiKey();
  }, []);

  // Test function that checks YouTube API key
  const checkApiKey = () => {
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      setApiKeyStatus({
        exists: false,
        valid: false,
        masked: ''
      });
      return false;
    }
    
    // Mask API key for display
    const masked = `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`;
    
    // Überprüfen Sie das Format des API-Schlüssels (Google API-Schlüssel haben typischerweise kein festes Präfix)
    const isValid = apiKey.length > 20;
    
    setApiKeyStatus({
      exists: true,
      valid: isValid,
      masked
    });
    
    return isValid;
  };

  // Test YouTube API connection
  const testConnection = async () => {
    setIsLoading(true);
    setStatus('loading');
    setErrorDetails(null);
    setTestResult(null);
    
    const hasValidKey = checkApiKey();
    
    if (!hasValidKey) {
      setStatus('error');
      setErrorDetails({
        message: 'API-Schlüssel fehlt oder hat ungültiges Format',
        hint: 'Bitte setzen Sie einen gültigen YouTube API-Schlüssel in Ihrer .env-Datei.'
      });
      setIsLoading(false);
      
      if (onConnectionStatus) {
        onConnectionStatus({
          success: false,
          error: 'API-Schlüssel fehlt oder ungültig'
        });
      }
      
      return;
    }
    
    try {
      console.log('Testing YouTube API connection...');
      const startTime = Date.now();
      
      const videos = await searchYouTubeVideos(query, maxResults);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (videos.length === 0) {
        setStatus('error');
        setErrorDetails({
          message: 'Keine Videos gefunden oder API-Anfrage fehlgeschlagen',
          hint: 'Überprüfen Sie die Konsole für weitere Details und stellen Sie sicher, dass Ihr API-Schlüssel die erforderlichen Berechtigungen hat.'
        });
        
        if (onConnectionStatus) {
          onConnectionStatus({
            success: false,
            error: 'Keine Ergebnisse'
          });
        }
      } else {
        setStatus('success');
        setTestResult({
          videos,
          responseTime,
          count: videos.length
        });
        
        if (onConnectionStatus) {
          onConnectionStatus({
            success: true,
            videoCount: videos.length,
            responseTime,
            sampleVideo: videos[0].title
          });
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      
      setStatus('error');
      setErrorDetails({
        message: error.message || 'Netzwerk- oder Verbindungsfehler',
        hint: 'Überprüfen Sie Ihre Internetverbindung oder Firewall-Einstellungen.'
      });
      
      if (onConnectionStatus) {
        onConnectionStatus({
          success: false,
          error: error.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-5 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Key size={20} className="text-red-500" />
        YouTube API Verbindungstest
      </h2>
      
      {/* API Key Status */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">API-Schlüssel Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {apiKeyStatus.exists ? (
              <>
                {apiKeyStatus.valid ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <AlertCircle size={16} className="text-yellow-500" />
                )}
                <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded">
                  {apiKeyStatus.masked || 'Not set'}
                </span>
              </>
            ) : (
              <>
                <X size={16} className="text-red-500" />
                <span className="text-sm text-red-400">API-Schlüssel nicht gefunden</span>
              </>
            )}
          </div>
          
          {!apiKeyStatus.valid && (
            <div className="text-xs text-yellow-400">
              {apiKeyStatus.exists ? 'Möglicherweise ungültig' : 'Fehlender Schlüssel'}
            </div>
          )}
        </div>
      </div>
      
      {/* Search Parameters */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Suchparameter</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="youtube-query" className="block text-xs text-gray-400 mb-1">
              Suchbegriff
            </label>
            <input
              id="youtube-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="z.B. 'bench press tutorial'"
            />
          </div>
          <div>
            <label htmlFor="youtube-results" className="block text-xs text-gray-400 mb-1">
              Max. Ergebnisse
            </label>
            <input
              id="youtube-results"
              type="number"
              min="1"
              max="10"
              value={maxResults}
              onChange={(e) => setMaxResults(Math.min(10, Math.max(1, parseInt(e.target.value || '1'))))}
              className="w-24 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Test Button */}
      <button
        onClick={testConnection}
        disabled={isLoading}
        className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
          isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Test läuft...
          </>
        ) : (
          <>
            <Search size={16} />
            YouTube API testen
          </>
        )}
      </button>
      
      {/* Test Results */}
      {status === 'success' && testResult && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check size={18} className="text-green-500" />
            <h3 className="text-green-400 font-medium">Verbindung erfolgreich</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="text-gray-400">Antwortzeit:</div>
            <div className="text-white">{testResult.responseTime}ms</div>
            
            <div className="text-gray-400">Videos gefunden:</div>
            <div className="text-white">{testResult.count}</div>
          </div>
          
          <h4 className="text-sm font-medium text-gray-300 mb-2">Gefundene Videos:</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResult.videos.map((video) => (
              <div key={video.videoId} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex gap-3">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-28 h-auto rounded"
                  />
                  <div className="flex-1">
                    <h5 className="text-white font-medium text-sm mb-1">{video.title}</h5>
                    <p className="text-gray-400 text-xs mb-2">{video.channelTitle}</p>
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">{video.description}</p>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-400 text-xs inline-flex items-center gap-1"
                    >
                      Auf YouTube ansehen
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {status === 'error' && errorDetails && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <X size={18} className="text-red-500" />
            <h3 className="text-red-400 font-medium">Verbindungsfehler</h3>
          </div>
          
          <div className="text-sm">
            <p className="text-red-300 mb-2">{errorDetails.message}</p>
            
            {errorDetails.hint && (
              <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 text-yellow-400 text-xs">
                <strong>Tipp:</strong> {errorDetails.hint}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Setup Instructions */}
      <div className="mt-4 text-xs text-gray-400">
        <p className="mb-1">
          Um die YouTube API zu verwenden, erstellen Sie eine <code>.env</code> Datei im Hauptverzeichnis mit:
        </p>
        <pre className="p-2 bg-gray-800 rounded font-mono text-green-400 mb-2">
          REACT_APP_YOUTUBE_API_KEY=IhrYouTubeApiSchlüssel
        </pre>
        <p>
          YouTube API-Schlüssel können in der <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Google Cloud Console</a> erstellt werden.
        </p>
      </div>
    </div>
  );
};

export default YouTubeApiTest;