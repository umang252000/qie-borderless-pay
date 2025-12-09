import { ethers } from "ethers";
import { provider, wallet } from "./provider";
import ReputationScoreJson from "../../abis/ReputationScore.json";

const repAddress = process.env.REPUTATION_SCORE_ADDRESS;

if (!repAddress) throw new Error("ReputationScore address missing in .env");

export const ReputationScore = new ethers.Contract(
  repAddress,
  ReputationScoreJson.abi,
  wallet
);