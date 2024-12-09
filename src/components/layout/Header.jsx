// File: src/components/layout/Header.jsx
import React from 'react';
import { NavButton } from '../common/NavButton';

export const Header = ({ activePage, setActivePage }) => (
  <header className="bg-spectralify-coral border-l-4 border-r-4 border-t-4 pt-12 pb-0 rounded-t-xl relative border-black">
    <div className="relative text-center mb-12">
      <h1 className="text-black text-display font-bold absolute w-full" style={{ top: '7px', left: '-10px' }}>
        SPECTRALIFY
      </h1>
      <h1 className="text-white text-display font-bold relative">
        SPECTRALIFY
      </h1>
    </div>
    <h2 className="text-white text-3xl font-bold text-center mb-12">
      YOUR ONE-STOP MUSIC RECOMMENDATION PLATFORM
    </h2>
    
    <div className="flex justify-center px-8 gap-12 max-w-6xl mx-auto pl-16">
      {['Home', 'Get Started', 'Spectralify Audio', 'Learn More'].map(page => (
        <NavButton
          key={page}
          text={page}
          isActive={activePage === page.toLowerCase()}
          onClick={() => setActivePage(page.toLowerCase())}
        />
      ))}
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-black" />
  </header>
);