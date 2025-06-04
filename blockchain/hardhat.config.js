require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Ensure this matches your contract
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "", // Fallback to empty string if not set
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [], // Only use if PRIVATE_KEY is set
    },
  },
};
