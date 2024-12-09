// File: src/components/images/AnalysisImage.jsx
import React from 'react';

export const AnalysisImage = ({ type }) => {
  const imageMap = {
    'rhythm': '/images/rhythm_analysis.png',
    'spectral': '/images/spectral_analysis.png',
    'energy': '/images/energy_analysis.png',
    'temporal': '/images/temporal_analysis.png',
    'heatmap': '/images/correlation_heatmap.png'
  };

  return (
    <img 
      src={imageMap[type]} 
      alt={`${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`}
      className="w-full h-auto"
    />
  );
};