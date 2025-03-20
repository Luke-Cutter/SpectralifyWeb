import React from 'react';

export const Section = ({ 
  children, 
  bgColor = 'bg-spectralify-pink', 
  borderBottom = true,
  className = '' 
}) => (
  <section 
    className={`${bgColor} p-8 border-x-4 border-black ${borderBottom ? 'border-b-4' : ''} ${className}`}
  >
    {children}
  </section>
);