// src/utils/enhancedRecommendationEngine.js
import _ from 'lodash';
// eslint-disable-next-line no-unused-vars
import Papa from 'papaparse';

// Feature group mappings
export const FEATURE_GROUPS = {
  "basic": [
    "Duration_Seconds", "Tempo_BPM", "Beat_Regularity", "Beat_Density", "Beat_Strength", 
    "danceability", "tempo", "duration_ms", "time_signature"
  ],
  "pitch": [
    "Estimated_Key", "Key_Confidence", "Average_Pitch", "Pitch_Range", "pYIN_Pitch", 
    "Harmonic_Salience", "key", "mode"
  ],
  "spectral": [
    "Average_Spectral_Centroid", "Average_Spectral_Rolloff", "Average_Spectral_Bandwidth",
    "Spectral_Contrast_Mean", "Spectral_Entropy", "Spectral_Flatness", "Tonnetz_Features", 
    "Polynomial_Coefficients"
  ],
  "energy": [
    "RMS_Energy_Mean", "RMS_Energy_Std", "Dynamic_Range", "Crest_Factor", "PCEN_Energy",
    "energy", "loudness"
  ],
  "harmonic": [
    "Harmonic_Ratio", "Tonal_Energy_Ratio", "Variable_Q_Features", "Reassigned_Features",
    "key", "mode", "valence"
  ],
  "rhythm": [
    "Groove_Consistency", "Pulse_Clarity", "Fourier_Tempogram", "Tempogram_Ratio", 
    "Onset_Rate", "Onset_Strength_Mean", "tempo", "time_signature", "danceability"
  ],
  "structure": [
    "RQA_Features", "Path_Enhanced_Structure", "HPSS_Separation", "MultipleSegmentation_Boundaries"
  ],
  "audio_features": [
    "acousticness", "danceability", "energy", "instrumentalness", "liveness", 
    "loudness", "speechiness", "tempo", "valence"
  ]
};

// Feature weights for recommendation algorithm
export const FEATURE_WEIGHTS = {
  // Rhythmic Features
  'danceability': 2.0,
  'Tempo_BPM': 1.8,
  'Beat_Strength': 1.6,
  'Beat_Regularity': 1.5,
  'Groove_Consistency': 1.5,
  'tempo': 1.6,
  
  // Energy Features
  'energy': 2.0,
  'RMS_Energy_Mean': 1.6,
  'Dynamic_Range': 1.5,
  'loudness': 1.5,
  
  // Spectral Features
  'Average_Spectral_Centroid': 1.4,
  'acousticness': 1.8,
  
  // Other Features
  'key': 1.0,
  'mode': 0.8,
  'speechiness': 1.2,
  'instrumentalness': 1.5,
  'liveness': 1.0,
  'valence': 1.8,
  'duration_ms': 0.5,
  'time_signature': 0.5
};

// Helper functions for similarity calculations
const calculateFeatureSimilarity = (value1, value2, range) => {
  if (range.max === range.min) return 0;
  
  const normalizedValue1 = (value1 - range.min) / (range.max - range.min);
  const normalizedValue2 = (value2 - range.min) / (range.max - range.min);
  
  const rawDifference = Math.abs(normalizedValue1 - normalizedValue2);
  return Math.exp(-3 * rawDifference);
};

const calculateKeySimilarity = (key1, key2) => {
  const keyMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7,
    'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, 
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11
  };

  if (!keyMap.hasOwnProperty(key1) || !keyMap.hasOwnProperty(key2)) {
    return 0.5;
  }

  const distance = Math.abs(keyMap[key1] - keyMap[key2]);
  const circleDistance = Math.min(distance, 12 - distance);
  return 1 - (circleDistance / 6);
};

/**
 * Generate recommendations based on direct feature comparison
 * @param {Array} songs - Array of song objects with feature data
 * @param {Object} seedSong - The seed song to compare against
 * @param {number} numRecommendations - Number of recommendations to return
 * @param {Array} featureGroups - Array of feature group names to filter by
 * @returns {Array} - Sorted array of recommendation objects
 */
