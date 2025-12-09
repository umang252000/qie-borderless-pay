import { ethers } from "ethers";
import path from "path";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

// Path to Hardhat ABI
const ABI_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "hardhat",
  "artifacts",
  "contracts",
  "ReputationScore.sol",
  "ReputationScore.json"
);

async function loadABI() {
  const raw = await fs.readFile(ABI_PATH, "utf8");
  const json = JSON.parse(raw);
  return json;
}

export async function getRiskScore(walletAddress: string) {
  if (!process.env.RPC_URL) {
    throw new Error("RPC_URL missing in backend .env");
  }

  const artifact = await loadABI();

  const provider = new ethers.JsonRpcProvider(process.env.QIE_RPC_URL);

  const contract = new ethers.Contract(
    process.env.REPUTATION_SCORE_ADDRESS!,
    artifact.abi,
    provider
  );

  // Call public mapping "scores(address)"
  const repRaw = await contract.scores(walletAddress);

  const rep = Number(repRaw);

  // ----- Basic Model -----
  let score = 700 + rep * 2;

  if (score > 900) score = 900;
  if (score < 300) score = 300;

  return {
    address: walletAddress,
    reputation: rep,
    riskScore: score,
  };
}