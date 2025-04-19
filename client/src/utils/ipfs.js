// Prioritize CORS-friendly IPFS gateways
const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',      // NFT.Storage - CORS-friendly
  'https://ipfs.io/ipfs/',              // IPFS.io - CORS-friendly
  'https://cloudflare-ipfs.com/ipfs/',  // Cloudflare - CORS-friendly
  'https://dweb.link/ipfs/',            // Protocol Labs - CORS-friendly
  'https://gateway.pinata.cloud/ipfs/'   // Pinata as fallback
];

// Cache successful gateway responses
const gatewayCache = new Map();

const uploadToPinata = async (file) => {
  try {
    console.log('Starting upload to Pinata...');
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Set proper metadata for video files
    if (file.type.startsWith('video/')) {
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          contentType: file.type
        }
      });
      formData.append('pinataMetadata', metadata);
    }

    // Upload to Pinata
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
        'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY
      },
      body: formData
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.details || 'Upload failed');
    }

    console.log('Upload successful. Hash:', data.IpfsHash);
    return data.IpfsHash;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}. Please try again.`);
  }
};

export { uploadToPinata };
export const uploadToIPFS = uploadToPinata;

export const getIPFSURL = async (hash) => {
  if (!hash) return '';

  // Check cache first
  if (gatewayCache.has(hash)) {
    return gatewayCache.get(hash);
  }

  // Try each gateway in sequence until one works
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${hash}`;
      
      // Try to fetch video metadata with no-cors mode first
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (response.ok) {
        console.log('Successfully loaded from gateway:', gateway);
        // Cache the successful gateway URL
        gatewayCache.set(hash, url);
        return url;
      }
    } catch (error) {
      console.warn(`Failed to load from gateway ${gateway}:`, error);
      
      // If CORS error, try with no-cors mode as fallback
      try {
        const noCorsResponse = await fetch(url, {
          method: 'GET',
          mode: 'no-cors'
        });
        
        // If we get here, the gateway is accessible with no-cors
        console.log('Gateway accessible with no-cors:', gateway);
        gatewayCache.set(hash, url);
        return url;
      } catch (noCorsError) {
        console.warn(`Failed no-cors attempt for ${gateway}:`, noCorsError);
      }
      continue;
    }
  }

  // If all gateway checks fail, try using a proxy or CORS-anywhere service
  const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(IPFS_GATEWAYS[0] + hash)}`;
  try {
    const proxyResponse = await fetch(corsProxyUrl);
    if (proxyResponse.ok) {
      const url = IPFS_GATEWAYS[0] + hash;
      gatewayCache.set(hash, url);
      return url;
    }
  } catch (proxyError) {
    console.warn('Failed to use CORS proxy:', proxyError);
  }

  // If everything fails, return the NFT.Storage URL as it's most reliable for CORS
  const fallbackUrl = `${IPFS_GATEWAYS[0]}${hash}`;
  console.warn('All gateway checks failed, using NFT.Storage fallback:', fallbackUrl);
  return fallbackUrl;
};

// Helper function to preload video metadata
export const preloadVideo = async (hash) => {
  if (!hash) return false;
  
  try {
    const url = await getIPFSURL(hash);
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.crossOrigin = 'anonymous';
      
      video.onloadedmetadata = () => {
        video.remove();
        resolve(true);
      };
      
      video.onerror = () => {
        console.error('Error loading video metadata:', video.error);
        video.remove();
        resolve(false);
      };

      // Set source with type
      const source = document.createElement('source');
      source.src = url;
      source.type = 'video/mp4'; // Default to mp4
      video.appendChild(source);
      
      // Append to document temporarily (needed for some browsers)
      document.body.appendChild(video);
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        video.remove();
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    console.error('Error preloading video:', error);
    return false;
  }
};