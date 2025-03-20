// src/components/RecommendationDisplay.jsx
import React, { useState } from 'react';
import { ContentBox } from './common/ContentBox';
import { ActionButton } from './common/ActionButton';
import { generateRecommendations } from '../utils/recommendationEngine';

export const RecommendationDisplay = () => {
  const [songData, setSongData] = useState([]);
  const [selectedSong, setSelectedSong] = useState('');
  const [numSongs, setNumSongs] = useState(10);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',');
      
      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = isNaN(values[index]) ? values[index] : parseFloat(values[index]);
          return obj;
        }, {});
      });
      
      setSongData(data);
      setError('');
      setRecommendations(null);
    } catch (err) {
      setError('Error processing file. Please make sure it\'s a valid CSV.');
    }
  };

  const handleGenerateRecommendations = () => {
    if (!selectedSong) {
      setError('Please select a seed song');
      return;
    }
    
    const seedSong = songData.find(song => song.Filename === selectedSong);
    const recommendations = generateRecommendations(songData, seedSong, numSongs);
    
    // Debug log
    console.log('Generated recommendations:', recommendations.map(r => ({
      title: r.Title,
      score: r.similarityScore,
      features: r.matchingFeatures
    })));
    
    setRecommendations(recommendations);
  };

  const formatFeatureName = (feature) => {
    return feature
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <ContentBox>
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Upload Music Analysis CSV</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>
            {error && (
              <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
          </div>

          {songData.length > 0 && (
            <>
              {/* Song Selection */}
              <div>
                <label className="block mb-2 font-medium">Choose Your Seed Song</label>
                <select
                  value={selectedSong}
                  onChange={(e) => setSelectedSong(e.target.value)}
                  className="w-full p-2 border-2 border-black rounded-lg"
                >
                  <option value="">Select a song...</option>
                  {songData.map(song => (
                    <option key={song.Filename} value={song.Filename}>
                      {song.Title} - {song.Artist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Recommendations */}
              <div>
                <label className="block mb-2 font-medium">Number of Recommendations</label>
                <input
                  type="number"
                  min="1"
                  max={songData.length - 1}
                  value={numSongs}
                  onChange={(e) => setNumSongs(parseInt(e.target.value))}
                  className="w-full p-2 border-2 border-black rounded-lg"
                />
              </div>

              {/* Selected Song Details */}
              {selectedSong && (
                <div className="p-4 bg-spectralify-pink rounded-lg">
                  <div className="flex gap-6">
                    <div className="w-48 h-48 flex-shrink-0">
                      <div className="w-full h-full border-2 border-black rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {/* Temporary Image Suffle until API is integrated*/ }
                      <img
                          src={[
                            "/SpectralifyWeb/images/no_depression.jpg",
                            "/SpectralifyWeb/images/The_Speed_of_Cattle_cover.jpg",
                            "/SpectralifyWeb/images/wowee.jpg",
                            "/SpectralifyWeb/images/Yankee_Hotel_Foxtrot_(Front_Cover).png",
                            "/SpectralifyWeb/images/evah.png",
                            "/SpectralifyWeb/images/grandaddy.jpg"
                          ][Math.floor(Math.random() * 6)]} 
                          alt={`${songData.find(song => song.Filename === selectedSong)?.Album} cover`}
                          className="w-full h-full object-cover"
                        />
                        {/* Temporary Image Suffle until API is integrated*/ }
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-xl mb-2">Selected Song Details</h4>
                      {songData.filter(song => song.Filename === selectedSong).map(song => (
                        <div key={song.Filename} className="space-y-2">
                          <p><span className="font-medium">Title:</span> {song.Title}</p>
                          <p><span className="font-medium">Artist:</span> {song.Artist}</p>
                          <p><span className="font-medium">Album:</span> {song.Album}</p>
                          <div className="mt-4">
                            <p className="font-medium mb-2">Key Characteristics:</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p><span className="font-medium">Tempo:</span> {song.Tempo_BPM.toFixed(1)} BPM</p>
                              <p><span className="font-medium">Key:</span> {song.Estimated_Key}</p>
                              <p><span className="font-medium">Beat Strength:</span> {song.Beat_Strength.toFixed(2)}</p>
                              <p><span className="font-medium">Energy:</span> {song.RMS_Energy_Mean.toFixed(3)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <ActionButton onClick={handleGenerateRecommendations}>
                Find Similar Songs
              </ActionButton>
            </>
          )}
        </div>
      </ContentBox>

      {/* Recommendations Display */}
      {recommendations && recommendations.length > 0 && (
        <ContentBox>
          <h3 className="text-xl font-bold mb-4">Similar Songs</h3>
          <div className="space-y-4">
            {recommendations.map((song, index) => (
              <div 
                key={song.Filename} 
                className="p-4 bg-gray-50 rounded-lg border-2 border-black"
              >
                <div className="flex gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full border-2 border-black rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {/* Temporary Image Suffle until API is integrated*/ }
                      <img
                          src={[
                            "/SpectralifyWeb/images/no_depression.jpg",
                            "/SpectralifyWeb/images/The_Speed_of_Cattle_cover.jpg",
                            "/SpectralifyWeb/images/wowee.jpg",
                            "/SpectralifyWeb/images/Yankee_Hotel_Foxtrot_(Front_Cover).png",
                            "/SpectralifyWeb/images/evah.png",
                            "/SpectralifyWeb/images/grandaddy.jpg"
                          ][Math.floor(Math.random() * 6)]} 
                        alt={`${song.Album} cover`}
                        className="w-full h-full object-cover"
                      />
                      {/* Temporary Image Suffle until API is integrated*/ }
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">
                          {index + 1}. {song.Title}
                        </h4>
                        <p className="text-sm text-gray-600">{song.Artist} - {song.Album}</p>
                      </div>
                      <span className="text-lg font-bold">
                        {Math.round(song.similarityScore * 100)}%
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <p className="font-medium text-sm mb-2">Matching Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {song.matchingFeatures.slice(0, 5).map(feature => (
                          <span 
                            key={feature.feature}
                            className="px-3 py-1 bg-spectralify-pink rounded-full text-xs font-medium"
                            title={`${(feature.similarity * 100).toFixed(1)}% match`}
                          >
                            {formatFeatureName(feature.feature)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p><span className="font-medium">Tempo:</span> {song.Tempo_BPM.toFixed(1)} BPM</p>
                      <p><span className="font-medium">Key:</span> {song.Estimated_Key}</p>
                      <p><span className="font-medium">Beat Strength:</span> {song.Beat_Strength.toFixed(2)}</p>
                      <p><span className="font-medium">Energy:</span> {song.RMS_Energy_Mean.toFixed(3)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentBox>
      )}
    </div>
  );
};