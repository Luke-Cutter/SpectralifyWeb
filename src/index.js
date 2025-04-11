import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Determine the basename based on the environment
const getBasename = () => {
  // Check if we're on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return '/SpectralifyWeb';
  }
  // For localhost development with the same path structure
  else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/SpectralifyWeb';
  }
  // Default - no basename (root deployment)
  return '';
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);