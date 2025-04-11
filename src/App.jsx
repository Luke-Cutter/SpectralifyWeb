// App.js - Fixed routing configuration
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AudioPage } from './pages/AudioPage';
import { GuidePage } from './pages/GuidePage';
import { LearnMorePage } from './pages/LearnMorePage';
import { PlaylistPage } from './pages/PlaylistPage';

const App = () => {
  // Error check for component loading
  if (!Header || !Footer) {
    return <div className="text-red-500 p-4">Components not loaded properly</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Header />
      <main className="border-x-4 border-black">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/spectralify-audio" element={<AudioPage />} />
          <Route path="/build-playlist" element={<PlaylistPage />} />
          <Route path="/meet-team" element={<LearnMorePage />} />
          <Route path="/feature-guide" element={<GuidePage />} />
          {/* Handle Spotify Auth Callback */}
          <Route path="/build-playlist/" element={<PlaylistPage />} />
          <Route path="/SpectralifyWeb/build-playlist" element={<PlaylistPage />} />
          {/* Redirect to home if no route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;