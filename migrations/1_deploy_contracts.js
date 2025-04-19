const VideoStorage = artifacts.require("VideoStorage");

module.exports = function (deployer) {
  deployer.deploy(VideoStorage);
}; 