// src/pages/HomePage.jsx
import React from 'react';
import { ContentBox } from '../components/common/ContentBox';
import { ActionButton } from '../components/common/ActionButton';
import { AnalysisImage } from '../components/images/AnalysisImage';


export const HomePage = ({ setActivePage }) => (
  <div>
    <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
      <h2 className="text-4xl font-bold mb-8 text-center">What is Spectralify?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
        <ContentBox>
          <AnalysisImage type="temporal" />
          <p className= "content-center ml-12 ">Measure of Track Durations and Tempo Distribution</p>
        </ContentBox>
        <ContentBox>
          <AnalysisImage type="heatmap" />
          <p className= "content-center">Similarity Of Musical Features in an Album</p>
        </ContentBox>
      </div>

      <ContentBox>
        <p className="text-base text-center">
          Spectralify is an open letter to Spotify addressing music recommendation systems. Our goal is to create 
          more equitable recommendation algorithms that prioritize musical discovery over popularity metrics. While current 
          recommendation systems typically analyze only 12 components of a song, Spectralify Audio, our in-house audio 
          extraction tool, can extract more detailed metrics to enable more nuanced and informative recommendations.
        </p>
      </ContentBox>
    </section>

    <section className="bg-[#F9C846] p-8 border-x-4 border-black">
      <h2 className="text-4xl font-bold text-center mb-8">How Does It Work?</h2>
      
      <ContentBox className="mb-8 border-black">
        <p className="text-base text-center">
          Spectralify uses a sample playlist that you make, extracts the audio characteristics of all of the songs, 
          and then associates them with one another to get you the next best songs! We expand your tastes by providing 
          a bias-free recommendation that will keep your jam going!
        </p>
      </ContentBox>

      <div className="flex items-center justify-center gap-6">
        <div className="w-16 mt-8 h-0.5 bg-black" />
        <ActionButton onClick={() => setActivePage('get started')}>
          Get Started!
        </ActionButton>
        <div className="w-16 mt-8 h-0.5 bg-black" />
      </div>
    </section>
  </div>
);