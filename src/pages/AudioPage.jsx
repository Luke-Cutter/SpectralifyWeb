// src/pages/AudioPage.jsx
import React from 'react';
import { ContentBox } from '../components/common/ContentBox';
import { ActionButton } from '../components/common/ActionButton';


export const AudioPage = ({ setActivePage }) => (
  <div>
    <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
      <h2 className="text-4xl font-bold mb-8 text-center">Spectralify Audio - Our Backbone</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
        <ContentBox>
          <img className="w-full h-auto" alt="Rhythm Analysis Graph" src="/SpectralifyWeb/images/rhythm_analysis.png"></img>
          <p className= "text-center font-bold">Tempo, Beat Characteristics, & Groove Analysis Distribution</p>
        </ContentBox>
        <ContentBox>
          <img className="w-full h-auto" alt="Spectral Energy Graph" src="/SpectralifyWeb/images/spectral_analysis.png"></img>
          <p className= "text-center font-bold">RMS Energy and Spectral Centroid Distribution</p>
        </ContentBox>
        <ContentBox>
          <img className="w-full h-auto" alt="Harmonic vs Percussive Energy Graph" src="/SpectralifyWeb/images/energy_analysis.png"></img>
          <p className= "text-center mt-10 font-bold">Harmonic vs Percussive Energy Distribution</p>
        </ContentBox>
      </div>

      <ContentBox className="mb-8 border-black">
        <p className="text-base text-center mb-6">
          Spectralify Audio is an advanced audio analysis toolkit designed to deepen the
          understanding of musical composition and enhance recommendation systems. While
          traditional music recommendation engines typically analyze just 12 basic audio features,
          our tool extracts 142 distinct musical characteristics through deep signal processing.
        </p>
        
        <div className="text-center grid grid-cols-2 gap-4">
          <ul className="space-y-2">
            <li>• Harmonic progression tracking</li>
            <li>• Multi-layered timbre analysis</li>
            <li>• Rhythmic pattern recognition</li>
            <li>• Structural segmentation</li>
          </ul>
          <ul className="space-y-2">
            <li>• Micro-timing variations</li>
            <li>• Dynamic range profiling</li>
            <li>• Instrumental separation analysis</li>
            <li>• Pitch & Tonality</li>
          </ul>
        </div>
      </ContentBox>

      <div className="text-center">
        <ActionButton 
          onClick={() => window.open('https://github.com/Luke-Cutter/Spectralify', '_blank')}
        >
          Try it Out!
        </ActionButton>
      </div>
    </section>
  </div>
);