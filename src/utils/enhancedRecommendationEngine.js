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
 * Generate recommendations based on multiple seed songs
 * @param {Array} songs - Array of song objects with feature data
 * @param {Array} seedSongs - Array of seed songs to compare against
 * @param {number} numRecommendations - Number of recommendations to return
 * @param {Array} featureGroups - Array of feature group names to filter by
 * @param {Object} options - Additional options
 * @returns {Array} - Sorted array of recommendation objects
 */
export const generateMultiSeedRecommendations = (songs, seedSongs, numRecommendations = 10, featureGroups = null, options = {}) => {
  if (!seedSongs || !Array.isArray(seedSongs) || seedSongs.length === 0) {
    console.error("No seed songs provided");
    return [];
  }

  // Default options
  const {
    combinationMethod = 'average', // 'average', 'minimum', 'geometric'
    scoreThreshold = 0.0,          // Minimum score threshold (0-1)
    normalizeScores = true,        // Whether to normalize scores across seeds
    weightByDistance = false,      // Whether to give more weight to closer songs
  } = options;

  console.log(`Generating recommendations based on ${seedSongs.length} seed songs`);
  
  // Extract all seed song IDs
  const seedSongIds = seedSongs.map(song => song.id || song.track_id);
  
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
    // Collect all numerical features from all seed songs
    const allFeatures = new Set();
    seedSongs.forEach(seedSong => {
      Object.keys(seedSong).forEach(key => {
        if (typeof seedSong[key] === 'number' && !['id', 'track_id'].includes(key)) {
          allFeatures.add(key);
        }
      });
    });
    features = [...allFeatures];
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

  // First, filter out songs that are in the seed list
  const candidateSongs = songs.filter(song => {
    const songId = song.id || song.track_id;
    return !seedSongIds.includes(songId);
  });

  // For each candidate song, calculate similarity to each seed song
  const songsWithMultiScores = candidateSongs.map(song => {
    const seedScores = seedSongs.map(seedSong => {
      let weightedSimilaritySum = 0;
      let totalWeight = 0;
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
      });

      const similarityScore = totalWeight > 0 
        ? weightedSimilaritySum / totalWeight
        : 0;

      return {
        seedId: seedSong.id || seedSong.track_id,
        seedTitle: seedSong.Title || 'Unknown',
        seedArtist: seedSong.Artist || 'Unknown',
        similarityScore: Math.min(similarityScore, 1),
      };
    });

    // Combine scores from all seed songs
    let combinedScore;
    
    switch (combinationMethod) {
      case 'minimum':
        // Use the minimum similarity score (most conservative)
        combinedScore = Math.min(...seedScores.map(s => s.similarityScore));
        break;
      
      case 'geometric':
        // Use geometric mean (all must be somewhat similar)
        const product = seedScores.reduce((prod, s) => prod * Math.max(s.similarityScore, 0.01), 1);
        combinedScore = Math.pow(product, 1 / seedScores.length);
        break;
        
      case 'weighted':
        // Weight by distance if requested
        if (weightByDistance) {
          const totalScore = seedScores.reduce((sum, s) => sum + s.similarityScore, 0);
          const weightedSum = seedScores.reduce((sum, s) => sum + (s.similarityScore * s.similarityScore), 0);
          combinedScore = totalScore > 0 ? weightedSum / totalScore : 0;
        } else {
          // Fall through to average if not weighting by distance
          combinedScore = seedScores.reduce((sum, s) => sum + s.similarityScore, 0) / seedScores.length;
        }
        break;
        
      case 'average':
      default:
        // Use average similarity score (balanced)
        combinedScore = seedScores.reduce((sum, s) => sum + s.similarityScore, 0) / seedScores.length;
        break;
    }

    return {
      ...song,
      seedScores,
      similarityScore: combinedScore,
      // Provide individual score for each seed
      individualScores: seedScores.reduce((acc, score) => {
        acc[score.seedId] = score.similarityScore;
        return acc;
      }, {})
    };
  });

  // Filter by threshold if needed
  let filteredSongs = songsWithMultiScores;
  if (scoreThreshold > 0) {
    filteredSongs = filteredSongs.filter(song => song.similarityScore >= scoreThreshold);
  }

  // Sort by combined similarity score and take top recommendations
  return _.orderBy(filteredSongs, ['similarityScore'], ['desc'])
    .slice(0, numRecommendations)
    .map(song => ({
      ...song,
      similarityScore: Math.round(song.similarityScore * 100) / 100,
      // Round individual scores for display
      individualScores: Object.entries(song.individualScores).reduce((acc, [id, score]) => {
        acc[id] = Math.round(score * 100) / 100;
        return acc;
      }, {})
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
 * Find nearest songs to multiple seed songs using ordered arrays
 * @param {Object} orderedData - Object with features as keys and ordered song ID arrays as values
 * @param {Array} songIds - Array of song IDs to find neighbors for
 * @param {number} numNeighbors - Total number of neighbors to consider per seed
 * @param {Array} groups - Optional array of feature group names to filter by
 * @param {Object} options - Additional options
 * @returns {Array} - Array of [songId, score] pairs representing the most common nearby songs
 */
export const findNearestMultiSeedSongs = (orderedData, songIds, numNeighbors = 1000, groups = null, options = {}) => {
  if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
    console.error("No seed song IDs provided");
    return [];
  }

  const {
    combinationMethod = 'count',      // 'count', 'rank', 'normalized'
    finalCount = Math.min(numNeighbors, 100)  // Number of final recommendations to return
  } = options;

  // Aggregated song counts across all seed songs
  const aggregatedCounts = new Map();
  
  // Process each seed song
  songIds.forEach(seedId => {
    // Get counts for this seed song
    const seedCounts = new Map();
    
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
          processFeature(feature, songList, seedId, seedCounts);
        }
      }
    } else {
      // Process all features if no groups are specified
      for (const [feature, songList] of Object.entries(orderedData)) {
        processFeature(feature, songList, seedId, seedCounts);
      }
    }
    
    // Update the aggregated counts based on this seed's results
    for (const [id, count] of seedCounts.entries()) {
      // Skip if the ID is one of our seed songs
      if (songIds.includes(id)) continue;
      
      if (!aggregatedCounts.has(id)) {
        aggregatedCounts.set(id, { 
          totalCount: count,
          seedCounts: { [seedId]: count },
          seedsFound: 1
        });
      } else {
        const current = aggregatedCounts.get(id);
        current.totalCount += count;
        current.seedCounts[seedId] = count;
        current.seedsFound += 1;
      }
    }
  });
  
  // Helper function to process each feature
  function processFeature(feature, songList, seedId, countMap) {
    // Convert songId to numeric if it's a string
    const idToFind = typeof seedId === 'string' ? parseInt(seedId, 10) || seedId : seedId;
    
    const index = songList.indexOf(idToFind);
    if (index !== -1) {
      const start = Math.max(0, index - Math.floor(numNeighbors / 2));
      const end = Math.min(songList.length, index + Math.floor(numNeighbors / 2) + 1);
      const nearestSongs = songList.slice(start, end);
      
      nearestSongs.forEach(id => {
        if (id !== idToFind) {
          countMap.set(id, (countMap.get(id) || 0) + 1);
        }
      });
    }
  }
  
  // Calculate scores based on the combination method
  let scoredSongs = [];
  
  if (combinationMethod === 'normalized') {
    // Normalize by dividing by total possible occurrences
    // (# of seeds × # of features examined)
    const featuresCount = groups ? 
      groups.reduce((sum, group) => sum + (FEATURE_GROUPS[group] ? FEATURE_GROUPS[group].length : 0), 0) : 
      Object.keys(orderedData).length;
    
    const maxPossible = songIds.length * featuresCount;
    
    scoredSongs = [...aggregatedCounts.entries()].map(([id, data]) => {
      const normalizedScore = maxPossible > 0 ? data.totalCount / maxPossible : 0;
      return [id, normalizedScore];
    });
  } else if (combinationMethod === 'rank') {
    // Use count but boost songs that appear across more seed songs
    scoredSongs = [...aggregatedCounts.entries()].map(([id, data]) => {
      const seedCoverageBoost = data.seedsFound / songIds.length;
      const score = data.totalCount * seedCoverageBoost;
      return [id, score];
    });
  } else {
    // Default 'count' - just use raw counts
    scoredSongs = [...aggregatedCounts.entries()].map(([id, data]) => [id, data.totalCount]);
  }
  
  // Sort by score (descending) and return only the requested number
  return scoredSongs
    .sort((a, b) => b[1] - a[1])
    .slice(0, finalCount);
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
 * Enhanced artist prioritization for multiple seed songs
 * @param {Array} recommendations - Original recommendation list
 * @param {Array} seedSongs - Array of seed songs
 * @param {number} artistBoost - Boost factor for same artist (0-1)
 * @param {number} maxSameArtist - Maximum number of songs to include from same artist per seed
 * @returns {Array} - Reordered recommendations with artist priority
 */
