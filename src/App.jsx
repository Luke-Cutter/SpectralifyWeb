// App.js (modified to remove duplicate Router)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AudioPage } from './pages/AudioPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { LearnMorePage } from './pages/LearnMorePage';
import { GuidePage } from './pages/GuidePage';

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
          <Route path="/build-playlist" element={<GetStartedPage />} />
          <Route path="/meet-team" element={<LearnMorePage />} />
          <Route path="/feature-guide" element={<GuidePage />} />
          {/* Redirect to home if no route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;