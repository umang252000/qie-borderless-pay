import { useState } from "react";
import WalletModal from "./WalletModal";
import { useWallet } from "./useWallet";

export default function WalletButton() {
  const { address, connect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  // 🔵 NEW: QIE Wallet handler
  async function connectQIEWallet() {
    alert("QIE Wallet support will be added soon...");
    // Later: integrate QIE SDK here
  }

  // Called when selecting Metamask / QIE inside modal
  async function handleConnect(option: string) {
    if (option === "metamask") {
      await connect(); // global metamask connect
    }

    if (option === "qie") {
      await connectQIEWallet();
    }

    setShowModal(false);
  }

  return (
    <>
      {/* If connected */}
      {address ? (
        <button className="connected-btn">
          {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </button>
      ) : (
        <button 
          onClick={() => setShowModal(true)} 
          className="connect-btn"
        >
          Connect Wallet
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <WalletModal
          onClose={() => setShowModal(false)}
          onConnect={handleConnect}
        />
      )}
    </>
  );
}
