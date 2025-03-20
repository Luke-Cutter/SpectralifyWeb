// File: src/components/images/AnalysisImage.jsx
import React from 'react';

export const AnalysisImage = ({ type }) => {
  const imageMap = {
    'rhythm': '/SpectralifyWeb/images/rhythm_analysis.png',
    'spectral': '/SpectralifyWeb/images/spectral_analysis.png',
    'energy': '/SpectralifyWeb/images/energy_analysis.png',
    'temporal': '/SpectralifyWeb/images/temporal_analysis.png',
    'heatmap': '/SpectralifyWeb/images/correlation_heatmap.png'
  };

  return (
    <img 
      src={imageMap[type]} 
      alt={`${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`}
      className="w-full h-auto"
    />
  );
};