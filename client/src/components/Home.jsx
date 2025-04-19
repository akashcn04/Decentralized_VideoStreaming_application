import { useState, useEffect } from 'react';
import { getAllVideos, initWeb3, getCurrentAccount } from '../utils/web3';
import VideoCard from './VideoCard';
import './Home.css';

export default function Home() {
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
      console.log('Current account:', account); // Debug log
      
      const allVideos = await getAllVideos();
      console.log('Loaded videos:', allVideos); // Debug log
      
      if (Array.isArray(allVideos)) {
        setVideos(allVideos);
      } else {
        console.error('Invalid videos data:', allVideos);
        setError('Failed to load videos. Invalid data format.');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-container">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to watch and upload videos.</p>
          <button className="retry-button" onClick={loadVideos}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <h1 className="home-title">Welcome to DVideo</h1>
          <p className="home-subtitle">
            Discover and share decentralized videos on the blockchain
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="no-videos">
            <p>No videos have been uploaded yet.</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video, index) => (
              <VideoCard key={video.ipfsHash || index} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 