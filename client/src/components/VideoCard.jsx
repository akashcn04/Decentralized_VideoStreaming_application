import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIPFSURL, preloadVideo } from '../utils/ipfs';
import { ethers } from 'ethers';
import { getCurrentAccount, removeVideo } from '../utils/web3';
import './VideoCard.css';

export default function VideoCard({ video }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isUploader, setIsUploader] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { ipfsHash, title, description, uploader, timestamp, price, id } = video;
  const uploadDate = new Date(timestamp * 1000).toLocaleDateString();

  // Format the price from wei to ETH
  const formattedPrice = price ? ethers.utils.formatEther(price) : '0';
  const isPaid = parseFloat(formattedPrice) > 0;

  useEffect(() => {
    const checkUploader = async () => {
      try {
        const account = await getCurrentAccount();
        setIsUploader(account?.toLowerCase() === uploader?.toLowerCase());
      } catch (error) {
        console.error('Error checking uploader:', error);
      }
    };
    checkUploader();
  }, [uploader]);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);

        // Try to preload video metadata
        const success = await preloadVideo(ipfsHash);
        if (!success) {
          throw new Error('Failed to load video metadata');
        }

        // Get the video URL
        const url = await getIPFSURL(ipfsHash);
        setVideoUrl(url);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading video:', error);
        setLoadError(true);
        setIsLoading(false);

        // Retry up to 3 times with increasing delay
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      }
    };

    loadVideo();
  }, [ipfsHash, retryCount]);

  useEffect(() => {
    const getUploaderName = async () => {
      try {
        if (!uploader) {
          setUploaderName('Unknown');
          return;
        }

        // Simply format the address
        setUploaderName(`${uploader.slice(0, 6)}...${uploader.slice(-4)}`);
      } catch (error) {
        console.error('Error getting uploader name:', error);
        setUploaderName(`${uploader.slice(0, 6)}...${uploader.slice(-4)}`);
      }
    };

    getUploaderName();
  }, [uploader]);

  const handleRetry = async (e) => {
    e.preventDefault();
    setRetryCount(0);
    setLoadError(false);
    setIsLoading(true);
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to remove this video?')) {
      return;
    }

    try {
      setRemoving(true);
      await removeVideo(id);
      // Refresh the page or update the video list
      window.location.reload();
    } catch (error) {
      console.error('Error removing video:', error);
      alert('Failed to remove video. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="video-card">
      <Link to={`/video/${video.id || video.ipfsHash}`} className="video-link">
        <div className="video-thumbnail">
          {videoUrl && (
            <video
              src={videoUrl}
              className="thumbnail-video"
              preload="metadata"
              poster={loadError ? '/video-error.png' : undefined}
              muted
              playsInline
            />
          )}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <span>Loading video...</span>
            </div>
          )}
          {loadError && (
            <div className="error-overlay">
              <span>Failed to load video</span>
              <button onClick={handleRetry} className="retry-button">
                Retry
              </button>
            </div>
          )}
          <div className="play-overlay">
            <div className="play-icon">▶</div>
          </div>
          {isPaid && (
            <div className="price-tag">
              {formattedPrice} ETH
            </div>
          )}
        </div>
        <div className="video-info">
          <h3 className="video-title">{title}</h3>
          <p className="video-uploader">{uploaderName}</p>
          <p className="video-date">{uploadDate}</p>
          {isPaid && (
            <p className="video-price">Price: {formattedPrice} ETH</p>
          )}
        </div>
      </Link>
      {isUploader && (
        <button 
          className="remove-button"
          onClick={handleRemove}
          disabled={removing}
        >
          {removing ? 'Removing...' : 'Remove Video'}
        </button>
      )}
    </div>
  );
} 