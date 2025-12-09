import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    qie_testnet: {
      url: process.env.QIE_RPC_URL || "",
      chainId: 1983,  // QIE Testnet Chain ID
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: 1000000000, // 1 gwei to avoid estimate problems
      timeout: 100000,
    }
  },
};

export default config;