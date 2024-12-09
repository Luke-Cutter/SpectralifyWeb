// File: src/components/common/NavButton.jsx
import React, { useState } from 'react';

export const NavButton = ({ text, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        px-10 py-7 rounded-t-xl text-2xl font-medium transition-colors duration-200 min-w-[210px] shadow-nav
        ${isActive ? 'bg-spectralify-cyan' : 'bg-spectralify-yellow'}
        ${isHovered ? 'brightness-110' : ''}
      `}
    >
      {text}
    </button>
  );
};