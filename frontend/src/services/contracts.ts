import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import type { Signer } from "ethers";

// ------------------ IMPORTANT ------------------
declare global {
  interface Window {
    ethereum?: any;   // MetaMask / OKX
    qieWallet?: any;  // QIE Wallet
  }
}
// ------------------------------------------------

// ABI + Address imports (Hardhat generated)
import ReputationScoreJson from "../abis/ReputationScore.json";
import FXEngineJson from "../abis/FXEngine.json";
import LoanPoolJson from "../abis/LoanPool.json";
import PayrollEngineJson from "../abis/PayrollEngine.json";

// -------------------------------
// WALLET PROVIDERS
// -------------------------------

/**
 * Returns browser wallet provider.
 * Priority:
 * 1. QIE Wallet
 * 2. MetaMask/OKX (window.ethereum)
 */
export function getBrowserProvider(): BrowserProvider {
  if (window.qieWallet) return new BrowserProvider(window.qieWallet);
  if (window.ethereum) return new BrowserProvider(window.ethereum);

  throw new Error("No supported wallet detected (QIE Wallet or MetaMask)");
}

export async function getSigner(): Promise<Signer> {
  const provider = getBrowserProvider();
  return await provider.getSigner();
}

// Read-only provider for UI
export function getReadOnlyProvider() {
  return new JsonRpcProvider("http://127.0.0.1:8545");
}

// -------------------------------
// Contract Helper
// -------------------------------
function getContractInstance(abi: any, address: string, signer?: Signer) {
  if (!address) throw new Error("Contract address missing");
  if (!abi) throw new Error("ABI missing");

  if (signer) return new Contract(address, abi, signer);

  return new Contract(address, abi, getReadOnlyProvider());
}

// -------------------------------
// Contract Loaders
// -------------------------------
export async function getReputationScore() {
  const signer = await getSigner().catch(() => undefined);
  return getContractInstance(ReputationScoreJson.abi, ReputationScoreJson.address, signer);
}

export async function getFXEngine() {
  const signer = await getSigner().catch(() => undefined);
  return getContractInstance(FXEngineJson.abi, FXEngineJson.address, signer);
}

export async function getLoanPool() {
  const signer = await getSigner().catch(() => undefined);
  return getContractInstance(LoanPoolJson.abi, LoanPoolJson.address, signer);
}

export async function getPayrollEngine() {
  const signer = await getSigner().catch(() => undefined);
  return getContractInstance(PayrollEngineJson.abi, PayrollEngineJson.address, signer);
}

// -------------------------------
// Ensure Wallet Connected
// -------------------------------
export async function ensureWalletConnected() {
  const provider = window.qieWallet || window.ethereum;

  if (!provider) {
    throw new Error("Please install QIE Wallet or MetaMask");
  }

  await provider.request({ method: "eth_requestAccounts" });

  // initializes signer for UI
  await getSigner();
}

// -------------------------------
// Generic Loader
// -------------------------------
export async function getContract(name: string) {
  const signer = await getSigner().catch(() => undefined);

  switch (name) {
    case "ReputationScore":
      return getContractInstance(ReputationScoreJson.abi, ReputationScoreJson.address, signer);

    case "FXEngine":
      return getContractInstance(FXEngineJson.abi, FXEngineJson.address, signer);

    case "LoanPool":
      return getContractInstance(LoanPoolJson.abi, LoanPoolJson.address, signer);

    case "PayrollEngine":
      return getContractInstance(PayrollEngineJson.abi, PayrollEngineJson.address, signer);

    default:
      throw new Error(`Unknown contract: ${name}`);
  }
}