import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadToPinata } from '../utils/ipfs';
import { uploadVideo } from '../utils/web3';
import { useNavigate } from 'react-router-dom';
import './Upload.css';
import { ethers } from 'ethers';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || !description.trim() || !price) {
      setError('Please fill in all fields and select a video file.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(price);

      // Upload to IPFS
      const ipfsHash = await uploadToPinata(file);
      
      // Upload to blockchain with price
      await uploadVideo(ipfsHash, title, description, priceInWei);
      
      setSuccess('Video uploaded successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error uploading video:', error);
      setError(error.message || 'Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <div className="upload-header">
          <h1 className="upload-title">Upload Video</h1>
          <p className="upload-subtitle">
            Share your video with the decentralized world
          </p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              className="form-input form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">Price (ETH)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in ETH"
              className="form-input"
              step="0.0001"
              min="0.0001"
              required
            />
          </div>

          <div className="form-group">
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
            >
              <input {...getInputProps()} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="upload-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="dropzone-text">
                {isDragActive
                  ? 'Drop the video here'
                  : 'Drag & drop your video here'}
              </p>
              <p className="dropzone-subtext">
                or click to select (max 100MB)
              </p>
            </div>

            {file && (
              <div className="selected-file">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="file-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            disabled={uploading || !file}
            className="upload-button"
          >
            {uploading ? (
              <div className="loading-spinner" />
            ) : (
              'Upload Video'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 