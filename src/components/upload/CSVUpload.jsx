// src/components/upload/CSVUpload.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import { ContentBox } from '../common/ContentBox';
import { ActionButton } from '../common/ActionButton';

export const CSVUpload = ({ onDataProcessed }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateCSV = (file) => {
    const validExtension = file.name.endsWith('.csv');
    if (!validExtension) {
      setError('Please upload a CSV file');
      return false;
    }
    return true;
  };

  const handleFileUpload = async (event) => {
    setError('');
    const uploadedFile = event.target.files[0];
    
    if (!validateCSV(uploadedFile)) return;
    
    setFile(uploadedFile);
    setIsProcessing(true);

    Papa.parse(uploadedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const requiredColumns = [
          'track_id', 'danceability', 'energy', 'key',
          'loudness', 'mode', 'speechiness', 'acousticness',
          'instrumentalness', 'liveness', 'valence', 'tempo',
          'time_signature', 'duration_ms'
        ];

        const missingColumns = requiredColumns.filter(
          col => !results.meta.fields.includes(col)
        );

        if (missingColumns.length > 0) {
          setError(`Missing required columns: ${missingColumns.join(', ')}`);
          setIsProcessing(false);
          return;
        }

        onDataProcessed(results.data);
        setIsProcessing(false);
      },
      error: (error) => {
        setError('Error processing CSV: ' + error.message);
        setIsProcessing(false);
      }
    });
  };

  return (
    <ContentBox className="p-8">
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Upload Your Music Data</h3>
        
        <div className="flex flex-col items-center space-y-4">
          <label className="w-full">
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
          </label>
          
          {file && (
            <p className="text-sm text-gray-600">
              Selected file: {file.name}
            </p>
          )}
          
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
          
          {isProcessing && (
            <p className="text-sm text-blue-500">
              Processing your data...
            </p>
          )}
        </div>
      </div>
    </ContentBox>
  );
};