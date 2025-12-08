require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
module.exports = {
  solidity: "0.8.18",
  networks: {
    qieTestnet: {
      url: process.env.QIE_RPC_URL,
      accounts: [process.env.PRIVATE_KEY_Deployer]
    }
  }
};