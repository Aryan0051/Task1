import React, { useState } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import './FileUpload.css'

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [summary, setSummary] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setSummary(response.data.summary || 'No summary available.');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container file-upload-container">
      <h2 className="mt-4 text-center">Upload a File to Summarize</h2>
      <div className="mb-3">
        <input type="file" className="form-control file-input" onChange={handleFileChange} />
      </div>
      <button 
        className="btn btn-primary w-100 upload-button" 
        onClick={handleFileUpload} 
        disabled={!file || loading}
      >
        {loading ? 'Uploading...' : 'Upload and Summarize'}
      </button>
      {loading && <ProgressBar progress={uploadProgress} />}
      <div className="content-section file-content-section">
        <h3 className="mt-4">File Content:</h3>
        <pre className="file-content">{fileContent}</pre>
      </div>
      <div className="content-section summary-content-section">
        <h3 className="mt-4">Summary:</h3>
        <pre className="summary-content">{summary}</pre>
      </div>
    </div>
  );
};

export default FileUpload;
