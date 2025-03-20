// src/components/common/NavButton.jsx
import React, { useState } from 'react';

export const NavButton = ({ text, onClick, isActive, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        px-4 py-3 sm:px-6 md:px-10 md:py-7 rounded-xl border-4 border-black
        text-lg sm:text-xl md:text-2xl font-bold mb-7
        transition-colors duration-200 w-full shadow-button
        ${isActive ? 'bg-spectralify-cyan' : 'bg-spectralify-yellow'}
        ${isHovered ? 'brightness-110' : ''}
        ${isMobile ? 'mt-2' : 'md:min-w-[210px]'}
      `}
    >
      {text}
    </button>
  );
};