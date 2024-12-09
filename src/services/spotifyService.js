// src/services/spotifyService.js
export class SpotifyService {
    constructor(accessToken) {
      this.accessToken = accessToken;
      this.baseUrl = 'https://api.spotify.com/v1';
    }
  
    async getTrackMetadata(trackId) {
      const response = await fetch(`${this.baseUrl}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return await response.json();
    }
  
    async createPlaylist(userId, name, description) {
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
      return await response.json();
    }
  
    async addTracksToPlaylist(playlistId, trackUris) {
      const response = await fetch(`${this.baseUrl}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: trackUris
        })
      });
      return await response.json();
    }
  }