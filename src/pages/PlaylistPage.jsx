// src/pages/PlaylistPage.jsx
import React from 'react';
import { ContentBox } from '../components/common/ContentBox';
import { RecommendationDisplay } from '../components/RecommendationDisplay';

export const PlaylistPage = () => {
  return (
    <div>
      <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
        <h2 className="text-4xl font-bold mb-8 text-center">Build A Playlist</h2>

        {/* Recommendation Engine */}
        <RecommendationDisplay />
      </section>

      {/* Features Section */}
      <section className="bg-spectralify-yellow p-8 border-x-4 border-black">
        <h3 className="text-2xl font-bold mb-6 text-center">
          What We Analyze
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <ContentBox>
            <h4 className="font-bold mb-2">Rhythm Patterns</h4>
            <ul className="space-y-2 text-sm">
              <li>• Beat strength and regularity</li>
              <li>• Tempo and time signatures</li>
              <li>• Groove consistency</li>
              <li>• Rhythmic density</li>
            </ul>
          </ContentBox>
          <ContentBox>
            <h4 className="font-bold mb-2">Harmonic Content</h4>
            <ul className="space-y-2 text-sm">
              <li>• Key and tonality</li>
              <li>• Harmonic progression</li>
              <li>• Spectral contrast</li>
              <li>• Tonal energy distribution</li>
            </ul>
          </ContentBox>
          <ContentBox>
            <h4 className="font-bold mb-2">Sound Characteristics</h4>
            <ul className="space-y-2 text-sm">
              <li>• Dynamic range analysis</li>
              <li>• Energy distribution</li>
              <li>• Timbre profiles</li>
              <li>• Acoustic properties</li>
            </ul>
          </ContentBox>
        </div>
      </section>
    </div>
  );
};