// src/components/RecommendationDisplay.jsx
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { ContentBox } from './common/ContentBox';
import { ActionButton } from './common/ActionButton';
import { InputField } from './form/InputField';
import { SelectField } from './form/SelectField';
import { SpotifyAuth } from './auth/SpotifyAuth';
import { CSVUpload } from './upload/CSVUpload';
import { SpotifyService } from '../services/spotifyService';
import { 
  generateEnhancedRecommendations,
  findNearestSongs,
  getSimpleSimilarSongs
} from '../utils/enhancedRecommendationEngine';
import { Music, CheckCircle, Circle, Disc, Save, Loader, Search, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex mb-2">
          <div className="mr-4 flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full">
              {index < currentStep ? (
                <CheckCircle className="w-10 h-10 text-blue-500" />
              ) : index === currentStep ? (
                <Circle className="w-10 h-10 text-blue-500" strokeWidth={2} />
              ) : (
                <Circle className="w-10 h-10 text-gray-300" strokeWidth={2} />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="w-1 h-12 bg-gray-300 mt-1 mb-1">
                {index < currentStep && <div className="w-1 h-full bg-blue-500"></div>}
              </div>
            )}
          </div>
          <div className="pt-1">
            <h3 className={`text-xl font-bold ${index <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
              STEP {index + 1}
            </h3>
            <p className={`${index <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const RecommendationDisplay = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seedSong, setSeedSong] = useState('');
  const [playlistName, setPlaylistName] = useState('My Spectralify Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('Created with Spectralify audio analysis');
  const [selectedFeatureGroups, setSelectedFeatureGroups] = useState(['basic', 'rhythm', 'energy']);
  const [recommendations, setRecommendations] = useState([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistLength, setPlaylistLength] = useState(15);
  const [songDataMap, setSongDataMap] = useState({});
  const [allSongs, setAllSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [view, setView] = useState('fileUpload'); // 'fileUpload', 'songSelector', 'recommendations', 'playlistCreator'
  const [blendFactor, setBlendFactor] = useState(0.5); // 0 = only direct features, 1 = only ordered data
  const fileInputRef = useRef(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [artistPriority, setArtistPriority] = useState(true);
  const [artistBoost, setArtistBoost] = useState(0.15);
  const [maxSameArtist, setMaxSameArtist] = useState(3);
  
  const steps = [
    { description: 'Authenticate with Spotify to access your account' },
    { description: 'Upload your audio analysis CSV file' },
    { description: 'Select a seed song and customize your playlist' }
  ];
  
  const getCurrentStep = () => {
    if (!isAuthenticated) return 0;
    if (!csvData || view === 'fileUpload') return 1;
    return 2;
  };

  const featureGroups = [
    { value: 'basic', label: 'Basic Features' },
    { value: 'rhythm', label: 'Rhythm Patterns' },
    { value: 'pitch', label: 'Pitch Analysis' },
    { value: 'spectral', label: 'Spectral Features' },
    { value: 'energy', label: 'Energy Distribution' },
    { value: 'harmonic', label: 'Harmonic Content' },
    { value: 'structure', label: 'Song Structure' }
  ];

  const playlistLengthOptions = [
    { value: 5, label: '5 songs' },
    { value: 10, label: '10 songs' },
    { value: 15, label: '15 songs' },
    { value: 25, label: '25 songs' },
    { value: 50, label: '50 songs' },
    { value: 75, label: '75 songs' },
    { value: 100, label: '100 songs' }
  ];

  useEffect(() => {
    // Check for an access token in localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);
      fetchUserProfile(storedToken);
    }
  }, []);

  const [searchInput, setSearchInput] = useState('');


  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      setUserId(data.id);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile. Please reconnect to Spotify.');
      setIsAuthenticated(false);
      localStorage.removeItem('spotify_access_token');
    }
  };

  const handleAuthComplete = (token) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    localStorage.setItem('spotify_access_token', token);
    fetchUserProfile(token);
  };

  const handleDataProcessed = (data) => {
    // Create a map of song ID/track_id to full song data
    const songMap = {};
    const songs = [];
    
    data.forEach(row => {
      if (row.track_id || row.id) {
        const id = row.track_id || row.id;
        const songData = {
          id: id,
          Title: row.Title || '',
          Artist: row.Artist || '',
          Album: row.Album || '',
          ...row
        };
        
        songMap[id] = songData;
        songs.push(songData);
      }
    });
    
    setAllSongs(songs);
    setSongDataMap(songMap);
    setCsvData(data);
    setView('songSelector');
  };

  const handleSeedSongSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Search by title or artist in the local dataset with proper type checking
    const results = allSongs.filter(song => 
      (song.Title && typeof song.Title === 'string' && song.Title.toLowerCase().includes(query.toLowerCase())) ||
      (song.Artist && typeof song.Artist === 'string' && song.Artist.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
    
    setSearchResults(results);
  };

  const selectSeedSong = (song) => {
    setSeedSong(song.id);
    setSearchInput('');
    setSearchResults([]);
  };

  const handleFeatureGroupChange = (e) => {
    const value = e.target.value;
    setSelectedFeatureGroups(prev => {
      if (prev.includes(value)) {
        return prev.filter(group => group !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handlePlaylistLengthChange = (e) => {
    setPlaylistLength(Number(e.target.value));
  };

  const handleBlendFactorChange = (e) => {
    setBlendFactor(Number(e.target.value));
  };

  const handleCreatePlaylist = async () => {
    if (!isAuthenticated || !recommendations.length) {
      setError('Please authenticate with Spotify and generate recommendations first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const spotifyService = new SpotifyService(accessToken);
      
      // Create a new playlist
      const playlist = await spotifyService.createPlaylist(
        userId,
        playlistName,
        playlistDescription
      );
      
      // Get track URIs from recommendations
      const trackUris = recommendations
        .filter(track => track.spotifyUri)
        .map(track => track.spotifyUri);
      
      if (trackUris.length === 0) {
        throw new Error('No valid Spotify track URIs found');
      }
      
      // Add tracks to the playlist
      await spotifyService.addTracksToPlaylist(playlist.id, trackUris);
      
      setPlaylistCreated(true);
      setView('playlistCreator');
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError(`Failed to create playlist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!seedSong || !csvData) {
      setError('Please select a seed song and upload a CSV file');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const spotifyService = new SpotifyService(accessToken);
      
      // Create a mapping of feature names to ordered song IDs for the recommendation engine
      const orderedData = {};
      
      // For each feature in the dataset, create a sorted array of song IDs
      const features = Object.keys(csvData[0]).filter(key => 
        !['id', 'track_id', 'Title', 'Artist', 'Album'].includes(key) && 
        typeof csvData[0][key] === 'number'
      );
      
      features.forEach(feature => {
        const validSongs = csvData.filter(song => 
          (song.track_id || song.id) && 
          song[feature] !== undefined && 
          song[feature] !== null && 
          !isNaN(song[feature])
        );
        
        const sortedSongs = _.sortBy(validSongs, song => song[feature]);
        orderedData[feature] = sortedSongs.map(song => song.track_id || song.id);
      });
      
      // Get recommendations based on seed song
      const selectedSongData = songDataMap[seedSong];
      if (!selectedSongData) {
        throw new Error('Selected seed song not found in dataset');
      }
      
      // Use enhanced recommendation engine
      let recommendationList = [];
      try {
        console.log("Generating enhanced recommendations...");
        
        recommendationList = generateEnhancedRecommendations(
          allSongs,
          selectedSongData,
          orderedData,
          {
            numRecommendations: playlistLength,
            useFeatureGroups: true,
            featureGroups: selectedFeatureGroups,
            blend: blendFactor,
            artistPriority: artistPriority,
            artistBoost: artistBoost,
            maxSameArtist: maxSameArtist
          }
        );
        
        console.log("Enhanced recommendations generated:", recommendationList.length);
      } catch (error) {
        console.warn('Using fallback recommendation algorithm:', error);
        
        // Fallback to simple recommendations
        recommendationList = findNearestSongs(
          orderedData,
          seedSong,
          Math.min(200, csvData.length),
          selectedFeatureGroups
        )
        .map(([id, score]) => ({
          ...songDataMap[id],
          similarityScore: score / 100
        }))
        .slice(0, playlistLength);
        
        if (recommendationList.length === 0) {
          // Second fallback
          recommendationList = getSimpleSimilarSongs(
            allSongs, 
            selectedSongData,
            selectedFeatureGroups,
            playlistLength
          );
        }
      }
      
      // Ensure we have recommendations
      if (!recommendationList || recommendationList.length === 0) {
        throw new Error('No recommendations could be generated');
      }
      
      // Fetch additional metadata from Spotify API for each recommendation
      const enhancedRecommendations = await Promise.all(
        recommendationList.map(async (song) => {
          try {
            const trackInfo = await spotifyService.getTrackMetadata(song.id);
            return {
              ...song,
              albumArt: trackInfo.album?.images[0]?.url,
              spotifyUri: trackInfo.uri,
              previewUrl: trackInfo.preview_url,
              externalUrl: trackInfo.external_urls?.spotify
            };
          } catch (error) {
            console.error(`Failed to get metadata for track ${song.id}:`, error);
            return song;
          }
        })
      );
      
      setRecommendations(enhancedRecommendations);
      setView('recommendations');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError(`Failed to generate recommendations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setRecommendations([]);
    setSeedSong('');
    setPlaylistCreated(false);
    setError(null);
    setView('songSelector');
  };
  
  const startOver = () => {
    resetProcess();
    setCsvData(null);
    setAllSongs([]);
    setSongDataMap({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setView('fileUpload');
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  return (
    <div className="space-y-6">
      <ContentBox className="p-6 border-x-4 border-b-4 border-black">
        <h3 className="text-2xl font-bold mb-4">Steps to build Your Perfect Playlist</h3>
        <StepIndicator steps={steps} currentStep={getCurrentStep()} />
        
        {/* Step 1: Authenticate with Spotify */}
        <div className={`mt-6 ${getCurrentStep() !== 0 ? 'hidden' : ''}`}>
          <h3 className="text-xl font-bold mb-4">Step 1: Connect to Spotify</h3>
          <p className="text-gray-700 mb-4">
            Start by connecting to Spotify. This allows us to generate personalized playlists based on your preferences.
          </p>
          <SpotifyAuth onAuthComplete={handleAuthComplete} />
        </div>
        
        {/* Step 2: Upload CSV */}
        <div className={`mt-6 ${getCurrentStep() !== 1 || (!isAuthenticated && !csvData) ? 'hidden' : ''}`}>
          <h3 className="text-xl font-bold mb-4">Step 2: Upload Audio Analysis CSV</h3>
          <p className="text-gray-700 mb-4">
            Upload your CSV from Spectralify Audio. If you don't have one yet, you can use our pre-made CSV:
          </p>
          <div className="mb-4 text-center">
            <ActionButton 
              onClick={() => window.open('https://drive.google.com/file/d/11yblXzIbKuY8gey5Jt-9sYflqWjZzgmi/view?usp=sharing', '_blank')}
            >
              Use Our Pre-made CSV!
            </ActionButton>
          </div>
          <CSVUpload onDataProcessed={handleDataProcessed} fileInputRef={fileInputRef} />
        </div>
        
        {/* Step 3: Select Seed Song */}
        <div className={`mt-6 ${!csvData || view !== 'songSelector' ? 'hidden' : ''}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Music className="mr-2" />
            Step 3: Select a Seed Song
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <InputField
                label="Search for a song by title or artist"
                placeholder="Enter song title or artist name"
                value={seedSong ? (songDataMap[seedSong]?.Title || '') : searchInput}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setSearchInput(inputValue);
                  if (seedSong) setSeedSong(''); // Clear selected song when typing
                  handleSeedSongSearch(inputValue);
                }}
              />
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200">
                  {searchResults.map(song => (
                    <div 
                      key={song.id} 
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        selectSeedSong(song);
                        setSearchInput(''); // Clear search input when a song is selected
                      }}
                    >
                      <div className="font-medium">{song.Title || 'Unknown Title'}</div>
                      <div className="text-sm text-gray-600">{song.Artist || 'Unknown Artist'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Select Feature Groups</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {featureGroups.map(group => (
                  <label key={group.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={group.value}
                      checked={selectedFeatureGroups.includes(group.value)}
                      onChange={handleFeatureGroupChange}
                      className="rounded border-gray-300"
                    />
                    <span>{group.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <SelectField
              label="Playlist Length"
              options={playlistLengthOptions}
              value={playlistLength}
              onChange={handlePlaylistLengthChange}
            />
            
            <button 
              className="flex items-center text-sm text-gray-600 hover:text-black"
              onClick={toggleAdvancedOptions}
            >
              <SlidersHorizontal size={16} className="mr-1" />
              {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
            
            {showAdvancedOptions && (
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Recommendation Blend Factor: {blendFactor}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={blendFactor}
                    onChange={handleBlendFactorChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Feature-based</span>
                    <span>Balanced</span>
                    <span>Position-based</span>
                  </div>
                </div>
                
                {/* Artist Prioritization Settings */}
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="artistPriority"
                      checked={artistPriority}
                      onChange={(e) => setArtistPriority(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="artistPriority" className="text-sm font-medium">
                      Prioritize songs by the same artist
                    </label>
                  </div>
                  
                  {artistPriority && (
                    <>
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 mb-1">
                          Artist similarity boost: {artistBoost}
                        </label>
                        <input
                          type="range"
                          min="0.05"
                          max="0.3"
                          step="0.05"
                          value={artistBoost}
                          onChange={(e) => setArtistBoost(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Maximum songs from same artist: {maxSameArtist}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={maxSameArtist}
                          onChange={(e) => setMaxSameArtist(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mt-2">
                  The blend factor controls how recommendations are calculated. A lower value emphasizes sonic features, while a higher value emphasizes how songs are positioned relative to each other across features.
                </p>
              </div>
            )}              
            <ActionButton
              onClick={handleGenerateRecommendations}
              disabled={loading || !seedSong}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Finding Songs...
                </>
              ) : (
                'Generate Recommendations'
              )}
            </ActionButton>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </ContentBox>
      
      {/* Recommendations View */}
      {recommendations.length > 0 && view === 'recommendations' && (
        <ContentBox className="p-6 border-x-4 border-b-4 border-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recommended Songs</h3>
            <div className="text-sm">
              Based on: {songDataMap[seedSong]?.Title || 'Selected Song'} by {songDataMap[seedSong]?.Artist || 'Unknown'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.map((song, index) => (
              <div key={index} className="border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-200 relative">
                  {song.albumArt ? (
                    <img 
                      src={song.albumArt} 
                      alt={`${song.Title || 'Unknown'} album art`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Disc size={48} className="text-gray-500" />
                    </div>
                  )}
                  {song.Artist && seedSong && songDataMap[seedSong]?.Artist === song.Artist && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Same Artist
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-bold truncate">{song.Title || `Track ${song.id}`}</h4>
                  <p className="text-sm text-gray-600 truncate">{song.Artist || 'Unknown artist'}</p>
                  <p className="text-xs text-gray-500 truncate">{song.Album || 'Unknown album'}</p>
                  {typeof song.similarityScore !== 'undefined' && (
                    <div className="mt-1 flex items-center">
                      <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${Math.min(song.similarityScore * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {Math.round(song.similarityScore * 100)}% match
                      </span>
                    </div>
                  )}
                  {song.externalUrl && (
                    <a 
                      href={song.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Open in Spotify
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-4 py-2 mt-6 flex flex-wrap gap-4">
            <ActionButton onClick={() => setView('playlistCreator')}>
              <Save className="mr-2" size={18} />
              Save Playlist
            </ActionButton>
            <ActionButton 
              onClick={resetProcess}
              className="px-4 py-2 flex items-center"
            >
              <Search className="mr-2" size={18} />
              Try Another Song
            </ActionButton>
            <ActionButton 
              onClick={startOver}
              className="px-4 py-2 flex items-center"
            >
              <FileSpreadsheet className="mr-2" size={18} />
              Upload New Data
            </ActionButton>
          </div>
        </ContentBox>
      )}
      
      {/* Playlist Creator View */}
      {recommendations.length > 0 && view === 'playlistCreator' && (
        <ContentBox className="p-6 border-x-4 border-b-4 border-black">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Save className="mr-2" />
            Save to Spotify
          </h3>
          
          <div className="space-y-4">
            {playlistCreated ? (
              <div className="p-4 bg-green-100 border border-green-300 rounded text-green-700">
                <h4 className="font-bold text-lg mb-2">Success!</h4>
                <p>Your playlist "{playlistName}" has been created and saved to your Spotify account.</p>
                <div className="mt-4">
                  <ActionButton onClick={startOver}>
                    Create Another Playlist
                  </ActionButton>
                </div>
              </div>
            ) : (
              <>
                <InputField
                  label="Playlist Name"
                  placeholder="Enter a name for your playlist"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
                
                <InputField
                  label="Description"
                  placeholder="Enter a description"
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                />
                
                <p className="text-sm text-gray-600">
                  This will create a playlist with {recommendations.length} songs in your Spotify account.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <ActionButton
                    onClick={handleCreatePlaylist}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin mr-2" size={18} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={18} />
                        Create Playlist
                      </>
                    )}
                  </ActionButton>
                  
                  <button 
                    onClick={() => setView('recommendations')}
                    className="px-4 py-2 border border-black rounded hover:bg-gray-100"
                  >
                    Back to Recommendations
                  </button>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        </ContentBox>
      )}
    </div>
  );
}