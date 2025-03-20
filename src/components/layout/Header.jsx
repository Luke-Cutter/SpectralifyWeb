import React, { useState } from 'react';
import { NavButton } from '../common/NavButton';

export const Header = ({ activePage, setActivePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-spectralify-coral border-l-4 border-r-4 border-t-4 pt-8 md:pt-12 pb-0 rounded-t-xl relative border-black">
      <div className="relative text-center mb-4 md:mb-12">
        <h1 className="text-black text-5xl sm:text-6xl md:text-8xl font-bold absolute w-full" style={{ top: '7px', left: '-10px' }}>
          SPECTRALIFY
        </h1>
        <h1 className="text-white text-5xl sm:text-6xl md:text-8xl font-bold relative">
          SPECTRALIFY
        </h1>
      </div>
      
      <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold text-center px-4 mb-14 md:mb-12">
        YOUR ONE-STOP MUSIC RECOMMENDATION PLATFORM
      </h2>

      {/* Hamburger Menu Button */}
      <div className="lg:hidden flex justify-center relative"> 
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 bg-spectralify-yellow rounded-lg border-4 border-black shadow-button -translate-y-full z-20" 
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <div className={`h-1 w-full bg-black transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`h-1 w-full bg-black transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`h-1 w-full bg-black transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className={`flex flex-col mt-4 lg:flex-row justify-center px-4 lg:px-8 gap-4 lg:gap-8 max-w-6xl mx-auto ${!isMenuOpen && 'hidden lg:flex'}`}>
        {['Home', 'Build A Playlist', 'Spectralify Audio', 'Meet the Team'].map(page => (
          <NavButton
            key={page}
            text={page}
            isActive={activePage === page.toLowerCase()}
            onClick={() => {
              setActivePage(page.toLowerCase());
              setIsMenuOpen(false);
            }}
          />
        ))}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-black" />
    </header>
  );
};