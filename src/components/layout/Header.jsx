// Header.js
import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-spectralify-coral border-l-4 border-r-4 border-t-4 pt-8 md:pt-12 pb-0 rounded-t-xl relative border-black">
      <div className="text-center mb-4 md:mb-12">
        <h1 
          className="text-white text-4xl sm:text-5xl md:text-7xl font-bold tracking-widest"
          style={{ 
            textShadow: "-7px 0 0 #000"
           }}
        >
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
          className="p-2 mt-2 bg-spectralify-yellow rounded-lg border-4 border-black shadow-button -translate-y-full z-20" 
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <div className={`h-1 w-full bg-black transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`h-1 w-full bg-black transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`h-1 w-full bg-black transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className={`flex text-center flex-col mt-4 lg:flex-row justify-center px-4 lg:px-8 gap-4 lg:gap-8 max-w-6xl mx-auto ${!isMenuOpen && 'hidden lg:flex'}`}>
      <NavLink 
        to="/" 
        className={({ isActive }) => `
          px-4 py-3 sm:px-6 md:px-10 md:py-7 rounded-xl border-4 border-black
          text-lg sm:text-xl md:text-2xl font-bold mb-7
          transition-colors duration-200 w-full shadow-button
          flex items-center justify-center
          ${isActive ? 'bg-spectralify-cyan' : 'bg-spectralify-yellow'}
          hover:brightness-110
          md:min-w-[210px]
        `}
      >
        Home
      </NavLink>
        <NavLink 
          to="/build-playlist" 
          className={({ isActive }) => `
            px-4 py-3 sm:px-6 md:px-10 md:py-7 rounded-xl border-4 border-black
            text-lg sm:text-xl md:text-2xl font-bold mb-7
            transition-colors duration-200 w-full shadow-button
            ${isActive ? 'bg-spectralify-cyan' : 'bg-spectralify-yellow'}
            hover:brightness-110
            md:min-w-[210px]
          `}
        >
          Build A Playlist
        </NavLink>
        <NavLink 
          to="/spectralify-audio" 
          className={({ isActive }) => `
            px-4 py-3 sm:px-6 md:px-10 md:py-7 rounded-xl border-4 border-black
            text-lg sm:text-xl md:text-2xl font-bold mb-7
            transition-colors duration-200 w-full shadow-button
            ${isActive ? 'bg-spectralify-cyan' : 'bg-spectralify-yellow'}
            hover:brightness-110
            md:min-w-[210px]
          `}
        >
          Spectralify Audio
        </NavLink>
        <NavLink 
          to="/meet-team" 
          className={({ isActive }) => `
            px-4 py-3 sm:px-6 md:px-10 md:py-7 rounded-xl border-4 border-black
            text-lg sm:text-xl md:text-2xl font-bold mb-7
            transition-colors duration-200 w-full shadow-button
            ${isActive ? 'bg-spectralify-cyan' : 'bg-spectralify-yellow'}
            hover:brightness-110
            md:min-w-[210px]
          `}
        >
          Meet the Team
        </NavLink>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-black" />
    </header>
  );
};