import { useState, useEffect } from 'react';
import { getUserVideos, getCurrentAccount, initWeb3 } from '../utils/web3';
import VideoCard from './VideoCard';
import './MyVideos.css';

export default function MyVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVideos();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', loadVideos);
      window.ethereum.on('chainChanged', loadVideos);
    }

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', loadVideos);
        window.ethereum.removeListener('chainChanged', loadVideos);
      }
    };
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError('');
      
      await initWeb3();
      const account = await getCurrentAccount();
      
      if (!account) {
        setError('Please connect your wallet');
        return;
      }
      
      console.log('Loading videos for account:', account); // Debug log
      const userVideos = await getUserVideos(account);
      console.log('Loaded user videos:', userVideos); // Debug log
      
      if (Array.isArray(userVideos)) {
        setVideos(userVideos);
      } else {
        console.error('Invalid videos data:', userVideos);
        setError('Failed to load videos. Invalid data format.');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Error loading videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-videos-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading your videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-videos-container">
        <div className="error-container">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to access your uploaded videos.</p>
          <button className="retry-button" onClick={loadVideos}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="my-videos-container">
        <div className="no-videos">
          <h2>No Videos Yet</h2>
          <p>Start sharing your content with the world!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-videos-container">
      <div className="my-videos-content">
        <div className="my-videos-header">
          <h1 className="my-videos-title">My Videos</h1>
          <p className="my-videos-subtitle">
            Manage and view your uploaded content
          </p>
        </div>

        <div className="videos-grid">
          {videos.map((video) => (
            <VideoCard key={video.ipfsHash || video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
} 