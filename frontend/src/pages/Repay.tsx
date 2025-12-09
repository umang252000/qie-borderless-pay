import { useState } from "react";
import { ethers } from "ethers";
import LoanPool from "../abis/LoanPool.json";

const Repay = () => {
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function repayLoan() {
    try {
      if (!window.ethereum) return showToast("Please connect your wallet.", "error");
      if (!loanId || !amount) return showToast("Enter loan ID & amount.", "error");

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(LoanPool.address, LoanPool.abi, signer);

      const tx = await contract.repay(loanId, {
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      showToast("Loan repaid successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Transaction failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="repay-wrapper">

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="repay-card">
        <h2>⚡ Repay Your Loan</h2>
        <p className="subtitle">Pay back borrowed funds and increase your reputation score.</p>

        <div className="input-group">
          <label>Loan ID</label>
          <input
            type="number"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="Enter loan ID"
          />
        </div>

        <div className="input-group">
          <label>Amount (ETH)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter repayment amount"
          />
        </div>

        <button onClick={repayLoan} disabled={loading}>
          {loading ? "Processing..." : "Repay Loan"}
        </button>
      </div>
    </div>
  );
};

export default Repay;