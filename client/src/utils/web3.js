import { ethers } from 'ethers';
import VideoStorage from '../../../build/contracts/VideoStorage.json';

let contract;
let provider;
let signer;

export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      
      // Use the contract address from environment variables
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not found in environment variables');
      }
      
      contract = new ethers.Contract(contractAddress, VideoStorage.abi, signer);
      return true;
    } catch (error) {
      console.error('Error initializing Web3:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Reset connection state
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    });

    // Request accounts with prompt
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    await initWeb3();
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    // Clear any stored connection data
    provider = null;
    signer = null;
    contract = null;

    // Force MetaMask to forget the connection
    await window.ethereum?.request({
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: {} }]
    });
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    throw error;
  }
};

export const getCurrentAccount = async () => {
  try {
    if (!window.ethereum) return null;
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

export const getContract = async () => {
  if (!contract) {
    await initWeb3();
  }
  return contract;
};

export const getAllVideos = async () => {
  try {
    const contract = await getContract();
    const count = await contract.getVideosCount();
    const videos = [];
    
    console.log('Total videos count:', count.toString()); // Debug log
    
    for (let i = count - 1; i >= 0; i--) { // Reverse order to show newest first
      try {
        const result = await contract.getVideo(i);
        const [ipfsHash, title, description, uploader, timestamp, price] = result;
        
        if (ipfsHash && ipfsHash.length > 0) {
          // Ensure price is a BigNumber
          const priceValue = price ? ethers.BigNumber.from(price) : ethers.BigNumber.from(0);
          
          videos.push({
            id: i.toString(),
            ipfsHash,
            title,
            description,
            uploader,
            timestamp: timestamp.toNumber(),
            price: priceValue
          });
          console.log('Loaded video:', {
            id: i,
            ipfsHash,
            title,
            price: priceValue.toString()
          });
        }
      } catch (error) {
        console.error(`Error loading video ${i}:`, error);
        continue;
      }
    }
    
    return videos;
  } catch (error) {
    console.error('Error getting all videos:', error);
    throw error;
  }
};

export const getVideo = async (videoId) => {
  try {
    const contract = await getContract();
    const result = await contract.getVideo(videoId);
    const [ipfsHash, title, description, uploader, timestamp, price] = result;
    
    return {
      ipfsHash,
      title,
      description,
      uploader,
      timestamp: timestamp.toNumber(),
      price: price || ethers.BigNumber.from(0)
    };
  } catch (error) {
    console.error('Error getting video:', error);
    throw error;
  }
};

export const getUserVideos = async (address) => {
  try {
    const contract = await getContract();
    const videoIds = await contract.getUserVideos(address);
    const videos = [];
    
    console.log('User video IDs:', videoIds.map(id => id.toString())); // Debug log
    
    for (const id of videoIds) {
      try {
        const result = await contract.getVideo(id);
        const [ipfsHash, title, description, uploader, timestamp, price] = result;
        
        if (ipfsHash && ipfsHash.length > 0) {
          // Ensure price is a BigNumber
          const priceValue = price ? ethers.BigNumber.from(price) : ethers.BigNumber.from(0);
          
          videos.push({
            id: id.toString(),
            ipfsHash,
            title,
            description,
            uploader,
            timestamp: timestamp.toNumber(),
            price: priceValue
          });
          console.log('Loaded user video:', {
            id: id.toString(),
            ipfsHash,
            title,
            price: priceValue.toString()
          });
        }
      } catch (error) {
        console.error(`Error loading user video ${id}:`, error);
        continue;
      }
    }
    
    return videos.reverse(); // Show newest first
  } catch (error) {
    console.error('Error getting user videos:', error);
    throw error;
  }
};

export const uploadVideo = async (ipfsHash, title, description, price) => {
  try {
    const contract = await getContract();
    const tx = await contract.uploadVideo(ipfsHash, title, description, price);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const payToWatch = async (videoId, price) => {
  try {
    const contract = await getContract();
    const tx = await contract.payToWatch(videoId, { value: price });
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error paying for video:', error);
    throw error;
  }
};

export const hasUserPaid = async (videoId) => {
  try {
    const contract = await getContract();
    const account = await getCurrentAccount();
    return await contract.hasUserPaid(videoId, account);
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

export const getSigner = () => signer;
export const getProvider = () => provider;

export const getVideosCount = async () => {
  try {
    return await contract.getVideosCount();
  } catch (error) {
    console.error('Error getting videos count:', error);
    throw error;
  }
};

export const removeVideo = async (videoId) => {
  try {
    const contract = await getContract();
    const tx = await contract.removeVideo(videoId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error removing video:', error);
    throw error;
  }
}; 