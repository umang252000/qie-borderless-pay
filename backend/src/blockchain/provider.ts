import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL missing in .env");
}

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export const wallet = new ethers.Wallet(
  process.env.DEPLOYER_PRIVATE_KEY!,
  provider
);