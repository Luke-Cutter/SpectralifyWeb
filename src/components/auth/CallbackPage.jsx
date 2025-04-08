import React, { useEffect, useState } from 'react';
import { ActionButton } from '../../components/common/ActionButton';
import { Loader } from 'lucide-react';

export const CallbackPage = ({ setActivePage }) => {
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Process the authentication callback
    const processAuthCallback = () => {
      try {
        // Extract the hash from the URL (remove the leading #)
        const hash = window.location.hash.substring(1);
        
        if (!hash) {
          throw new Error('No authentication data received from Spotify.');
        }

        // Parse the parameters from the hash
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');
        const error = params.get('error');

        // Check for errors
        if (error) {
          throw new Error(`Spotify authentication error: ${error}`);
        }

        // Validate the token
        if (!accessToken) {
          throw new Error('No access token received from Spotify.');
        }

        // Store the token in localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        
        // Calculate and store expiry time
        if (expiresIn) {
          const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
          localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        }

        // Store token type
        if (tokenType) {
          localStorage.setItem('spotify_token_type', tokenType);
        }

        // Mark as successful and redirect after a delay
        setStatus('Redirecting to SpectralifyWeb...');
        setSuccess(true);
        
        // Redirect back to the main page after a short delay
        setTimeout(() => {
          // Clear the hash for security
          window.history.replaceState({}, document.title, window.location.pathname.replace('/callback', ''));
          
          // Navigate back to the playlist page
          if (setActivePage) {
            setActivePage('build a playlist');
          }
        }, 2000);
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message || 'An unknown error occurred during authentication.');
      }
    };

    processAuthCallback();
  }, [setActivePage]);

  // Handle manual navigation back to app
  const handleBackToApp = () => {
    if (setActivePage) {
      setActivePage('build a playlist');
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <p className="text-red-600 mb-8">Authentication failed: {error}</p>
          <ActionButton onClick={handleBackToApp}>
            Return to App
          </ActionButton>
        </div>
      ) : (
        <div className="text-center">
          {!success ? (
            <Loader className="animate-spin h-10 w-10 text-black mb-4 mx-auto" />
          ) : null}
          <p className="text-2xl font-medium mb-8">{status}</p>
          <ActionButton onClick={handleBackToApp}>
            Redirect Now
          </ActionButton>
        </div>
      )}
    </div>
  );
};

export default CallbackPage;