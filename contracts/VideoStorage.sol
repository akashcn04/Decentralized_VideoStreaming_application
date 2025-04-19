// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VideoStorage {
    struct Video {
        string ipfsHash;
        string title;
        string description;
        address uploader;
        uint256 timestamp;
        uint256 price; // Price in wei
    }

    Video[] public videos;
    mapping(address => uint256[]) public userVideos;
    mapping(uint256 => mapping(address => bool)) public hasPaid;

    event VideoUploaded(
        uint256 indexed videoId,
        string ipfsHash,
        string title,
        address uploader,
        uint256 price
    );

    event VideoPaid(
        uint256 indexed videoId,
        address viewer,
        uint256 amount
    );

    function uploadVideo(
        string memory _ipfsHash,
        string memory _title,
        string memory _description,
        uint256 _price
    ) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        // Remove price requirement to allow free videos
        
        uint256 videoId = videos.length;
        videos.push(
            Video({
                ipfsHash: _ipfsHash,
                title: _title,
                description: _description,
                uploader: msg.sender,
                timestamp: block.timestamp,
                price: _price
            })
        );

        userVideos[msg.sender].push(videoId);
        emit VideoUploaded(videoId, _ipfsHash, _title, msg.sender, _price);
    }

    function payToWatch(uint256 _videoId) public payable {
        require(_videoId < videos.length, "Video does not exist");
        Video storage video = videos[_videoId];
        
        // Only require payment if the video has a price
        if (video.price > 0) {
            require(msg.value >= video.price, "Insufficient payment");
            require(!hasPaid[_videoId][msg.sender], "Already paid for this video");
            
            // Transfer payment to video uploader
            (bool success, ) = video.uploader.call{value: video.price}("");
            require(success, "Payment transfer failed");
            
            // Mark as paid
            hasPaid[_videoId][msg.sender] = true;
            emit VideoPaid(_videoId, msg.sender, video.price);
        }
    }

    function hasUserPaid(uint256 _videoId, address _user) public view returns (bool) {
        Video storage video = videos[_videoId];
        // Free videos are considered "paid"
        if (video.price == 0) {
            return true;
        }
        return hasPaid[_videoId][_user];
    }

    function getVideo(uint256 _videoId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            address,
            uint256,
            uint256
        )
    {
        require(_videoId < videos.length, "Video does not exist");
        Video memory video = videos[_videoId];
        return (
            video.ipfsHash,
            video.title,
            video.description,
            video.uploader,
            video.timestamp,
            video.price
        );
    }

    function getVideosCount() public view returns (uint256) {
        return videos.length;
    }

    function getUserVideos(address _user) public view returns (uint256[] memory) {
        return userVideos[_user];
    }

    function removeVideo(uint256 _videoId) public {
        require(_videoId < videos.length, "Video does not exist");
        Video storage video = videos[_videoId];
        require(msg.sender == video.uploader, "Only the uploader can remove the video");
        
        // Remove video from user's video list
        uint256[] storage userVideoList = userVideos[msg.sender];
        for (uint256 i = 0; i < userVideoList.length; i++) {
            if (userVideoList[i] == _videoId) {
                userVideoList[i] = userVideoList[userVideoList.length - 1];
                userVideoList.pop();
                break;
            }
        }
        
        // Clear video data
        video.ipfsHash = "";
        video.title = "";
        video.description = "";
        video.price = 0;
    }
} 