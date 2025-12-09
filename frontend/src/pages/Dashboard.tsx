import { useEffect, useState } from "react";
import { ethers } from "ethers";
import repABI from "../abis/ReputationScore.json";
import loanABI from "../abis/LoanPool.json";
import { switchToQIE } from "../services/network";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [address, setAddress] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);

  const repAddress = repABI.address;
  const loanAddress = loanABI.address;

  // ---------------------------
  // 1️⃣ Auto-switch to QIE Network
  // ---------------------------
  useEffect(() => {
    const validateNetwork = async () => {
      const ok = await switchToQIE();
      if (!ok) toast.error("Please switch to QIE network to continue");
    };

    validateNetwork();
  }, []);

  // ---------------------------
  // 2️⃣ Load dashboard once connected + on correct chain
  // ---------------------------
  async function loadDashboard() {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user = await signer.getAddress();
    setAddress(user);

    // --- Reputation Score ---
    const rep = new ethers.Contract(repAddress, repABI.abi, provider);
    const userScore = await rep.getScore(user);
    setScore(Number(userScore));

    // --- Loans ---
    const loanContract = new ethers.Contract(loanAddress, loanABI.abi, provider);

    const loanCount = await loanContract.loanCount();
    const items = [];

    for (let i = 0; i < loanCount; i++) {
      const loan = await loanContract.getLoan(i);
      if (loan.borrower.toLowerCase() === user.toLowerCase()) {
        items.push({
          id: i,
          principal: Number(loan.principal),
          interest: Number(loan.interest),
          repaid: loan.repaid,
          due: new Date(Number(loan.dueDate) * 1000).toLocaleString(),
        });
      }
    }

    setLoans(items);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Dashboard</h1>

      {!address && <p>Connect wallet to view your dashboard.</p>}

      {address && (
        <>
          <h3>👤 Address:</h3>
          <p>{address}</p>

          <h3>⭐ Reputation Score:</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{score}</p>

          <h3>💰 Your Loans</h3>
          {loans.length === 0 && <p>No loans found.</p>}

          {loans.map((l) => (
            <div
              key={l.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <p><b>Loan ID:</b> {l.id}</p>
              <p><b>Principal:</b> {l.principal}</p>
              <p><b>Interest:</b> {l.interest}</p>
              <p><b>Due:</b> {l.due}</p>
              <p>
                <b>Status:</b>{" "}
                {l.repaid ? (
                  <span style={{ color: "green" }}>Repaid</span>
                ) : (
                  <span style={{ color: "red" }}>Pending</span>
                )}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}