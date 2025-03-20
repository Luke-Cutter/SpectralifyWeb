// File: src/components/layout/Footer.jsx
import React from 'react';
import { ContentBox } from '../common/ContentBox';
import { SocialLinks } from '../social/SocialLinks';

export const Footer = ({ setActivePage }) => (
  <footer className="bg-spectralify-cyan p-4 md:p-8 rounded-b-xl border-l-8 border-r-8 border-x-4 border-t-4 border-b-8 border-black">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
      <ContentBox>
        <h3 className="font-bold text-base mb-2">Quick Links & Extras</h3>
        <div className="flex flex-col gap-1">
          {['Home', 'Build A Playlist', 'Spectralify Audio', 'Learn About Us', 'Spectralify Feature Guide'].map(link => (
            <button 
              key={link}
              onClick={() => setActivePage(link.toLowerCase())}
              className="text-sm text-left hover:underline"
            >
              {link}
            </button>
          ))}
        </div>
      </ContentBox>

      <ContentBox>
        <div className="text-center">
          <p className="text-sm mb-1">2025 Spectralify. All rights reserved.</p>
          <p className="text-sm mt-28">
            <span className="font-bold">Built with passion for equitable music discovery.</span> 
          </p>
        </div>
      </ContentBox>

      <ContentBox>
        <div className="flex flex-col h-full">
          <div>
            <h3 className="font-bold text-base mb-4">Connect With Us!</h3>
            <SocialLinks name="Ness Campagna" github="Ness2025" linkedin="nesscampagna" />
            <SocialLinks name="Luke Cutter" github="Luke-Cutter" linkedin="lukecutter" />
            <SocialLinks name="Cole Heigis" github="Cole-Heigis" linkedin="cole-heigis" />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Join our community and help shape the future of music discovery
          </p>
        </div>
      </ContentBox>
    </div>
  </footer>
);