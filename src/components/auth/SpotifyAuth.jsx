// src/components/auth/SpotifyAuth.jsx
import React, { useState, useEffect } from 'react';
import { ContentBox } from '../common/ContentBox';
import { ActionButton } from '../common/ActionButton';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const SpotifyAuth = ({ onAuthComplete, onDisconnect }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Client ID from the Spotify Dashboard
  const spotifyClientId = '4b8fd01dc4004343b120d56b36876835';
  
  // Redirect URIs based on environment
  const isProduction = window.location.hostname.includes('github.io');
  const redirectUri = isProduction 
    ? `https://luke-cutter.github.io/SpectralifyWeb/build-playlist`
    : `http://localhost:3000/SpectralifyWeb/build-playlist`;

  useEffect(() => {
    // Check if we're in an OAuth callback
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');
      
      // Clean URL by removing query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (code) {
        // Verify state parameter to prevent CSRF attacks
        const storedState = localStorage.getItem('spotify_auth_state');
        if (state && storedState && state !== storedState) {
          setError('Security error: State mismatch. Please try again.');
          localStorage.removeItem('spotify_auth_state');
          checkForCachedToken();
          return;
        }
        
        // Exchange code for access token
        exchangeCodeForToken(code);
      } else if (error) {
        setError(`Authorization error: ${error}`);
        checkForCachedToken();
      } else {
        // No code or error in URL, check for cached token
        checkForCachedToken();
      }
    };
    
    handleCallback();
    
    // Set up periodic token refresh
    const refreshInterval = setInterval(() => {
      if (isAuthenticated) {
        checkTokenRefresh();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(refreshInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate a random string for the code verifier
  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values).map(x => possible[x % possible.length]).join('');
  };

  // Generate a code challenge from the code verifier
  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  // Function to check if token needs refreshing
  const checkTokenRefresh = async () => {
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (expiry && parseInt(expiry) < Date.now() + 300000) { // 5 minutes before expiry
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      
      if (refreshToken) {
        refreshAccessToken(refreshToken);
      }
    }
  };

  // Function to check for cached token
  const checkForCachedToken = () => {
    const accessToken = localStorage.getItem('spotify_access_token');
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (accessToken && expiry) {
      const expiryTime = parseInt(expiry);
      
      if (expiryTime > Date.now()) {
        setIsAuthenticated(true);
        setTokenInfo({
          accessToken: accessToken,
          expiresAt: new Date(expiryTime).toLocaleTimeString()
        });
        
        // Notify parent component
        onAuthComplete(accessToken);
      } else {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (refreshToken) {
          refreshAccessToken(refreshToken);
        } else {
          // Clear expired token if we can't refresh
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_token_expiry');
        }
      }
    }
  };

  // Exchange authorization code for token
  const exchangeCodeForToken = async (code) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('Starting token exchange process');
      
      const codeVerifier = localStorage.getItem('spotify_code_verifier');
      
      if (!codeVerifier) {
        console.error('Code verifier not found in localStorage');
        throw new Error('Code verifier not found');
      }
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: spotifyClientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });
      
      console.log('Token response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange error:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`Token exchange failed: ${errorJson.error || 'Unknown error'}`);
        } catch (jsonError) {
          throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Token exchange error: ${data.error}`);
      }
      
      // Store tokens in localStorage
      const { access_token, refresh_token, expires_in } = data;
      const expiryTime = Date.now() + (expires_in * 1000);
      
      localStorage.setItem('spotify_access_token', access_token);
      localStorage.setItem('spotify_refresh_token', refresh_token);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      
      // Clean up code verifier
      localStorage.removeItem('spotify_code_verifier');
      localStorage.removeItem('spotify_auth_state');
      
      // Update state
      setIsAuthenticated(true);
      setTokenInfo({
        accessToken: access_token,
        expiresAt: new Date(expiryTime).toLocaleTimeString()
      });
      
      // Notify parent component
      onAuthComplete(access_token);
    } catch (err) {
      console.error('Error exchanging code for token:', err);
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Refresh access token - add this function to your SpotifyAuth component
  const refreshAccessToken = async (refreshToken) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: spotifyClientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Token refresh error: ${data.error}`);
      }
      
      // Store the new token and expiry
      const { access_token, expires_in } = data;
      const expiryTime = Date.now() + (expires_in * 1000);
      
      localStorage.setItem('spotify_access_token', access_token);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      
      // Store new refresh token if provided
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }
      
      // Update state
      setIsAuthenticated(true);
      setTokenInfo({
        accessToken: access_token,
        expiresAt: new Date(expiryTime).toLocaleTimeString()
      });
      
      // Notify parent component
      onAuthComplete(access_token);
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError(`Token refresh failed: ${err.message}`);
      
      // If refresh fails, need to re-authenticate
      setIsAuthenticated(false);
      
      // Clear stored tokens
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expiry');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start the authentication flow
  const initiateSpotifyAuth = async () => {
    try {
      setError(null);
      
      // Generate and store a code verifier
      const codeVerifier = generateRandomString(64);
      localStorage.setItem('spotify_code_verifier', codeVerifier);
      
      // Generate and store state for CSRF protection
      const state = generateRandomString(16);
      localStorage.setItem('spotify_auth_state', state);
      
      // Generate code challenge
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Define the required scopes
      const scopes = [
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-private',
        'playlist-modify-public',
        'user-read-email',
        'user-read-private',
        'user-top-read'
      ];
      
      // Build the authorization URL
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      
      const params = {
        client_id: spotifyClientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        state: state,
        scope: scopes.join(' ')
      };
      
      authUrl.search = new URLSearchParams(params).toString();
      
      // Redirect to Spotify auth page
      window.location.href = authUrl.toString();
    } catch (err) {
      console.error('Error initiating auth flow:', err);
      setError(`Failed to start authentication: ${err.message}`);
    }
  };

  // Log out
  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_auth_state');
    
    setIsAuthenticated(false);
    setTokenInfo(null);
    setError(null);
    if (onDisconnect) {
      onDisconnect();
    }
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
      
      {isProcessing ? (
        <div className="p-4 bg-blue-100 border border-blue-300 rounded text-blue-700 mb-4">
          <p className="font-medium">Processing your authentication...</p>
          <p className="text-sm">Please wait while we connect to Spotify.</p>
        </div>
      ) : isAuthenticated ? (
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
            className="w-3/4 bg-red-500 hover:bg-red-600 mx-auto flex items-center justify-center text-center"
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
            disabled={isProcessing}
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