export const generateRecommendations = (songs, seedSong, numRecommendations = 10, featureGroups = null) => {
  // Collect features to use based on the feature groups
  let features = [];
  
  if (featureGroups && featureGroups.length > 0) {
    featureGroups.forEach(group => {
      if (FEATURE_GROUPS[group]) {
        features = [...features, ...FEATURE_GROUPS[group]];
      }
    });
    features = [...new Set(features)]; // Remove duplicates
  } else {
    // Use all features available in the seed song
    features = Object.keys(seedSong).filter(key => 
      typeof seedSong[key] === 'number' && 
      !['id', 'track_id'].includes(key)
    );
  }
  
  // Calculate ranges for each feature
  const ranges = features.reduce((acc, feature) => {
    const values = songs
      .map(song => song[feature])
      .filter(val => !isNaN(val) && val !== null && val !== undefined);
    
    if (values.length > 0) {
      acc[feature] = {
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }
    return acc;
  }, {});

  // Calculate similarity scores for each song
  const songsWithScores = songs
    .filter(song => {
      // Make sure we don't include the seed song in recommendations
      if (!song || !seedSong) return false;
      
      const songId = song.id || song.track_id;
      const seedId = seedSong.id || seedSong.track_id;
      
      return songId !== seedId;
    })
    .map(song => {
      let weightedSimilaritySum = 0;
      let totalWeight = 0;
      let matchingFeatures = [];
      let featureScores = {};

      features.forEach(feature => {
        // Skip if feature doesn't exist in either song
        if (
          !ranges[feature] || 
          isNaN(song[feature]) || 
          isNaN(seedSong[feature]) ||
          song[feature] === undefined ||
          seedSong[feature] === undefined
        ) return;

        // Use defined weight or default to 1.0
        const weight = FEATURE_WEIGHTS[feature] || 1.0;
        
        // Calculate similarity based on feature type
        let similarity;
        if (feature === 'key' || feature === 'Estimated_Key') {
          similarity = calculateKeySimilarity(seedSong[feature], song[feature]);
        } else {
          similarity = calculateFeatureSimilarity(
            seedSong[feature],
            song[feature],
            ranges[feature]
          );
        }

        weightedSimilaritySum += similarity * weight;
        totalWeight += weight;
        featureScores[feature] = similarity;

        if (similarity > 0.75) {
          matchingFeatures.push({
            feature,
            similarity
          });
        }
      });

      const similarityScore = totalWeight > 0 
        ? weightedSimilaritySum / totalWeight
        : 0;

      return {
        ...song,
        similarityScore: Math.min(similarityScore, 1),
        matchingFeatures: _.orderBy(matchingFeatures, ['similarity'], ['desc']),
        featureScores
      };
    });

  return _.orderBy(songsWithScores, ['similarityScore'], ['desc'])
    .slice(0, numRecommendations)
    .map(song => ({
      ...song,
      similarityScore: Math.round(song.similarityScore * 100) / 100
    }));
};

/**
 * Find the nearest songs based on feature similarity using ordered arrays
 * @param {Object} orderedData - Object with features as keys and ordered song ID arrays as values
 * @param {number|string} songId - ID of the song to find neighbors for
 * @param {number} numNeighbors - Total number of neighbors to consider
 * @param {Array} groups - Optional array of feature group names to filter by
 * @returns {Array} - Array of [songId, count] pairs representing the most common nearby songs
 */
export const findNearestSongs = (orderedData, songId, numNeighbors = 1000, groups = null) => {
  // Map for counting song occurrences
  const songCounts = new Map();
  
  let columnsToUse = [];
  
  // If groups are specified, collect the relevant features
  if (groups && groups.length > 0) {
    groups.forEach(keyword => {
      const groupFeatures = FEATURE_GROUPS[keyword.toLowerCase()] || [];
      columnsToUse = [...columnsToUse, ...groupFeatures];
    });
    
    // Process only the features in the selected groups
    for (const [feature, songList] of Object.entries(orderedData)) {
      if (columnsToUse.includes(feature)) {
        processFeature(feature, songList);
      }
    }
  } else {
    // Process all features if no groups are specified
    for (const [feature, songList] of Object.entries(orderedData)) {
      processFeature(feature, songList);
    }
  }
  
  // Helper function to process each feature
  function processFeature(feature, songList) {
    // Convert songId to numeric if it's a string
    const idToFind = typeof songId === 'string' ? parseInt(songId, 10) || songId : songId;
    
    const index = songList.indexOf(idToFind);
    if (index !== -1) {
      const start = Math.max(0, index - Math.floor(numNeighbors / 2));
      const end = Math.min(songList.length, index + Math.floor(numNeighbors / 2) + 1);
      const nearestSongs = songList.slice(start, end);
      
      nearestSongs.forEach(id => {
        if (id !== idToFind) {
          songCounts.set(id, (songCounts.get(id) || 0) + 1);
        }
      });
    }
  }
  
  // Remove the original song ID from the counts
  songCounts.delete(songId);
  
  // Convert the Map to an array of [songId, count] pairs and sort by count (descending)
  const sortedSongs = [...songCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, numNeighbors);
  
  return sortedSongs;
};

/**
 * Enhance recommendations by prioritizing songs from the same artist
 * @param {Array} recommendations - Original recommendation list
 * @param {Object} seedSong - The seed song
 * @param {number} artistBoost - Boost factor for same artist (0-1)
 * @param {number} maxSameArtist - Maximum number of songs to include from same artist
 * @returns {Array} - Reordered recommendations with artist priority
 */
export const prioritizeArtists = (recommendations, seedSong, artistBoost = 0.15, maxSameArtist = 3) => {
    if (!recommendations || !recommendations.length || !seedSong) {
      return recommendations;
    }
    
    const seedArtist = seedSong.Artist || '';
    if (!seedArtist) {
      return recommendations;
    }
    
    // First, boost scores for same-artist songs
    const boostedRecommendations = recommendations.map(song => {
      const isSameArtist = song.Artist && 
        typeof song.Artist === 'string' && 
        song.Artist.toLowerCase() === seedArtist.toLowerCase();
      
      return {
        ...song,
        isSameArtist,
        originalScore: song.similarityScore,
        similarityScore: isSameArtist 
          ? Math.min(song.similarityScore + artistBoost, 1) 
          : song.similarityScore
      };
    });
    
    // Sort by similarity score (with boosted scores)
    const sortedRecommendations = _.orderBy(boostedRecommendations, ['similarityScore'], ['desc']);
    
    // Now enforce the maximum number of same-artist songs
    const sameArtistSongs = sortedRecommendations.filter(song => song.isSameArtist);
    const otherArtistSongs = sortedRecommendations.filter(song => !song.isSameArtist);
    
    // If we have more same-artist songs than allowed, we need to filter them
    if (sameArtistSongs.length > maxSameArtist) {
      // Take only the top N same-artist songs (by boosted score)
      const topSameArtistSongs = sameArtistSongs.slice(0, maxSameArtist);
      
      // Get the rest of the same-artist songs
      const remainingSameArtistSongs = sameArtistSongs.slice(maxSameArtist);
      
      // For the remaining same-artist songs, revert to original score
      const revertedScoreSongs = remainingSameArtistSongs.map(song => ({
        ...song,
        similarityScore: song.originalScore
      }));
      
      // Combine the top same-artist songs with other artist songs and the reverted-score songs
      const combinedSongs = [...topSameArtistSongs, ...otherArtistSongs, ...revertedScoreSongs];
      
      // Re-sort by similarity score
      return _.orderBy(combinedSongs, ['similarityScore'], ['desc']);
    }
    
    // If we're under the max, just return the sorted recommendations
    return sortedRecommendations;
  };
  

/**
 * Fallback recommendation function that selects songs with similar features
 * @param {Array} songs - Array of all songs
 * @param {Object} seedSong - The seed song
 * @param {Array} featureGroups - Array of feature group names to consider
 * @param {number} count - Number of recommendations to return
 * @returns {Array} - Array of recommended songs
 */
export const getSimpleSimilarSongs = (songs, seedSong, featureGroups = ['basic', 'audio_features'], count = 15) => {
  // If seed song is not found or no feature groups, return empty array
  if (!seedSong || !featureGroups || featureGroups.length === 0) {
    return [];
  }
  
  // Get features to compare from the feature groups
  let featuresToCompare = [];
  featureGroups.forEach(group => {
    if (FEATURE_GROUPS[group]) {
      featuresToCompare = [...featuresToCompare, ...FEATURE_GROUPS[group]];
    }
  });
  featuresToCompare = [...new Set(featuresToCompare)]; // Remove duplicates
  
  // Filter features that exist in the seed song
  const validFeatures = featuresToCompare.filter(feature => 
    seedSong[feature] !== undefined && 
    seedSong[feature] !== null &&
    !isNaN(seedSong[feature])
  );
  
  if (validFeatures.length === 0) {
    return [];
  }
  
  // Score each song based on feature similarity
  const scoredSongs = songs
    .filter(song => {
      const songId = song.id || song.track_id;
      const seedId = seedSong.id || seedSong.track_id;
      return songId !== seedId; // Exclude seed song
    })
    .map(song => {
      let totalSimilarity = 0;
      let featuresCompared = 0;
      
      validFeatures.forEach(feature => {
        if (song[feature] !== undefined && song[feature] !== null && !isNaN(song[feature])) {
          // Simple absolute difference as a similarity measure
          const diff = Math.abs(song[feature] - seedSong[feature]);
          const range = Math.max(Math.abs(seedSong[feature] * 2), 1); // Estimate a reasonable range
          const similarity = 1 - Math.min(diff / range, 1); // Normalize to 0-1, higher is more similar
          
          // Apply feature weight if available
          const weight = FEATURE_WEIGHTS[feature] || 1.0;
          totalSimilarity += similarity * weight;
          featuresCompared += weight;
        }
      });
      
      const averageSimilarity = featuresCompared > 0 ? totalSimilarity / featuresCompared : 0;
      
      return {
        ...song,
        similarityScore: averageSimilarity
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity, descending
    .slice(0, count); // Take top matches
  
  return scoredSongs;
};


/**
 * Combined recommendation function that uses both direct feature comparison
 * and ordered song arrays to generate recommendations
 * @param {Array} songs - Array of song objects with feature data
 * @param {Object} seedSong - The seed song to compare against
 * @param {Object} orderedData - Object with features as keys and ordered song ID arrays
 * @param {Object} options - Configuration options
 * @returns {Array} - Combined and sorted array of recommendation objects
 */
export const generateEnhancedRecommendations = (songs, seedSong, orderedData, options = {}) => {
    const {
      numRecommendations = 10,
      useFeatureGroups = true,
      featureGroups = ['basic', 'rhythm'],
      blend = 0.5,  // 0 = only direct features, 1 = only ordered data
      artistPriority = true, // Whether to prioritize same artist
      artistBoost = 0.15,    // Boost factor for same artist
      maxSameArtist = 3      // Maximum number of songs to include from same artist
    } = options;
  
    console.log("Running enhanced recommendations with options:", options);
    
    // Request more recommendations initially to account for filtering
    const initialRequestSize = Math.min(numRecommendations * 3, songs.length - 1);
    
    // Get recommendations using direct feature comparison
    const featureRecs = generateRecommendations(songs, seedSong, initialRequestSize, featureGroups);
    console.log(`Generated ${featureRecs.length} feature-based recommendations`);
    
    // Create a map of song ID to song data
    const songMap = songs.reduce((acc, song) => {
      // Ensure each song has a numeric ID
      const songId = song.id || song.track_id;
      
      if (songId !== undefined && songId !== null) {
        acc[songId] = song;
      }
      return acc;
    }, {});
    
    // Get ID of the seed song
    const seedSongId = seedSong.id || seedSong.track_id;
    
    if (seedSongId === undefined || seedSongId === null || !orderedData || Object.keys(orderedData).length === 0) {
      console.log("Falling back to feature recommendations only");
      
      // If we don't have ordered data or can't find the seed song ID, fall back to feature recommendations
      let recommendations = featureRecs;
      
      // Apply artist prioritization if enabled
      if (artistPriority) {
        recommendations = prioritizeArtists(recommendations, seedSong, artistBoost, maxSameArtist);
        
        // Enforce maximum number of same-artist songs
        if (maxSameArtist > 0) {
          recommendations = enforceMaxArtistSongs(recommendations, seedSong, maxSameArtist);
        }
      }
      
      // Return exactly the requested number of recommendations
      return recommendations.slice(0, numRecommendations);
    }
    
    // Get recommendations using ordered song arrays - request more to account for filtering
    const featureGroupsToUse = useFeatureGroups ? featureGroups : null;
    try {
      const orderedRecs = findNearestSongs(orderedData, seedSongId, initialRequestSize, featureGroupsToUse);
      console.log(`Generated ${orderedRecs.length} ordered-based recommendations`);
      
      // Create a map of song ID to similarity score from feature recommendations
      const featureScoreMap = featureRecs.reduce((acc, song) => {
        const songId = song.id || song.track_id;
        
        if (songId !== undefined && songId !== null) {
          acc[songId] = song.similarityScore;
        }
        return acc;
      }, {});
      
      // Normalize ordered recommendation scores (counts)
      const maxCount = orderedRecs.length > 0 ? orderedRecs[0][1] : 0;
      const normalizedOrderedRecs = orderedRecs.map(([id, count]) => ({
        id,
        score: maxCount > 0 ? count / maxCount : 0
      }));
      
      // Blend the two recommendation types
      const blendedRecs = normalizedOrderedRecs.map(({ id, score: orderedScore }) => {
        const featureScore = featureScoreMap[id] || 0;
        const blendedScore = (featureScore * (1 - blend)) + (orderedScore * blend);
        
        return {
          id,
          blendedScore,
          featureScore,
          orderedScore
        };
      });
      
      // Add in any feature recommendations that weren't in ordered recommendations
      featureRecs.forEach(song => {
        const songId = song.id || song.track_id;
        
        if (songId !== undefined && songId !== null && !blendedRecs.some(rec => rec.id === songId)) {
          blendedRecs.push({
            id: songId,
            blendedScore: song.similarityScore * (1 - blend),
            featureScore: song.similarityScore,
            orderedScore: 0
          });
        }
      });
      
      // Sort by blended score
      const topBlendedRecs = _.orderBy(blendedRecs, ['blendedScore'], ['desc']);
      
      // Map to full song objects
      let poolOfRecommendations = topBlendedRecs.map(rec => {
        const songData = songMap[rec.id] || {};
        return {
          ...songData,
          similarityScore: Math.round(rec.blendedScore * 100) / 100,
          featureScore: Math.round(rec.featureScore * 100) / 100,
          orderedScore: Math.round(rec.orderedScore * 100) / 100
        };
      }).filter(song => song.id || song.track_id); // Ensure all songs have an ID
      
      // Apply artist prioritization if enabled
      if (artistPriority) {
        poolOfRecommendations = prioritizeArtists(poolOfRecommendations, seedSong, artistBoost, maxSameArtist);
        
        // Enforce maximum number of same-artist songs
        if (maxSameArtist > 0) {
          poolOfRecommendations = enforceMaxArtistSongs(poolOfRecommendations, seedSong, maxSameArtist);
        }
      }
      
      // Get exact number of recommendations
      const finalRecommendations = poolOfRecommendations.slice(0, numRecommendations);
      
      console.log(`Returning ${finalRecommendations.length} blended recommendations`);
      return finalRecommendations;
    } catch (error) {
      console.error("Error in ordered recommendations:", error);
      // Fallback to feature-based recommendations on error
      let recommendations = featureRecs;
      
      // Apply artist prioritization if enabled
      if (artistPriority) {
        recommendations = prioritizeArtists(recommendations, seedSong, artistBoost, maxSameArtist);
        
        // Enforce maximum number of same-artist songs
        if (maxSameArtist > 0) {
          recommendations = enforceMaxArtistSongs(recommendations, seedSong, maxSameArtist);
        }
      }
      
      // Return exactly the requested number of recommendations
      return recommendations.slice(0, numRecommendations);
    }
  };
  
  /**
   * Helper function to strictly enforce the maximum number of songs from the seed artist
   * @param {Array} recommendations - Recommendation list
   * @param {Object} seedSong - The seed song
   * @param {number} maxSameArtist - Maximum number of songs to include from seed artist
   * @returns {Array} - Filtered recommendations respecting the max limit
   */
  const enforceMaxArtistSongs = (recommendations, seedSong, maxSameArtist) => {
    const seedArtist = seedSong.Artist?.toLowerCase() || '';
    if (!seedArtist) return recommendations;
    
    // Count songs by the seed artist
    let seedArtistCount = 0;
    const includedSongs = [];
    const excessSeedArtistSongs = [];
    
    // First pass: identify and count seed artist songs
    recommendations.forEach(song => {
      const songArtist = song.Artist?.toLowerCase() || '';
      const isSeedArtist = songArtist === seedArtist;
      
      if (isSeedArtist) {
        if (seedArtistCount < maxSameArtist) {
          // Include this seed artist song (within limit)
          includedSongs.push(song);
          seedArtistCount++;
        } else {
          // This is an excess seed artist song
          excessSeedArtistSongs.push(song);
        }
      } else {
        // Not from seed artist, include it
        includedSongs.push(song);
      }
    });
    
    return includedSongs;
  };


// Create a named object for export
const recommendationEngine = {
  generateRecommendations,
  generateEnhancedRecommendations,
  findNearestSongs,
  getSimpleSimilarSongs,
  prioritizeArtists,
  FEATURE_GROUPS,
  FEATURE_WEIGHTS
};

export default recommendationEngine;