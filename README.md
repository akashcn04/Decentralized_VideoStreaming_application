Decentralized Video Streaming Platform (DVideo)
Project Overview
DVideo is a decentralized video streaming platform built on blockchain technology that allows users to upload, share, and monetize video content in a secure and transparent manner. The platform leverages IPFS for decentralized storage and Ethereum blockchain for content management and payments.

Key Features
1. Decentralized Storage
Videos are stored on IPFS (InterPlanetary File System) through Pinata
Content is distributed across the network, ensuring availability and redundancy
No single point of failure for content storage

2. Content Management
Smart contract-based video management system
Each video is uniquely identified by its IPFS hash
Videos can be uploaded, viewed, and removed by content creators
Transparent record of all video uploads and transactions

3. Monetization System
Content creators can set prices for their videos
Pay-per-view model using cryptocurrency
Direct payment from viewers to creators
No intermediary fees or platform cuts
Support for both free and paid content

4. User Features
Content Creators:
Upload videos with custom titles and descriptions
Set viewing prices in ETH
Remove their own content if needed
Track their uploaded videos

Viewers:
Browse available videos
Pay to access premium content
One-time payment for permanent access
View video metadata and creator information

5. Technical Architecture
Frontend (React)
Modern, responsive UI built with React
Video player with loading states and error handling
Wallet integration for Ethereum transactions
Video grid layout for content discovery
User-friendly interface for video management
Smart Contract (Solidity)
Apply
Storage (IPFS + Pinata)
Decentralized storage through IPFS
Pinata gateway for reliable access
Multiple IPFS gateways for redundancy
CORS-friendly gateways for web access

6. Security Features
Only video creators can remove their content
Payment verification through smart contracts
Transparent transaction history
No centralized control over content

7. User Experience
Smooth video loading with retry mechanisms
Clear pricing and payment information
Intuitive video management interface
Responsive design for all devices
Loading states and error handling
Technical Stack
Frontend: React.js, ethers.js
Smart Contract: Solidity
Blockchain: Ethereum
Storage: IPFS, Pinata
Wallet Integration: MetaMask
Styling: CSS
Unique Selling Points
True Decentralization: No central authority controlling content
Direct Creator Revenue: 100% of payments go to creators
Censorship Resistance: Content cannot be removed by third parties
Transparency: All transactions are recorded on the blockchain
Permanent Access: One-time payment for permanent video access
Future Enhancements
Video categories and tags
Creator profiles and channels
Subscription-based content
Video previews and trailers
Social features (comments, likes)
Analytics for creators
Multi-chain support

Project Impact
Empowers content creators with direct monetization
Provides viewers with uncensored content access
Demonstrates practical use of blockchain and IPFS
Showcases decentralized application architecture
Promotes Web3 adoption through user-friendly interface
This project represents a significant step towards decentralized content distribution, combining blockchain technology with IPFS to create a platform that benefits both content creators and viewers while maintaining the principles of decentralization and transparency.
Would you like me to elaborate on any specific aspect of the project or help you prepare a presentation focusing on particular features?



# Decentralized_VideoStreaming_application
This project represents a significant step towards decentralized content distribution, combining blockchain technology with IPFS to create a platform that benefits both content creators and viewers while maintaining the principles of decentralization and transparency.


steps to run:
1) clone the repositary
2)in client directory run npm install [make sure npm is installed]
3)download ganache from google and create workspace in that and start it [network configurations : port 8545 and 1337 network chain]
4)compile the contract in main directory and you will get a contract address..[copy and paste it in .env files present in root and client directory]
5)among given test accounts , take one or if already use it [meta mask account, ganache gives 10 free accounts to test]
6)now go in client and type npm run dev and enjoy
