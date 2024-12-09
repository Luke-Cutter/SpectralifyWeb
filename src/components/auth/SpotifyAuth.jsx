// src/components/auth/SpotifyAuth.jsx
import React, { useState } from 'react';
import { ContentBox } from '../common/ContentBox';
import { ActionButton } from '../common/ActionButton';

export const SpotifyAuth = ({ onAuthComplete }) => {
  const [accessToken, setAccessToken] = useState('');

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (accessToken) {
      onAuthComplete(accessToken);
    }
  };

  return (
    <ContentBox className="p-6">
      <h3 className="text-xl font-bold mb-4">Connect with Spotify</h3>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How to get your Spotify Access Token:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Spotify Developer Dashboard</a></li>
            <li>Create a new app</li>
            <li>Set the redirect URI to: <code className="bg-gray-200 px-1">http://localhost:3000/callback</code></li>
            <li>Get your access token from the dashboard</li>
          </ol>
        </div>

        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Spotify Access Token:
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-black shadow-button"
              placeholder="Paste your access token here"
              required
            />
          </div>
          <ActionButton type="submit">
            Connect to Spotify
          </ActionButton>
        </form>
      </div>
    </ContentBox>
  );
};