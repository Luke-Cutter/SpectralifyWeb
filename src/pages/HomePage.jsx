// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentBox } from '../components/common/ContentBox';
import { ActionButton } from '../components/common/ActionButton';

export const HomePage = ({ setActivePage }) => (
  <div>
    <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
      <h2 className="text-4xl font-bold mb-8 text-center">What is Spectralify?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
        <ContentBox>
          <img className="w-full h-auto" alt="Emotional Landscape of 5 Sample Playlists" src="/SpectralifyWeb/images/EmotionalLandscape.png"></img>
          <p className= "text-center mt-5 font-bold">Emotional Landscape of 5 Sample Playlists</p>
        </ContentBox>
        <ContentBox>
          <img className="w-full h-auto" alt="Instrument Presence In 5 Sample Playlists" src="/SpectralifyWeb/images/InstrumentPresence.png"></img>
          <p className= "text-center font-bold">Instrument Presence In 5 Sample Playlists</p>
        </ContentBox>
      </div>

      <ContentBox>
        <p className="text-base text-center">
          Spectralify is an open letter to Spotify addressing music recommendation systems. We aim to create 
          more equitable recommendation algorithms that prioritize musical discovery over popularity metrics. While current 
          recommendation systems typically analyze only 12 components of a song, Spectralify Audio, our in-house audio 
          extraction tool, extracts 142 detailed metrics from 13 vital metadata & music theory categories to enable more nuanced and informative recommendations.
        </p>
      </ContentBox>
    </section>

    <section className="bg-[#F9C846] p-8 border-x-4 border-black">
      <h2 className="text-4xl font-bold text-center mb-8">How Does It Work?</h2>
      
      <ContentBox className="mb-8 border-black">
        <p className="text-base text-center">
          Spectralify uses a seed song of your choice. With the extracted audio characteristics from our 100,000-song dataset, we associate them with one another to make the perfect Spotify playlist. 
          We expand your tastes by providing a bias-free recommendation to keep your jam going!
        </p>
      </ContentBox>

      <div className="flex items-center justify-center gap-6">
        <div className="w-16 mt-8 h-0.5 bg-black" />
        <Link to="/build-playlist">
          <ActionButton 
            onClick={() => {
              // Scroll to the top of the page smoothly
              window.scrollTo({
                top: 150,
                behavior: 'smooth'
              });
            }}
          >
            Build a Playlist!
          </ActionButton>
        </Link>
        <div className="w-16 mt-8 h-0.5 bg-black" />
      </div>
    </section>
  </div>
);