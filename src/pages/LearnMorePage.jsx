// src/pages/LearnMorePage.jsx
import React from 'react';
import { ContentBox } from '../components/common/ContentBox';


export const LearnMorePage = ({ setActivePage }) => (
  <div>
    <section className="bg-[#FFE3E3] p-4 sm:p-6 md:p-8 border-x-4 border-b-4 border-black">
      <h2 className="text-4xl font-bold mb-8 text-center">Meet the Team</h2>
      
      <ContentBox className="mb-8 border-black">
        <h3 className="text-2xl font-bold mb-4">From Frustration to Innovation</h3>
        <p className="mb-6">
          It all began in a dorm room at Champlain College in Burlington, Vermont. A music
          enthusiast and Computer Science student found himself increasingly frustrated with Spotify's
          recommendation algorithm. Despite being one of the world's leading music platforms, they
          noticed a concerning pattern: the algorithm seemed to favor already-popular tracks, creating a
          feedback loop that made it harder for lesser-known artists to reach new audiences.
        </p>
        
        <h3 className="text-2xl font-bold mb-4">Building Something Different</h3>
        <p className="mb-6">
          The team began developing what would become Spectralify Audio + Recommendation.
          They believed that by extracting more detailed musical features from each track, they could
          create recommendations based on the actual musical content rather than popularity metrics.
          Their approach focused on elements that traditional algorithms often overlooked: micro-timing
          variations, harmonic progressions, and intricate production techniques.
        </p>
        
        <h3 className="text-2xl font-bold mb-4">Join the Movement</h3>
        <p>
          We believe that music discovery should be based on musical merit, not marketing budgets.
          Whether you're a developer interested in contributing to our open-source tools, or a music
          enthusiast who shares our vision, there's a place for you in the Spectralify community.
        </p>
      </ContentBox>
    </section>

    <section className="bg-[#F9C846] p-8 border-x-4 border-black">
      <ContentBox>
        <h3 className="text-2xl font-bold mb-4 text-center">Our Incredible Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="text-center">
            <img 
              src="/SpectralifyWeb/images/NessCampagna.png"
              alt="Ness Campagna" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h4 className="font-bold">Ness Campagna</h4>
            <p className="text-gray-600">Lead Data Analyst, Wizard</p>
          </div>
          <div className="text-center">
            <img 
              src="/SpectralifyWeb/images/LukeCutter.png"
              alt="Luke Cutter" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h4 className="font-bold">Luke Cutter</h4>
            <p className="text-gray-600">Lead Creative, Cool Dude</p>
          </div>
          <div className="text-center">
            <img 
              src="/SpectralifyWeb/images/ColeHeigis.jpg"
              alt="Cole Heigis" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h4 className="font-bold">Cole Heigis</h4>
            <p className="text-gray-600">Lead Programmer, Legend</p>
          </div>
        </div>
      </ContentBox>
    </section>
  </div>
);