// src/services/spotifyService.js
export class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.spotify.com/v1';
  }

  // Helper method to refresh the token if needed
  async refreshTokenIfNeeded() {
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (expiry && parseInt(expiry) < Date.now() + 60000) { // Less than 1 minute until expiry
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      
      if (refreshToken) {
        try {
          // CLIENT_ID is hardcoded as it's public information in a client-side app
          const clientId = '4b8fd01dc4004343b120d56b36876835';
          
          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: clientId,
            }),
          });
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(`Token refresh error: ${data.error}`);
          }
          
          // Store the new tokens
          const { access_token, expires_in } = data;
          const newExpiryTime = Date.now() + (expires_in * 1000);
          
          localStorage.setItem('spotify_access_token', access_token);
          localStorage.setItem('spotify_token_expiry', newExpiryTime.toString());
          
          // If a new refresh token is provided, store it
          if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
          }
          
          // Update the access token for this instance
          this.accessToken = access_token;
          
          console.log('Token refreshed automatically by service');
          return true;
        } catch (error) {
          console.error('Error refreshing token in service:', error);
          return false;
        }
      }
    }
    return true; // Token is still valid or we couldn't refresh
  }

  // Common method to make API requests with token refresh handling
  async makeSpotifyRequest(endpoint, options = {}) {
    // Check if we need to refresh the token first
    await this.refreshTokenIfNeeded();
    
    // Set up the request with the current access token
    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        ...(options.headers || {})
      },
      ...options
    };
    
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        // Special handling for 401 Unauthorized errors
        if (response.status === 401) {
          const errorData = await response.json();
          
          // Try to refresh the token one more time
          const refreshSuccessful = await this.refreshTokenIfNeeded();
          
          if (refreshSuccessful) {
            // Retry the request with the new token
            requestOptions.headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, requestOptions);
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
            
            throw new Error(`Spotify API authentication error after refresh: ${errorData.error?.message || response.statusText}`);
          }
          
          throw new Error(`Spotify API authentication error: ${errorData.error?.message || response.statusText}`);
        }
        
        const errorData = await response.json();
        throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error making Spotify request to ${endpoint}:`, error);
      throw error;
    }
  }

  async getCurrentUserProfile() {
    return this.makeSpotifyRequest('/me');
  }

  async getTrackMetadata(trackId) {
    try {
      return await this.makeSpotifyRequest(`/tracks/${trackId}`);
    } catch (error) {
      console.error(`Error fetching track metadata for ID ${trackId}:`, error);
      // Return a minimal object to prevent breaking the UI
      return {
        id: trackId,
        name: "Track information unavailable",
        album: { images: [{ url: null }] },
        artists: [{ name: "Unknown" }],
        external_urls: { spotify: null },
        preview_url: null,
        uri: `spotify:track:${trackId}`
      };
    }
  }

  async searchTracks(query, limit = 5) {
    return this.makeSpotifyRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );
  }

  async createPlaylist(userId, name, description) {
    return this.makeSpotifyRequest(`/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: false
      })
    });
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      // Spotify API allows a maximum of 100 tracks per request
      const maxTracksPerRequest = 100;
      
      // Split trackUris into chunks of maxTracksPerRequest
      for (let i = 0; i < trackUris.length; i += maxTracksPerRequest) {
        const urisChunk = trackUris.slice(i, i + maxTracksPerRequest);
        
        await this.makeSpotifyRequest(`/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: urisChunk
          })
        });
      }
      
      return { success: true, message: "All tracks added successfully" };
    } catch (error) {
      console.error(`Error adding tracks to playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async getUserTopTracks(limit = 20, timeRange = 'medium_term') {
    // Time range options: short_term (4 weeks), medium_term (6 months), long_term (all time)
    return this.makeSpotifyRequest(
      `/me/top/tracks?limit=${limit}&time_range=${timeRange}`
    );
  }
}