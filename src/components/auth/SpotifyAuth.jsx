import React, { useState, useEffect } from 'react';
import { ContentBox } from '../../components/common/ContentBox';
import { ActionButton } from '../../components/common/ActionButton';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const SpotifyAuth = ({ onAuthComplete }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState(null);

  // Your actual Client ID from the Spotify Dashboard
  const spotifyClientId = '4b8fd01dc4004343b120d56b36876835';
  
  // Use the exact redirect URIs you've registered
  const isProduction = window.location.hostname === 'luke-cutter.github.io';
  const redirectUri = isProduction 
    ? 'https://luke-cutter.github.io/SpectralifyWeb/callback'
    : 'http://localhost:3001/SpectralifyWeb/callback';

  // Check for token on component mount
  useEffect(() => {
    checkForSpotifyToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to check if we already have a token in localStorage
  const checkForSpotifyToken = () => {
    const token = localStorage.getItem('spotify_access_token');
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (token && expiry) {
      // Check if token is still valid
      if (parseInt(expiry) > Date.now()) {
        setIsAuthenticated(true);
        setTokenInfo({
          accessToken: token,
          expiresAt: new Date(parseInt(expiry)).toLocaleTimeString()
        });
        // Notify parent component
        onAuthComplete(token);
      } else {
        // Token expired, remove it
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
    }
    
    // Check if we have a token in the URL (just came back from auth)
    if (window.location.hash) {
      handleAuthCallback();
    }
  };

  // Handle the callback from Spotify auth
  const handleAuthCallback = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const error = params.get('error');
    
    if (error) {
      setError(`Authorization error: ${error}`);
      return;
    }
    
    if (!accessToken) {
      return;
    }
    
    // Store token in localStorage
    localStorage.setItem('spotify_access_token', accessToken);
    
    // Calculate and store expiry time
    const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
    localStorage.setItem('spotify_token_expiry', expiryTime.toString());
    
    // Update state
    setIsAuthenticated(true);
    setTokenInfo({
      accessToken,
      expiresAt: new Date(expiryTime).toLocaleTimeString()
    });
    
    // Clear the hash from URL for security
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Notify parent component
    onAuthComplete(accessToken);
  };

  // Start the auth flow
  const initiateSpotifyAuth = () => {
    // Define the required scopes for playlist creation
    const scopes = [
      'playlist-read-private',
      'playlist-modify-private',
      'playlist-modify-public',
      'user-read-email',
      'user-read-private'
    ];
    
    // Generate the Spotify authorization URL for implicit grant flow
    const authUrl = 'https://accounts.spotify.com/authorize' +
      '?client_id=' + spotifyClientId +
      '&response_type=token' +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      '&show_dialog=true';
    
    // Redirect to Spotify auth page (not opening in new window)
    window.location.href = authUrl;
  };

  // Log out (clear tokens)
  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    setIsAuthenticated(false);
    setTokenInfo(null);
  };

  return (
    <ContentBox className="p-6 border-x-4 border-b-4 border-black">
      <h3 className="text-xl font-bold mb-4">Connect with Spotify</h3>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700 mb-4 flex items-start">
          <AlertCircle className="mr-2 flex-shrink-0 mt-1" size={18} />
          <div>
            <p className="font-bold">Authentication Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-300 rounded text-green-700 mb-4 flex items-start">
            <CheckCircle className="mr-2 flex-shrink-0 mt-1" size={18} />
            <div>
              <p className="font-bold">Successfully Connected</p>
              <p>Your Spotify account is now connected.</p>
              {tokenInfo && (
                <p className="text-sm mt-1">Session expires at {tokenInfo.expiresAt}</p>
              )}
            </div>
          </div>
          
          <ActionButton 
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Disconnect from Spotify
          </ActionButton>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700 mb-4">
            Connect your Spotify account to create personalized playlists based on audio analysis.
          </p>
          
          <ActionButton 
            onClick={initiateSpotifyAuth}
            className="w-3/4 mx-auto flex flex-col items-center"
          >
            Authorize with Spotify
          </ActionButton>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p className="font-medium mb-1">What happens next:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>You'll be redirected to Spotify's login page</li>
              <li>Log in with your Spotify credentials</li>
              <li>Authorize this app to access your Spotify data</li>
              <li>You'll be redirected back to this app automatically</li>
            </ol>
          </div>
        </div>
      )}
    </ContentBox>
  );
};

export default SpotifyAuth;