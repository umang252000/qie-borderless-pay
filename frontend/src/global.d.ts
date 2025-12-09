export {};

declare global {
  interface Window {
    ethereum?: any;  // MetaMask, OKX, Coinbase inject this
  }
}