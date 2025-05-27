// client/src/components/AdminDashboard.jsx - Fixed ohne eigenen Header
import React from 'react';
import PrometheusExerciseLibrary from './ExerciseLibrary';

function AdminDashboard({ userAvatar, onOpenAvatarModal, onRefreshAvatar }) {

  return (
    <div className="min-h-screen bg-black text-white">
      {/* KEIN HEADER MEHR HIER - Das macht jetzt Navbar.jsx */}

      {/* Exercise Library - Full height da kein eigener Header */}
      <div className="h-screen">
        <PrometheusExerciseLibrary />
      </div>
    </div>
  );
}

export default AdminDashboard;