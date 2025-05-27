// client/src/pages/OpenAITestPage.jsx
import React, { useState } from 'react';
import OpenAIConnectionTest from '../components/utils/openaiTest';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OpenAITestPage = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleConnectionStatus = (status) => {
    setConnectionStatus(status);
    console.log('OpenAI connection status:', status);
  };

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
        
        <h1 className="text-3xl font-bold text-white mb-6">OpenAI API Verbindungstest</h1>
        <p className="text-gray-400 mb-8">
          Diese Seite testet die Verbindung zwischen der Anwendung und der OpenAI API.
          Sie können damit überprüfen, ob Ihr API-Schlüssel korrekt konfiguriert ist und ob die
          Verbindung zur API hergestellt werden kann.
        </p>
        
        <OpenAIConnectionTest onConnectionStatus={handleConnectionStatus} />
        
        {connectionStatus && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Letzter Teststatus</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-sm text-gray-300 font-mono">
              {JSON.stringify(connectionStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAITestPage;
