import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AudioPage } from './pages/AudioPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { LearnMorePage } from './pages/LearnMorePage';
import { GuidePage } from './pages/GuidePage';

const App = () => {
  const [activePage, setActivePage] = useState('home');

  // Check for callback URLs on load
  useEffect(() => {
    // If the URL contains 'callback', show the callback page
    if (window.location.pathname.includes('/callback')) {
      setActivePage('spotify-callback');
    }
  }, []);

  // Add this console.log to debug
  console.log('Current active page:', activePage);

  // Add a temporary debug div
  if (!Header || !Footer) {
    return <div className="text-red-500 p-4">Components not loaded properly</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {activePage !== 'spotify-callback' && (
        <Header activePage={activePage} setActivePage={setActivePage} />
      )}
      <main className="border-x-4 border-black">
        {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
        {activePage === 'spectralify audio' && <AudioPage />}
        {activePage === 'build a playlist' && <GetStartedPage />}
        {activePage === 'meet the team' && <LearnMorePage />}
        {activePage === 'spectralify feature guide' && <GuidePage />}
      </main>
    </div>
  );
};

export default App;