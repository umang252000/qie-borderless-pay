import "./wallet.css";

export default function WalletModal({ onClose, onConnect }: any) {
  return (
    <div className="wallet-backdrop" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="wallet-title">Connect Wallet</h2>

        <div className="wallet-option" onClick={() => onConnect("metamask")}>
          <span>MetaMask</span>
          <img src="https://metamask.io/images/favicon-256.png" width={32} />
        </div>

        <div className="wallet-option" onClick={() => onConnect("qie")}>
          <span>QIE Wallet</span>
          <img src="/qie-logo.png" width={32} />
        </div>

        <div className="wallet-option" onClick={() => onClose()}>
          <span style={{ color: "#f87171" }}>Cancel</span>
        </div>
      </div>
    </div>
  );
}