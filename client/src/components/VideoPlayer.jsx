import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getVideo, payToWatch, hasUserPaid, getCurrentAccount } from '../utils/web3';
import { getIPFSURL } from '../utils/ipfs';
import { ethers } from 'ethers';
import './VideoPlayer.css';

export default function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPaid, setHasPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is connected
      const account = await getCurrentAccount();
      if (!account) {
        setError('Please connect your wallet to watch videos');
        return;
      }
      setCurrentAccount(account);

      // Get video data
      const result = await getVideo(id);
      if (!result) {
        setError('Video not found');
        return;
      }

      // Extract video data
      const videoData = {
        ipfsHash: result.ipfsHash,
        title: result.title,
        description: result.description,
        uploader: result.uploader,
        timestamp: result.timestamp,
        price: result.price || ethers.BigNumber.from(0)
      };

      console.log('Video data loaded:', {
        ...videoData,
        price: videoData.price.toString()
      });

      setVideo(videoData);

      // Check if user has paid or is the uploader
      const paid = await hasUserPaid(id);
      const isUploader = account.toLowerCase() === videoData.uploader.toLowerCase();
      setHasPaid(paid || isUploader); // User has access if they paid or are the uploader

      // Get video URL
      const url = await getIPFSURL(videoData.ipfsHash);
      setVideoUrl(url);
    } catch (error) {
      console.error('Error loading video:', error);
      setError('Failed to load video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!video?.price) {
      setError('Invalid video price');
      return;
    }

    try {
      setPaying(true);
      setError('');
      await payToWatch(id, video.price);
      setHasPaid(true);
    } catch (error) {
      console.error('Error paying for video:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    const videoElement = videoRef.current;
    if (videoElement) {
      console.error('Video error details:', {
        error: videoElement.error,
        networkState: videoElement.networkState,
        readyState: videoElement.readyState
      });
    }
    setError('Error playing video. Please try refreshing the page.');
  };

  const retryVideo = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.load();
    }
  };

  if (loading) {
    return (
      <div className="video-player-container">
        <div className="loading">
          <div className="loading-spinner" />
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-container">
        <div className="error">
          <h2>Video Error</h2>
          <p>{error}</p>
          <button onClick={retryVideo} className="retry-button">
            Retry Playback
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-player-container">
        <div className="error">
          <h2>Video Not Found</h2>
          <p>The requested video could not be found.</p>
        </div>
      </div>
    );
  }

  const isUploader = currentAccount?.toLowerCase() === video.uploader.toLowerCase();

  return (
    <div className="video-player-container">
      {!hasPaid && video.price.gt(0) && !isUploader ? (
        <div className="payment-prompt">
          <h2>Pay to Watch</h2>
          <p>Price: {ethers.utils.formatEther(video.price)} ETH</p>
          <p className="payment-info">Payment will be transferred to the video uploader</p>
          <button
            onClick={handlePayment}
            disabled={paying}
            className="pay-button"
          >
            {paying ? 'Processing Payment...' : `Pay ${ethers.utils.formatEther(video.price)} ETH`}
          </button>
        </div>
      ) : (
        <div className="video-content">
          <h1 className="video-title">{video.title}</h1>
          <div className="video-wrapper">
            {videoUrl && (
              <video
                ref={videoRef}
                className="video-element"
                controls
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                onError={handleVideoError}
                controlsList="nodownload"
                onLoadedMetadata={() => {
                  console.log('Video metadata loaded successfully');
                }}
                onLoadStart={() => {
                  console.log('Video started loading');
                }}
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="video-details">
            <p className="video-uploader">
              {isUploader ? 'Uploaded by: You' : `Uploaded by: ${video.uploader.slice(0, 6)}...${video.uploader.slice(-4)}`}
            </p>
            <p className="video-description">{video.description}</p>
            <p className="video-date">
              Uploaded on: {new Date(video.timestamp * 1000).toLocaleDateString()}
            </p>
            {video.price.gt(0) && (
              <p className="video-price">
                Price: {ethers.utils.formatEther(video.price)} ETH
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 