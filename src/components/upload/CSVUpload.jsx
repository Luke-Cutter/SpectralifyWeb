// src/components/upload/CSVUpload.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import { ContentBox } from '../common/ContentBox';
import { Upload, Loader, AlertCircle, Check } from 'lucide-react';

export const CSVUpload = ({ onDataProcessed }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSuccess(false);
    const uploadedFile = event.target.files[0];

    if (!uploadedFile) return;
    if (!validateCSV(uploadedFile)) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    Papa.parse(uploadedFile, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // At minimum we need track_id for the application to work
        if (!results.meta.fields.includes('track_id')) {
          setError('CSV must include at least the track_id column');
          setIsProcessing(false);
          return;
        }

        if (results.data.length === 0) {
          setError('CSV file has no data rows');
          setIsProcessing(false);
          return;
        }

        onDataProcessed(results.data);
        setIsSuccess(true);
        setIsProcessing(false);
      },
      error: (error) => {
        setError('Error processing CSV: ' + error.message);
        setIsProcessing(false);
      }
    });
  };

  return (
    <ContentBox className="p-8 border-x-4 border-b-4 border-black">
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Upload className="mr-2" />
          Upload Your Music Data
        </h3>

        <div className="flex flex-col items-center space-y-4">
          <label className="w-full cursor-pointer">
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100">
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
            <div className="p-3 w-full bg-red-100 border border-red-300 rounded text-red-700 flex items-center">
              <AlertCircle className="mr-2" size={18} />
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="p-3 w-full bg-blue-100 border border-blue-300 rounded text-blue-700 flex items-center">
              <Loader className="animate-spin mr-2" size={18} />
              Processing your data...
            </div>
          )}

          {isSuccess && (
            <div className="p-3 w-full bg-green-100 border border-green-300 rounded text-green-700 flex items-center">
              <Check className="mr-2" size={18} />
              Data loaded successfully!
            </div>
          )}
        </div>
      </div>
    </ContentBox>
  );
};