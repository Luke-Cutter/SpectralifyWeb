import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AudioPage } from './pages/AudioPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { LearnMorePage } from './pages/LearnMorePage';
import { GuidePage } from './pages/GuidePage';

const App = () => {
  const [activePage, setActivePage] = useState('home');

  // Add this console.log to debug
  console.log('Current active page:', activePage);

  // Add a temporary debug div
  if (!Header || !Footer) {
    return <div className="text-red-500 p-4">Components not loaded properly</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="border-x-4 border-black">
        {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
        {activePage === 'spectralify audio' && <AudioPage />}
        {activePage === 'build a playlist' && <GetStartedPage />}
        {activePage === 'meet the team' && <LearnMorePage />}
        {activePage === 'spectralify feature guide' && <GuidePage />}
      </main>
      <Footer setActivePage={setActivePage} />
    </div>
  );
};

export default App;