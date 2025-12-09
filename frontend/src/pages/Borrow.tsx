import { useState, useEffect } from "react";
import {
  ensureWalletConnected,
  getLoanPool
} from "../services/contracts";
import { fetchRisk } from "../services/api";
import { useWallet } from "../components/wallet/useWallet"; 
import { ethers } from "ethers";

export default function Borrow() {
  const { address } = useWallet();

  // ---------------- RISK SCORE ----------------
  const [risk, setRisk] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;

    fetchRisk(address).then((data) => {
      setRisk(data.risk);
    });
  }, [address]);

  // ---------------- LOAN STATE ----------------
  const [principal, setPrincipal] = useState("");
  const [days, setDays] = useState("");
  const [loanId, setLoanId] = useState("");
  const [loanInfo, setLoanInfo] = useState<any | null>(null);

  // ---------------- CREATE LOAN ----------------
  async function createLoan() {
    try {
      if (!principal || !days) {
        alert("Enter principal and duration.");
        return;
      }

      await ensureWalletConnected();
      const loanPool = await getLoanPool();

      const principalWei = ethers.parseEther(principal);

      const tx = await loanPool.createLoan(principalWei, Number(days));
      await tx.wait();

      alert("Loan created successfully!");
    } catch (e: any) {
      alert("Error: " + e.message);
      console.error(e);
    }
  }

  // ---------------- FETCH LOAN DETAILS ----------------
  async function fetchLoan() {
    try {
      if (!loanId) return alert("Enter Loan ID");

      const loanPool = await getLoanPool();
      const info = await loanPool.getLoan(Number(loanId));

      setLoanInfo({
        borrower: info[0],
        principal: info[1],
        interest: info[2],
        dueDate: info[3],
        repaid: info[4],
      });
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  // ---------------- REPAY LOAN ----------------
  async function repayLoan() {
    try {
      if (!loanId) return alert("Enter Loan ID");

      await ensureWalletConnected();
      const loanPool = await getLoanPool();

      const info = await loanPool.getLoan(Number(loanId));
      const total = info.principal + info.interest; // bigint

      const tx = await loanPool.repay(Number(loanId), {
        value: total.toString(),
      });

      await tx.wait();
      alert("Loan repaid!");
    } catch (e: any) {
      alert("Error: " + e.message);
      console.error(e);
    }
  }

  return (
    <div className="page" style={{ padding: "20px" }}>
      <h1>Borrow Funds</h1>

      {/* ------------------- RISK SCORE ------------------- */}
      <div className="card">
        <h2>Your Risk Score</h2>
        {address ? (
          risk !== null ? (
            <p>
              Your Risk Score: <strong>{risk}</strong>
            </p>
          ) : (
            <p>Loading risk score...</p>
          )
        ) : (
          <p>Connect wallet to load risk score.</p>
        )}
      </div>

      {/* ------------------- CREATE LOAN ------------------- */}
      <div className="card">
        <h2>Create Loan</h2>

        <input
          placeholder="Principal (ETH)"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />

        <input
          placeholder="Duration (days)"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />

        <button onClick={createLoan}>Create Loan</button>
      </div>

      {/* ------------------- FETCH DETAILS ------------------- */}
      <div className="card">
        <h2>Loan Details</h2>

        <input
          placeholder="Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
        />

        <button onClick={fetchLoan}>Fetch Loan</button>

        {loanInfo && (
          <div className="info">
            <p><b>Borrower:</b> {loanInfo.borrower}</p>
            <p><b>Principal:</b> {loanInfo.principal.toString()}</p>
            <p><b>Interest:</b> {loanInfo.interest.toString()}</p>
            <p>
              <b>Due:</b>{" "}
              {new Date(Number(loanInfo.dueDate) * 1000).toLocaleString()}
            </p>
            <p><b>Repaid:</b> {loanInfo.repaid ? "Yes" : "No"}</p>
          </div>
        )}
      </div>

      {/* ------------------- REPAY LOAN ------------------- */}
      <div className="card">
        <h2>Repay Loan</h2>
        <button onClick={repayLoan}>Repay</button>
      </div>
    </div>
  );
}