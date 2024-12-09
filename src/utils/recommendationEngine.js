// src/utils/recommendationEngine.js
import _ from 'lodash';

// Feature weights organized by category
const FEATURE_WEIGHTS = {
  // Rhythmic Features - Fundamental to song feel and groove
  'Tempo_BPM': 1.8,              // Strong influence on perceived similarity
  'Beat_Strength': 1.6,          // How prominent the beat is
  'Beat_Regularity': 1.5,        // Consistency of beat timing
  'Beat_Density': 1.4,           // How many beats per unit time
  'Groove_Consistency': 1.5,     // How well the rhythm maintains its pattern
  'Onset_Rate': 1.3,             // Rate of note/sound beginnings
  'Pulse_Clarity': 1.4,          // How clear the rhythmic pulse is

  // Tonal and Harmonic Features - Important for musical character
  'Estimated_Key': 1.1,          // Musical key
  'Key_Confidence': 0.9,         // How confident the key detection is
  'Harmonic_Energy': 1.5,        // Strength of harmonic content
  'Harmonic_Ratio': 1.4,         // Ratio of harmonic to percussive content
  'Tonal_Energy_Ratio': 1.3,     // Distribution of energy in tonal components
  'Average_Chroma': 1.2,         // Average pitch class profile
  'Chroma_Std': 1.1,             // Variation in pitch class profile

  // Spectral Features - Timbre and sound quality
  'Average_Spectral_Centroid': 1.4,  // Brightness of sound
  'Spectral_Centroid_Std': 1.2,      // Variation in brightness
  'Average_Spectral_Rolloff': 1.3,   // Distribution of frequencies
  'Spectral_Contrast_Mean': 1.3,     // Difference between peaks and valleys
  'Spectral_Entropy': 1.2,           // Complexity of spectrum

  // Energy and Dynamics
  'RMS_Energy_Mean': 1.6,        // Overall energy level
  'RMS_Energy_Std': 1.4,         // Energy variation
  'Dynamic_Range': 1.5,          // Range between quiet and loud parts
  'Peak_Energy': 1.3,            // Maximum energy
  'Crest_Factor': 1.2,           // Peak to average ratio

  // MFCC Features - Detailed timbre characteristics
  'MFCC_1_Mean': 1.2,
  'MFCC_2_Mean': 1.1,
  'MFCC_3_Mean': 1.0,
  'MFCC_4_Mean': 0.9,
};

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
    'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  if (!keyMap.hasOwnProperty(key1) || !keyMap.hasOwnProperty(key2)) {
    return 0.5;
  }

  const distance = Math.abs(keyMap[key1] - keyMap[key2]);
  const circleDistance = Math.min(distance, 12 - distance);
  return 1 - (circleDistance / 6);
};

export const generateRecommendations = (songs, seedSong, numRecommendations = 10) => {
  const features = Object.keys(FEATURE_WEIGHTS);
  
  const ranges = features.reduce((acc, feature) => {
    const values = songs
      .map(song => song[feature])
      .filter(val => !isNaN(val) && val !== null && val !== undefined);
    
    acc[feature] = {
      min: Math.min(...values),
      max: Math.max(...values)
    };
    return acc;
  }, {});

  const songsWithScores = songs
    .filter(song => song.Filename !== seedSong.Filename)
    .map(song => {
      let weightedSimilaritySum = 0;
      let totalWeight = 0;
      let matchingFeatures = [];
      let featureScores = {};

      features.forEach(feature => {
        const weight = FEATURE_WEIGHTS[feature];
        
        if (isNaN(song[feature]) || isNaN(seedSong[feature])) return;

        let similarity;
        if (feature === 'Estimated_Key') {
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