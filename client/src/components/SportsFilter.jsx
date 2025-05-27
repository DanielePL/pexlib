// client/src/components/SportsFilter.jsx
import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { getAllSports } from '../services/sportsTaxonomyService';

const SportsFilter = ({ onSportSelect, selectedSport }) => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSports = () => {
      try {
        setLoading(true);
        // Verwende die lokale Taxonomie-Service
        const sportsData = getAllSports();
        setSports(sportsData);
      } catch (error) {
        console.error('Error loading sports taxonomy:', error);
        // Fallback zu minimaler Liste
        setSports([
          { id: 'tennis', name: 'Tennis' },
          { id: 'hockey', name: 'Eishockey' },
          { id: 'weightlifting', name: 'Gewichtheben' },
          { id: 'running', name: 'Laufen' },
          { id: 'soccer', name: 'Fußball' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadSports();
  }, []);

  const handleSportClick = (sportId) => {
    // Toggle Sport-Auswahl
    const newSelection = selectedSport === sportId ? null : sportId;
    onSportSelect(newSelection);
  };

  if (loading) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-orange-500 mb-2 flex items-center gap-2">
          <Filter size={16} />
          Sport Filter
        </h3>
        <div className="text-gray-500 text-sm">Loading sports...</div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-orange-500 mb-2 flex items-center gap-2">
        <Filter size={16} />
        Sport Filter
      </h3>

      <div className="flex flex-wrap gap-2">
        {sports.map(sport => (
          <button
            key={sport.id}
            onClick={() => handleSportClick(sport.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors border ${
              selectedSport === sport.id
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700 hover:border-gray-600'
            }`}
          >
            {sport.name}
          </button>
        ))}
      </div>

      {selectedSport && (
        <div className="mt-2">
          <button
            onClick={() => handleSportClick(selectedSport)}
            className="text-xs text-gray-400 hover:text-orange-500 underline"
          >
            Clear sport filter
          </button>
        </div>
      )}
    </div>
  );
};

export default SportsFilter;