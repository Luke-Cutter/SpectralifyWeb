// src/services/spotifyService.js
export class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.spotify.com/v1';
  }

  async getTrackMetadata(trackId) {
    try {
      const response = await fetch(`${this.baseUrl}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching track metadata for ID ${trackId}:`, error);
      // Return a minimal object to prevent breaking the UI
      return {
        id: trackId,
        name: "Track information unavailable",
        album: { images: [{ url: null }] },
        artists: [{ name: "Unknown" }],
        external_urls: { spotify: null },
        preview_url: null
      };
    }
  }

  async searchTracks(query, limit = 5) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, 
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error(`Error searching tracks with query "${query}":`, error);
      throw error;
    }
  }

  async createPlaylist(userId, name, description) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          public: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error creating playlist "${name}" for user ${userId}:`, error);
      throw error;
    }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      // Spotify API allows a maximum of 100 tracks per request
      const maxTracksPerRequest = 100;
      
      // Split trackUris into chunks of maxTracksPerRequest
      for (let i = 0; i < trackUris.length; i += maxTracksPerRequest) {
        const urisChunk = trackUris.slice(i, i + maxTracksPerRequest);
        
        const response = await fetch(`${this.baseUrl}/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: urisChunk
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
        }
      }
      
      return { success: true, message: "All tracks added successfully" };
    } catch (error) {
      console.error(`Error adding tracks to playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async getUserTopTracks(limit = 20, timeRange = 'medium_term') {
    try {
      // Time range options: short_term (4 weeks), medium_term (6 months), long_term (all time)
      const response = await fetch(
        `${this.baseUrl}/me/top/tracks?limit=${limit}&time_range=${timeRange}`, 
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching user top tracks:', error);
      throw error;
    }
  }
}