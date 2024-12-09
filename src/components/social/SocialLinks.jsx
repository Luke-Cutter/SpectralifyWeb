// File: src/components/social/SocialLinks.jsx
import React from 'react';
import { Github, Linkedin } from 'lucide-react';

export const SocialLinks = ({ name, github, linkedin }) => (
  <div className="flex items-center gap-2 mb-2">
    <span>{name}:</span>
    <a 
      href={`https://github.com/${github}`}
      target="_blank" 
      rel="noopener noreferrer"
      className="hover:scale-110 transition-transform"
    >
      <Github className="w-6 h-6" />
    </a>
    <a 
      href={`https://www.linkedin.com/in/${linkedin}/`}
      target="_blank" 
      rel="noopener noreferrer"
      className="hover:scale-110 transition-transform"
    >
      <Linkedin className="w-6 h-6" />
    </a>
  </div>
);