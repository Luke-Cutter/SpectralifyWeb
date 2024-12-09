// File: src/components/common/ContentBox.jsx
import React from 'react';

export const ContentBox = ({ children, className = '' }) => (
  <div 
    className={`bg-white rounded-content p-6 shadow-content border-2 border-black ${className}`}
  >
    {children}
  </div>
);