export const prioritizeMultiArtists = (recommendations, seedSongs, artistBoost = 0.15, maxTotalSameArtist = 5) => {
  if (!recommendations || !recommendations.length || !seedSongs || !seedSongs.length) {
    return recommendations;
  }

  // Collect unique artists from seed songs
  const seedArtists = new Set();
  seedSongs.forEach(song => {
    if (song.Artist && typeof song.Artist === 'string') {
      seedArtists.add(song.Artist.toLowerCase());
    }
  });
  
  // If no seed artists found, return original recommendations
  if (seedArtists.size === 0) {
    return recommendations;
  }
  
  // First, boost scores for same-artist songs
  const boostedRecommendations = recommendations.map(song => {
    const isSameArtist = song.Artist && 
      typeof song.Artist === 'string' && 
      seedArtists.has(song.Artist.toLowerCase());
    
    return {
      ...song,
      isSameArtist,
      seedArtist: isSameArtist ? song.Artist.toLowerCase() : null,
      originalScore: song.similarityScore,
      similarityScore: isSameArtist 
        ? Math.min(song.similarityScore + artistBoost, 1) 
        : song.similarityScore
    };
  });
  
  // Sort by similarity score (with boosted scores)
  const sortedRecommendations = _.orderBy(boostedRecommendations, ['similarityScore'], ['desc']);
  
  // Group songs by artist
  const artistGroups = {};
  sortedRecommendations.forEach(song => {
    if (song.isSameArtist && song.seedArtist) {
      if (!artistGroups[song.seedArtist]) {
        artistGroups[song.seedArtist] = [];
      }
      artistGroups[song.seedArtist].push(song);
    }
  });
  
  // Count total number of same-artist songs
  const totalSameArtistSongs = Object.values(artistGroups).reduce((sum, group) => sum + group.length, 0);
  
  // If we have more same-artist songs than allowed, we need to balance them
  if (totalSameArtistSongs > maxTotalSameArtist) {
    const otherArtistSongs = sortedRecommendations.filter(song => !song.isSameArtist);
    let selectedSameArtistSongs = [];
    
    // Distribute slots proportionally among artists
    const slotsPerArtist = {};
    const artistCount = Object.keys(artistGroups).length;
    
    // First pass - allocate at least one slot per artist if possible
    Object.keys(artistGroups).forEach(artist => {
      slotsPerArtist[artist] = 1;
    });
    
    // Second pass - distribute remaining slots proportionally to artist frequency
    let remainingSlots = maxTotalSameArtist - artistCount;
    
    if (remainingSlots > 0) {
      // Sort artists by number of songs (descending)
      const sortedArtists = Object.entries(artistGroups)
        .sort((a, b) => b[1].length - a[1].length);
      
      // Distribute remaining slots to artists with more songs
      for (let i = 0; i < sortedArtists.length && remainingSlots > 0; i++) {
        const [artist] = sortedArtists[i];
        slotsPerArtist[artist]++;
        remainingSlots--;
        
        // Circle back to beginning if we still have slots
        if (remainingSlots > 0 && i === sortedArtists.length - 1) {
          i = -1; // Will become 0 after increment
        }
      }
    }
    
    // Take the top N songs for each artist based on allocated slots
    Object.entries(slotsPerArtist).forEach(([artist, slots]) => {
      const artistSongs = artistGroups[artist] || [];
      selectedSameArtistSongs = [
        ...selectedSameArtistSongs,
        ...artistSongs.slice(0, slots)
      ];
    });
    
    // For the remaining same-artist songs, revert to original score
    const selectedIds = new Set(selectedSameArtistSongs.map(song => song.id || song.track_id));
    const remainingSameArtistSongs = sortedRecommendations.filter(song => 
      song.isSameArtist && 
      !selectedIds.has(song.id || song.track_id)
    ).map(song => ({
      ...song,
      similarityScore: song.originalScore
    }));
    
    // Combine the selected same-artist songs with other artist songs 
    // and the reverted-score songs
    const combinedSongs = [
      ...selectedSameArtistSongs, 
      ...otherArtistSongs, 
      ...remainingSameArtistSongs
    ];
    
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
 * Fallback recommendation function that selects songs with similar features to multiple seed songs
 * @param {Array} songs - Array of all songs
 * @param {Array} seedSongs - Array of seed songs
 * @param {Array} featureGroups - Array of feature group names to consider
 * @param {number} count - Number of recommendations to return
 * @param {Object} options - Additional options
 * @returns {Array} - Array of recommended songs
 */
export const getMultiSeedSimilarSongs = (songs, seedSongs, featureGroups = ['basic', 'audio_features'], count = 15, options = {}) => {
  // If seed songs are not found or no feature groups, return empty array
  if (!seedSongs || !Array.isArray(seedSongs) || seedSongs.length === 0 || !featureGroups || featureGroups.length === 0) {
    return [];
  }
  
  const {
    combinationMethod = 'average', // 'average', 'minimum', 'geometric'
  } = options;
  
  // Extract all seed song IDs
  const seedSongIds = seedSongs.map(song => song.id || song.track_id);
  
  // Get features to compare from the feature groups
  let featuresToCompare = [];
  featureGroups.forEach(group => {
    if (FEATURE_GROUPS[group]) {
      featuresToCompare = [...featuresToCompare, ...FEATURE_GROUPS[group]];
    }
  });
  featuresToCompare = [...new Set(featuresToCompare)]; // Remove duplicates
  
  // For each seed song, find valid features
  const validFeaturesBySeed = seedSongs.map(seedSong => 
    featuresToCompare.filter(feature => 
      seedSong[feature] !== undefined && 
      seedSong[feature] !== null &&
      !isNaN(seedSong[feature])
    )
  );
  
  // Filter to only features that exist in at least one seed song
  const allValidFeatures = [...new Set(validFeaturesBySeed.flat())];
  
  if (allValidFeatures.length === 0) {
    return [];
  }
  
  // Filter out seed songs from candidate pool
  const candidateSongs = songs.filter(song => {
    const songId = song.id || song.track_id;
    return !seedSongIds.includes(songId);
  });
  
  // Score each song based on similarity to each seed song
  const songsWithMultiScores = candidateSongs.map(song => {
    const seedScores = seedSongs.map((seedSong, seedIndex) => {
      const validFeatures = validFeaturesBySeed[seedIndex];
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
        seedId: seedSong.id || seedSong.track_id,
        similarityScore: averageSimilarity
      };
    });
    
    // Combine scores from all seed songs
    let combinedScore;
    
    switch (combinationMethod) {
      case 'minimum':
        // Use the minimum similarity score
        combinedScore = Math.min(...seedScores.map(s => s.similarityScore));
        break;
      
      case 'geometric':
        // Use geometric mean
        const product = seedScores.reduce((prod, s) => prod * Math.max(s.similarityScore, 0.01), 1);
        combinedScore = Math.pow(product, 1 / seedScores.length);
        break;
        
      case 'average':
      default:
        // Use average similarity score
        combinedScore = seedScores.reduce((sum, s) => sum + s.similarityScore, 0) / seedScores.length;
        break;
    }
    
    return {
      ...song,
      similarityScore: combinedScore,
      // Store individual scores by seed ID
      individualScores: seedScores.reduce((acc, s) => {
        acc[s.seedId] = s.similarityScore;
        return acc;
      }, {})
    };
  })
  .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by combined similarity score
  .slice(0, count); // Take top matches
  
  return songsWithMultiScores;
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
 * Enhanced recommendation function that uses both direct feature comparison
 * and ordered song arrays to generate recommendations based on multiple seed songs
 * @param {Array} songs - Array of song objects with feature data
 * @param {Array} seedSongs - Array of seed songs to compare against
 * @param {Object} orderedData - Object with features as keys and ordered song ID arrays
 * @param {Object} options - Configuration options
 * @returns {Array} - Combined and sorted array of recommendation objects
 */
export const generateMultiSeedEnhancedRecommendations = (songs, seedSongs, orderedData, options = {}) => {
  if (!seedSongs || !Array.isArray(seedSongs) || seedSongs.length === 0) {
    console.error("No seed songs provided");
    return [];
  }

  const {
    numRecommendations = 10,
    useFeatureGroups = true,
    featureGroups = ['basic', 'rhythm'],
    blend = 0.5,              // 0 = only direct features, 1 = only ordered data
    artistPriority = true,    // Whether to prioritize same artists
    artistBoost = 0.15,       // Boost factor for same artists
    maxSameArtist = 5,        // Maximum total number of songs to include from same artists
    combinationMethod = 'average',  // How to combine scores: 'average', 'minimum', 'geometric'
  } = options;

  console.log(`Running enhanced multi-seed recommendations with ${seedSongs.length} seed songs`);
  
  // Request more recommendations initially to account for filtering
  const initialRequestSize = Math.min(numRecommendations * 3, songs.length - seedSongs.length);
  
  // Get recommendations using direct feature comparison for multiple seeds
  const featureRecs = generateMultiSeedRecommendations(
    songs, 
    seedSongs, 
    initialRequestSize, 
    featureGroups,
    { combinationMethod }
  );
  console.log(`Generated ${featureRecs.length} feature-based recommendations`);
  
  // Create a map of song ID to song data
  const songMap = songs.reduce((acc, song) => {
    const songId = song.id || song.track_id;
    if (songId !== undefined && songId !== null) {
      acc[songId] = song;
    }
    return acc;
  }, {});
  
  // Get IDs of the seed songs
  const seedSongIds = seedSongs.map(song => song.id || song.track_id)
    .filter(id => id !== undefined && id !== null);
  
  if (seedSongIds.length === 0 || !orderedData || Object.keys(orderedData).length === 0) {
    console.log("Falling back to feature recommendations only");
    
    // If we don't have ordered data or can't find seed song IDs, fall back to feature recommendations
    let recommendations = featureRecs;
    
    // Apply artist prioritization if enabled
    if (artistPriority) {
      recommendations = prioritizeMultiArtists(recommendations, seedSongs, artistBoost, maxSameArtist);
    }
    
    // Return exactly the requested number of recommendations
    return recommendations.slice(0, numRecommendations);
  }
  
  // Get recommendations using ordered song arrays
  const featureGroupsToUse = useFeatureGroups ? featureGroups : null;
  try {
    const orderedRecs = findNearestMultiSeedSongs(
      orderedData, 
      seedSongIds, 
      initialRequestSize, 
      featureGroupsToUse,
      { combinationMethod: blend > 0.8 ? 'normalized' : 'rank' }
    );
    console.log(`Generated ${orderedRecs.length} ordered-based recommendations`);
    
    // Create a map of song ID to similarity score from feature recommendations
    const featureScoreMap = featureRecs.reduce((acc, song) => {
      const songId = song.id || song.track_id;
      if (songId !== undefined && songId !== null) {
        acc[songId] = song.similarityScore;
      }
      return acc;
    }, {});
    
    // Normalize ordered recommendation scores
    const maxScore = orderedRecs.length > 0 ? orderedRecs[0][1] : 0;
    const normalizedOrderedRecs = orderedRecs.map(([id, score]) => ({
      id,
      score: maxScore > 0 ? score / maxScore : 0
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
    }).filter(song => {
      const songId = song.id || song.track_id;
      return songId && !seedSongIds.includes(songId);
    });
    
    // Apply artist prioritization if enabled
    if (artistPriority) {
      poolOfRecommendations = prioritizeMultiArtists(poolOfRecommendations, seedSongs, artistBoost, maxSameArtist);
    }
    
    // Get exact number of recommendations
    const finalRecommendations = poolOfRecommendations.slice(0, numRecommendations);
    
    console.log(`Returning ${finalRecommendations.length} blended multi-seed recommendations`);
    return finalRecommendations;
  } catch (error) {
    console.error("Error in ordered multi-seed recommendations:", error);
    // Fallback to feature-based recommendations on error
    let recommendations = featureRecs;
    
    // Apply artist prioritization if enabled
    if (artistPriority) {
      recommendations = prioritizeMultiArtists(recommendations, seedSongs, artistBoost, maxSameArtist);
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
  generateMultiSeedRecommendations,
  generateEnhancedRecommendations,
  generateMultiSeedEnhancedRecommendations,
  findNearestSongs,
  findNearestMultiSeedSongs,
  getSimpleSimilarSongs,
  getMultiSeedSimilarSongs,
  prioritizeArtists,
  prioritizeMultiArtists,
  FEATURE_GROUPS,
  FEATURE_WEIGHTS
};

export default recommendationEngine;
    
    //