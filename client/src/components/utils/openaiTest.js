// client/src/utils/openaiTest.js
import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, AlertCircle, Key } from 'lucide-react';

/**
 * OpenAI Connection Tester Component
 * Tests the connection to OpenAI API and verifies the API key
 */
const OpenAIConnectionTest = ({ onConnectionStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [apiKeyStatus, setApiKeyStatus] = useState({
    exists: false,
    valid: false,
    masked: ''
  });
  const [errorDetails, setErrorDetails] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Check if API key exists in environment
  useEffect(() => {
    checkApiKey();
  }, []);

  // Test function that checks OpenAI API key
  const checkApiKey = () => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
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
    
    // Aktualisierte Validierung, die auch sk-proj- Schlüssel akzeptiert
    const isValid = !apiKey.includes('*') && (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'));
    
    setApiKeyStatus({
      exists: true,
      valid: isValid,
      masked
    });
    
    return isValid;
  };

  // Test OpenAI API connection
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
        hint: 'Bitte setzen Sie einen gültigen OpenAI API-Schlüssel in Ihrer .env-Datei.'
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Testing OpenAI API connection...');
      const startTime = Date.now();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Return only the text "CONNECTION_SUCCESS" to verify API connectivity.' }
          ],
          max_tokens: 10
        })
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        
        setStatus('error');
        setErrorDetails({
          status: response.status,
          message: errorData.error?.message || 'Unbekannter API-Fehler',
          type: errorData.error?.type || 'unknown_error',
          hint: getErrorHint(response.status, errorData.error?.type)
        });
        
        if (onConnectionStatus) {
          onConnectionStatus({
            success: false,
            status: response.status,
            error: errorData.error
          });
        }
      } else {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        
        if (content.includes('CONNECTION_SUCCESS')) {
          setStatus('success');
          setTestResult({
            model: data.model,
            responseTime,
            usage: data.usage
          });
          
          if (onConnectionStatus) {
            onConnectionStatus({
              success: true,
              model: data.model,
              responseTime
            });
          }
        } else {
          setStatus('error');
          setErrorDetails({
            message: 'Unerwartete Antwort vom API-Server',
            response: content
          });
          
          if (onConnectionStatus) {
            onConnectionStatus({
              success: false,
              error: 'Unexpected response'
            });
          }
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

  // Get helpful hint based on error type
  const getErrorHint = (status, errorType) => {
    if (status === 401) {
      return 'Ihr API-Schlüssel ist ungültig oder abgelaufen. Bitte überprüfen Sie den Schlüssel in Ihrer .env-Datei.';
    } else if (status === 429) {
      return 'Rate-Limit erreicht. Bitte warten Sie einige Sekunden oder erhöhen Sie Ihr Kontingent bei OpenAI.';
    } else if (status === 500 || status === 503) {
      return 'OpenAI-Server sind derzeit überlastet oder im Wartungsmodus. Bitte versuchen Sie es später erneut.';
    } else if (errorType === 'insufficient_quota') {
      return 'Ihr OpenAI-Konto hat kein Guthaben mehr. Bitte fügen Sie Ihrem Konto Guthaben hinzu.';
    }
    return 'Überprüfen Sie die OpenAI-Dokumentation für weitere Informationen zu diesem Fehler.';
  };

  return (
    <div className="w-full p-5 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Key size={20} className="text-orange-500" />
        OpenAI API Verbindungstest
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
              {apiKeyStatus.exists ? 'Ungültiges Format' : 'Fehlender Schlüssel'}
            </div>
          )}
        </div>
      </div>
      
      {/* Test Button */}
      <button
        onClick={testConnection}
        disabled={isLoading}
        className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
          isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-700 text-white'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Test läuft...
          </>
        ) : (
          'Verbindung testen'
        )}
      </button>
      
      {/* Test Results */}
      {status === 'success' && testResult && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check size={18} className="text-green-500" />
            <h3 className="text-green-400 font-medium">Verbindung erfolgreich</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Modell:</div>
            <div className="text-white font-mono">{testResult.model}</div>
            
            <div className="text-gray-400">Antwortzeit:</div>
            <div className="text-white">{testResult.responseTime}ms</div>
            
            {testResult.usage && (
              <>
                <div className="text-gray-400">Token verwendet:</div>
                <div className="text-white">{testResult.usage.total_tokens}</div>
              </>
            )}
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
            
            {errorDetails.status && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400">Status Code:</span>
                <span className="text-white font-mono">{errorDetails.status}</span>
              </div>
            )}
            
            {errorDetails.type && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400">Fehlertyp:</span>
                <span className="text-white font-mono">{errorDetails.type}</span>
              </div>
            )}
            
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
          Um die OpenAI API zu verwenden, erstellen Sie eine <code>.env</code> Datei im Hauptverzeichnis mit:
        </p>
        <pre className="p-2 bg-gray-800 rounded font-mono text-green-400 mb-2">
          REACT_APP_OPENAI_API_KEY=sk-yourOpenAIKeyHere
        </pre>
        <p>
          API-Schlüssel können auf <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">platform.openai.com/api-keys</a> erstellt werden.
        </p>
      </div>
    </div>
  );
};

export default OpenAIConnectionTest;