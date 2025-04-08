// src/utils/recommendationEngine.js
import _ from 'lodash';

// Feature group mappings for filtering
const FEATURE_GROUPS = {
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
const FEATURE_WEIGHTS = {
  'danceability': 2.0,
  'energy': 2.0,
  'key': 1.0,
  'loudness': 1.5,
  'mode': 0.8,
  'speechiness': 1.2,
  'acousticness': 1.8,
  'instrumentalness': 1.5,
  'liveness': 1.0,
  'valence': 1.8,
  'tempo': 1.6,
  'duration_ms': 0.5,
  'time_signature': 0.5,
  'Tempo_BPM': 1.8,
  'Beat_Strength': 1.6,
  'Beat_Regularity': 1.5,
  'Groove_Consistency': 1.5,
  'RMS_Energy_Mean': 1.6,
  'Dynamic_Range': 1.5,
  'Average_Spectral_Centroid': 1.4
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
    .filter(song => 
      (song.id !== seedSong.id && song.track_id !== seedSong.track_id) || 
      (!song.id && !song.track_id)
    )
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
    const idToFind = typeof songId === 'string' ? parseInt(songId, 10) : songId;
    
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
    .filter(song => song.id !== seedSong.id && song.track_id !== seedSong.track_id) // Exclude seed song
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

// Named export for the recommendation functions
const recommendationFunctions = {
  generateRecommendations,
  findNearestSongs,
  getSimpleSimilarSongs,
  FEATURE_GROUPS
};

export default recommendationFunctions;