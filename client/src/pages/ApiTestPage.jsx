// client/src/pages/ApiTestPage.jsx
import React, { useState } from 'react';
import OpenAIConnectionTest from '../components/utils/openaiTest';
import YouTubeApiTest from '../components/utils/youtubeApiTest';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiTestPage = () => {
  const [openaiStatus, setOpenaiStatus] = useState(null);
  const [youtubeStatus, setYoutubeStatus] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link 
            to="/admin" 
            className="text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Zurück zum Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <LayoutGrid size={24} className="text-gray-400" />
          API Verbindungstests
        </h1>
        <p className="text-gray-400 mb-8">
          Auf dieser Seite können Sie die Verbindung zu verschiedenen APIs testen,
          um sicherzustellen, dass Ihre API-Schlüssel korrekt konfiguriert sind und
          die Anwendung erfolgreich mit den Diensten kommunizieren kann.
        </p>
        
        <div className="space-y-8">
          <OpenAIConnectionTest onConnectionStatus={setOpenaiStatus} />
          <YouTubeApiTest onConnectionStatus={setYoutubeStatus} />
        </div>
        
        {/* Summary Section */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">API Status Zusammenfassung</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${openaiStatus?.success ? 'bg-green-500' : openaiStatus ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                <h3 className="text-white font-medium">OpenAI API</h3>
              </div>
              <p className="text-xs text-gray-400">
                {!openaiStatus ? 'Noch nicht getestet' : 
                 openaiStatus.success ? 'Verbindung erfolgreich' : 
                 'Verbindungsfehler'}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${youtubeStatus?.success ? 'bg-green-500' : youtubeStatus ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                <h3 className="text-white font-medium">YouTube API</h3>
              </div>
              <p className="text-xs text-gray-400">
                {!youtubeStatus ? 'Noch nicht getestet' : 
                 youtubeStatus.success ? 'Verbindung erfolgreich' : 
                 'Verbindungsfehler'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;