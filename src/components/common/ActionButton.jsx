// File: src/components/common/ActionButton.jsx
import React from 'react';

export const ActionButton = ({ children, onClick, className = '' }) => (
  <button 
    onClick={onClick}
    className={`px-10 py-4 mt-8 bg-spectralify-coral text-white text-lg font-medium rounded-xl 
    transition-transform hover:scale-105 shadow-button border-2 border-black ${className}`}
  >
    {children}
  </button>
);