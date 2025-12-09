import { Link } from "react-router-dom";
import WalletButton from "./components/wallet/WalletButton";
import "./App.css";

function App() {
  return (
    <div className="app-container">

      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {/* Left Navigation */}
        <nav style={{ display: "flex", gap: "20px" }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/borrow" className="nav-link">Borrow</Link>
          <Link to="/repay" className="nav-link">Repay</Link>     {/* ⭐ NEW */}
          <Link to="/payroll" className="nav-link">Payroll</Link> {/* ⭐ Payroll */}
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </nav>

        {/* Right Wallet Button */}
        <WalletButton />
      </div>

      {/* Page Body */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h1>QIE Borderless Pay</h1>
        <p>Connect your wallet to begin.</p>
      </div>

    </div>
  );
}

export default App;