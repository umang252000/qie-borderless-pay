import { createContext, useContext, useState } from "react";
import { ethers, BrowserProvider } from "ethers";

interface WalletContextType {
  address: string | null;
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;        // MetaMask connect
  connectQie: () => Promise<void>;     // QIE Wallet connect
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  provider: null,
  signer: null,
  connect: async () => {},
  connectQie: async () => {},
});

// -----------------------------
// WALLET PROVIDER
// -----------------------------
export function WalletProvider({ children }: any) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // -----------------------------
  // ⭐ MetaMask Connect
  // -----------------------------
  async function connectMetaMask() {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

    try {
      const prov = new BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);

      const signer = await prov.getSigner();
      const addr = await signer.getAddress();

      setProvider(prov);
      setSigner(signer);
      setAddress(addr);
    } catch (err) {
      console.error("MetaMask error:", err);
    }
  }

  // -----------------------------
  // ⭐ QIE Wallet Connect
  // -----------------------------
  async function connectQie() {
    if (!window.qieWallet) {
      alert("QIE Wallet not detected. Install the QIE Wallet extension.");
      return;
    }

    try {
      await window.qieWallet.request({
        method: "eth_requestAccounts",
      });

      const prov = new BrowserProvider(window.qieWallet);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();

      setProvider(prov);
      setSigner(signer);
      setAddress(addr);

      console.log("Connected to QIE Wallet:", addr);
      alert("QIE Wallet Connected: " + addr);
    } catch (error: any) {
      console.error("QIE Wallet connection error:", error);
      alert("QIE Wallet connection failed: " + error.message);
    }
  }

  // -----------------------------
  // PROVIDER EXPORT
  // -----------------------------
  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        signer,
        connect: connectMetaMask, // MetaMask default
        connectQie,               // QIE Wallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// -----------------------------
// USE WALLET HOOK
// -----------------------------
export function useWallet() {
  return useContext(WalletContext);
}