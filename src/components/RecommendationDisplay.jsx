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
  generateMultiSeedEnhancedRecommendations,
  findNearestSongs,
  findNearestMultiSeedSongs,
  getSimpleSimilarSongs,
  getMultiSeedSimilarSongs
} from '../utils/enhancedRecommendationEngine';
import { Music, CheckCircle, Circle, Disc, Save, Loader, Search, FileSpreadsheet, SlidersHorizontal, Trash2} from 'lucide-react';

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

// Component to display an individual seed song
const SeedSongItem = ({ song, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg mb-2 bg-blue-50">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
          <Music size={16} />
        </div>
        <div>
          <div className="font-medium">{song.Title || 'Unknown Song'}</div>
          <div className="text-sm text-gray-600">{song.Artist || 'Unknown Artist'}</div>
        </div>
      </div>
      <button 
        onClick={onRemove} 
        className="text-gray-500 hover:text-red-500"
        title="Remove song"
      >
        <Trash2 size={16} />
      </button>
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
  const [seedSongs, setSeedSongs] = useState([]);
  const [playlistName, setPlaylistName] = useState('My Spectralify Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('Created with Spectralify audio analysis');
  const [selectedFeatureGroups, setSelectedFeatureGroups] = useState([]);
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
  const [maxSameArtist, setMaxSameArtist] = useState(5);
  const [combinationMethod, setCombinationMethod] = useState('average');
  const [searchInput, setSearchInput] = useState('');
  
  const steps = [
    { description: 'Authenticate with Spotify to access your account. Not Seeing Album covers? Get verified!' },
    { description: 'Upload your audio analysis CSV file' },
    { description: 'Select seed songs and customize your playlist' }
  ];
  
  const getCurrentStep = () => {
    if (!isAuthenticated) return 0;
    if (!csvData) return 1;
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

  const combinationMethodOptions = [
    { value: 'average', label: 'Average (Balanced - Default)' },
    { value: 'minimum', label: 'Minimum (Conservative)' },
    { value: 'geometric', label: 'Geometric (Progressive)' }
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

  const fetchUserProfile = async (token) => {
    try {
      // Use the SpotifyService class to fetch the user profile
      const spotifyService = new SpotifyService(token);
      const userProfile = await spotifyService.getCurrentUserProfile();
      setUserId(userProfile.id);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to fetch user profile. Please reconnect to Spotify.');
        setIsAuthenticated(false);
        localStorage.removeItem('spotify_access_token');
      }
    };

    const handleAuthComplete = async (token) => {
      setAccessToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('spotify_access_token', token);
      
      try {
        // Use the SpotifyService to get the current user's profile
        const spotifyService = new SpotifyService(token);
        
        try {
          const userProfile = await spotifyService.getCurrentUserProfile();
          
          // Update the user ID with the one from the profile
          setUserId(userProfile.id);
          console.log("Successfully authenticated as:", userProfile.display_name);
        } catch (profileError) {
          // If we can't get the profile but have a token, we can try to proceed
          console.warn("Could not fetch user profile, but authentication token exists:", profileError);
          // Use a fallback approach for user ID
          setView('fileUpload');
          return; // Continue with limited functionality
        }
        
        // Force the view to show the file upload step
        setView('fileUpload');
        
        // Scroll to the file upload section for better UX
        setTimeout(() => {
          const uploadSection = document.querySelector("[data-step='upload-csv']");
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } catch (error) {
        console.error("Error during authentication process:", error);
        setError('Failed to authenticate with Spotify. Please try again.');
        setIsAuthenticated(false);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
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

  const addSeedSong = (song) => {
    // Check if this song is already in the seed songs
    const songId = song.id || song.track_id;
    const isDuplicate = seedSongs.some(seedSong => {
      const seedId = seedSong.id || seedSong.track_id;
      return seedId === songId;
    });

    if (!isDuplicate) {
      setSeedSongs(prevSongs => [...prevSongs, song]);
    }
    
    setSearchInput('');
    setSearchResults([]);
  };

  const removeSeedSong = (index) => {
    setSeedSongs(prevSongs => {
      const newSongs = [...prevSongs];
      newSongs.splice(index, 1);
      return newSongs;
    });
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

  const handleCombinationMethodChange = (e) => {
    setCombinationMethod(e.target.value);
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
    if (seedSongs.length === 0 || !csvData) {
      setError('Please select at least one seed song');
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
      
      // Get recommendations based on seed songs
      let recommendationList = [];
      
      try {
        console.log("Generating enhanced recommendations...");
        
        if (seedSongs.length === 1) {
          // Single seed song case - use the original enhanced recommendations
          const selectedSongData = seedSongs[0];
          
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
        } else {
          // Multiple seed songs case - use the new multi-seed recommendations
          recommendationList = generateMultiSeedEnhancedRecommendations(
            allSongs,
            seedSongs,
            orderedData,
            {
              numRecommendations: playlistLength,
              useFeatureGroups: true,
              featureGroups: selectedFeatureGroups,
              blend: blendFactor,
              artistPriority: artistPriority,
              artistBoost: artistBoost,
              maxSameArtist: maxSameArtist,
              combinationMethod: combinationMethod
            }
          );
        }
        
        console.log("Enhanced recommendations generated:", recommendationList.length);
      } catch (error) {
        console.warn('Using fallback recommendation algorithm:', error);
        
        // Different fallback logic depending on number of seed songs
        if (seedSongs.length === 1) {
          const seedSongId = seedSongs[0].id || seedSongs[0].track_id;
          
          // Fallback to simple recommendations for single seed
          recommendationList = findNearestSongs(
            orderedData,
            seedSongId,
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
              seedSongs[0],
              selectedFeatureGroups,
              playlistLength
            );
          }
        } else {
          // Multi-seed fallback
          const seedSongIds = seedSongs.map(song => song.id || song.track_id);
          
          // First try ordered-data based multi-seed recommendations
          recommendationList = findNearestMultiSeedSongs(
            orderedData,
            seedSongIds,
            Math.min(200, csvData.length),
            selectedFeatureGroups,
            { combinationMethod: 'rank', finalCount: playlistLength }
          )
          .map(([id, score]) => ({
            ...songDataMap[id],
            similarityScore: score / 100
          }));
          
          if (recommendationList.length === 0) {
            // Second fallback
            recommendationList = getMultiSeedSimilarSongs(
              allSongs,
              seedSongs,
              selectedFeatureGroups,
              playlistLength,
              { combinationMethod }
            );
          }
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

  const handleDisconnect = () => {
    setIsAuthenticated(false);
    setAccessToken('');
    setUserId('');
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    setView('fileUpload');
  };

  const resetProcess = () => {
    setRecommendations([]);
    setSeedSongs([]);
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
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Step 1: Connect to Spotify</h3>
          <p className="text-gray-700 mb-4">
            Start by connecting to Spotify. This allows us to generate personalized playlists based on your preferences.
          </p>
          <SpotifyAuth onAuthComplete={handleAuthComplete} onDisconnect={handleDisconnect} />
          {isAuthenticated && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
              <p className="text-amber-800 font-medium flex items-center">
                <span className="mr-2">⚠️</span> 
                Missing album covers or can't save playlists? Your Spotify account needs manual verification to unlock all features. Click below to email Luke with the email address you signed up to Spotify with.
              </p>
              <div className="mt-3 text-center">
                <ActionButton
                  className="mx-auto flex items-center"
                  onClick={() => window.open('mailto:cutterluke701@gmail.com?subject=Spectralify Verification Request&body=Please verify me! I would love to use Spectralify. My Spotify account\'s email is: [Change me!]')}
                >
                  Request Verification
                </ActionButton>
              </div>
            </div>
          )}
        </div>
        
        {/* Step 2: Upload CSV - Show this ONLY when authenticated */}
        {isAuthenticated && (
          <div className="mt-12" data-step="upload-csv">
            <h3 className="text-xl font-bold mb-4">Step 2: Upload Audio Analysis CSV</h3>
            <p className="text-gray-700 mb-4">
              Upload your CSV from Spectralify Audio. If you don't have one yet, you can use our pre-made CSV:
            </p>
            <div className="mb-8 text-center">
              <ActionButton 
                onClick={() => window.open('https://drive.google.com/file/d/11yblXzIbKuY8gey5Jt-9sYflqWjZzgmi/view?usp=sharing', '_blank')}
              >
                Use Our Pre-made CSV!
              </ActionButton>
            </div>
            <CSVUpload onDataProcessed={handleDataProcessed} fileInputRef={fileInputRef} />
          </div>
        )}
        
        {/* Step 3: Select Seed Songs */}
        {csvData && view === 'songSelector' && (
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Music className="mr-2" />
              Step 3: Select Seed Songs
            </h3>
          
            <div className="space-y-4">
              {/* Display selected seed songs */}
              {seedSongs.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Selected Seed Songs:</label>
                  <div className="space-y-2">
                    {seedSongs.map((song, index) => (
                      <SeedSongItem 
                        key={index} 
                        song={song} 
                        onRemove={() => removeSeedSong(index)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <InputField
                  label="Search for songs to add as seeds"
                  placeholder="Enter song title or artist name"
                  value={searchInput}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setSearchInput(inputValue);
                    handleSeedSongSearch(inputValue);
                  }}
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200">
                    {searchResults.map((song, index) => (
                      <div 
                        key={index} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => addSeedSong(song)}
                      >
                        <div className="font-medium">{song.Title || 'Unknown Title'}</div>
                        <div className="text-sm text-gray-600">{song.Artist || 'Unknown Artist'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Multi-seed-specific settings */}
              {seedSongs.length > 1 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block mb-2 font-medium">How to combine similarity scores:</label>
                  <select 
                    value={combinationMethod}
                    onChange={handleCombinationMethodChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {combinationMethodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-gray-600">
                    <p><strong>Average:</strong> Balanced approach that finds songs with good overall similarity to all seeds.</p>
                    <p><strong>Minimum:</strong> Conservative approach that ensures songs are reasonably similar to every seed.</p>
                    <p><strong>Geometric:</strong> Progressive approach that favors consistent similarity across all seeds.</p>
                  </div>
                </div>
              )}
              
              <SelectField
                label="Playlist Length"
                options={playlistLengthOptions}
                value={playlistLength}
                onChange={handlePlaylistLengthChange}
                className="mb-2"
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
                  <div>
                    <label className="block mb-2 font-medium">Select Feature Groups (Keep All Unchecked to Weigh All Features Evenly)</label>
                    <div className="grid mt-4 mb-4 grid-cols-2 md:grid-cols-3 gap-3">
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
                        Prioritize songs by the same artists
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
                            Maximum songs from same artists: {maxSameArtist}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
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
                disabled={loading || seedSongs.length === 0}
                className="w-5/6 mx-auto flex items-center justify-center text-center"
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
        )}
      </ContentBox>
      
      {/* Recommendations View */}
      {recommendations.length > 0 && view === 'recommendations' && (
        <ContentBox className="p-6 border-x-4 border-b-4 border-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recommended Songs</h3>
            <div className="text-sm">
              {seedSongs.length === 1 ? (
                <span>Based on: {seedSongs[0]?.Title || 'Selected Song'} by {seedSongs[0]?.Artist || 'Unknown'}</span>
              ) : (
                <span>Based on {seedSongs.length} selected songs</span>
              )}
            </div>
          </div>

          {seedSongs.length > 1 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium mb-1">Seed Songs:</h4>
              <div className="flex flex-wrap gap-2">
                {seedSongs.map((song, index) => (
                  <div key={index} className="text-xs bg-white px-2 py-1 rounded border border-blue-200">
                    {song.Title || 'Unknown'} - {song.Artist || 'Unknown Artist'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
                  
                  {/* Show same artist badge for multi-seed */}
                  {artistPriority && seedSongs.some(seedSong => 
                    seedSong.Artist && song.Artist && 
                    seedSong.Artist.toLowerCase() === song.Artist.toLowerCase()
                  ) && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Same Artist
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-bold truncate">{song.Title || `Track ${song.id}`}</h4>
                  <p className="text-sm text-gray-600 truncate">{song.Artist || 'Unknown artist'}</p>
                  <p className="text-xs text-gray-500 truncate">{song.Album || 'Unknown album'}</p>
                  
                  {/* Overall similarity score */}
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
                  
                  {/* Individual scores for multi-seed */}
                  {seedSongs.length > 1 && song.individualScores && (
                    <div className="mt-1 pt-1 border-t border-gray-100">
                      <details className="text-xs">
                        <summary className="text-blue-600 cursor-pointer">Show individual matches</summary>
                        <div className="mt-1 space-y-1 pl-1">
                          {Object.entries(song.individualScores).map(([seedId, score], idx) => {
                            const seedSong = seedSongs.find(s => (s.id || s.track_id) === seedId);
                            return (
                              <div key={idx} className="flex items-center">
                                <div className="h-1.5 w-10 bg-gray-200 rounded-full overflow-hidden mr-1">
                                  <div
                                    className="h-full bg-blue-400"
                                    style={{ width: `${Math.min(score * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="truncate">
                                  {Math.round(score * 100)}% - {seedSong?.Title || 'Unknown'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
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
          <ActionButton 
            onClick={() => {
              // Scroll to the top of the page smoothly
              window.scrollTo({
                top: 1900,
                behavior: 'smooth'
              });
              // Call the setView function
              setView('playlistCreator');
            }}
            className="px-4 py-2 flex items-center"
          >
            <Save className="mr-2" size={18} />
            Save Playlist
          </ActionButton>

          <ActionButton 
            onClick={() => {
              // Scroll to the top of the page smoothly
              window.scrollTo({
                top: 1900,
                behavior: 'smooth'
              });
              // Call the resetProcess function
              resetProcess();
            }}
            className="px-4 py-2 flex items-center"
          >
            <Search className="mr-2" size={18} />
            Try Different Songs
          </ActionButton>
            <ActionButton 
              onClick={() => {
                // Scroll to the top of the page smoothly
                window.scrollTo({
                  top: 1300,
                  behavior: 'smooth'
                });
                // Call the startOver function
                startOver();
              }}
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
                <div className="mt-4 flex flex-wrap gap-3">
                  <ActionButton onClick={() => {
                    // Reset just the playlist creation state but keep the CSV data
                    setRecommendations([]);
                    setSeedSongs([]);
                    setPlaylistCreated(false);
                    setError(null);
                    setView('songSelector');
                  }}>
                    Create Another Playlist with Same Data
                  </ActionButton>
                  <ActionButton onClick={startOver} className="ml-4">
                    Start Over with New Data
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
                        💾 Create Playlist
                      </>
                    )}
                  </ActionButton>
                  
                  <ActionButton 
                    onClick={() => setView('recommendations')}
                    className="px-1 border ml-4 rounded-3xl border-black rounded text-xs"
                  >
                    Back to Recommendations
                  </ActionButton>
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
};