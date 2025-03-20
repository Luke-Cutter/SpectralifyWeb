// src/components/common/HamburgerButton.jsx
import React from 'react';

export const HamburgerButton = ({ onClick, isOpen }) => (
  <button
    onClick={onClick}
    className="md:hidden px-4 py-2 bg-spectralify-yellow rounded-lg border-4 border-black shadow-button"
  >
    <div className="w-6 h-5 flex flex-col justify-between">
      <div className={`h-1 w-full bg-black transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
      <div className={`h-1 w-full bg-black transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
      <div className={`h-1 w-full bg-black transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
    </div>
  </button>
);