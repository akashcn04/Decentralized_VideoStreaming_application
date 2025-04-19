import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentAccount, connectWallet, disconnectWallet } from '../utils/web3';
import './Navbar.css';

export default function Navbar() {
  const [account, setAccount] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkConnection();
    window.ethereum?.on('accountsChanged', checkConnection);
    window.ethereum?.on('disconnect', handleDisconnect);
    
    // Click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.ethereum?.removeListener('accountsChanged', checkConnection);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  const checkConnection = async () => {
    const address = await getCurrentAccount();
    setAccount(address);
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      checkConnection();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setAccount(null);
      setIsDropdownOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand nav-link">
          <img src="/logo.svg" alt="VideoDapp" className="nav-logo" />
          <span>VideoDapp</span>
        </Link>
        {account && (
          <div className="nav-links">
            <Link to="/upload" className="nav-link">Upload Video</Link>
            <Link to="/my-videos" className="nav-link">My Videos</Link>
          </div>
        )}
      </div>
      
      <div className="nav-right">
        {account ? (
          <div className="account-section" ref={dropdownRef}>
            <button 
              className="account-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img src="/metamask-logo.svg" alt="MetaMask" className="metamask-icon" />
              <span>{formatAddress(account)}</span>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleDisconnect} className="dropdown-item disconnect-button">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="connect-button" onClick={handleConnect}>
            <img src="/metamask-logo.svg" alt="MetaMask" className="metamask-icon" />
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
} 