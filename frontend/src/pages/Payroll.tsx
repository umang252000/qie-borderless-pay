import { useState } from "react";
import { ethers } from "ethers";
import { getPayrollEngine } from "../services/contracts";

export default function Payroll() {
  const [employee, setEmployee] = useState("");
  const [token, setToken] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [splitPercent, setSplitPercent] = useState("");
  const [savingsWallet, setSavingsWallet] = useState("");
  const [instructionId, setInstructionId] = useState("");
  const [info, setInfo] = useState<any | null>(null);

  // ---- CREATE INSTRUCTION ----
  async function createInstruction() {
    try {
      const payroll = await getPayrollEngine();

      const tx = await payroll.createInstruction(
        employee,
        token,
        ethers.parseUnits(grossAmount, 18),
        parseInt(splitPercent),
        savingsWallet
      );

      await tx.wait();
      alert("Payroll instruction created!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  // ---- FUND EMPLOYER ----
  async function fundEmployer() {
    try {
      const payroll = await getPayrollEngine();
      const signer = await payroll.runner; // ethers v6: runner = signer/provider

      const erc20 = new ethers.Contract(
        token,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer
      );

      const amount = ethers.parseUnits(grossAmount, 18);

      // approve
      await (await erc20.approve(payroll.target, amount)).wait();

      // fund contract
      await (await payroll.fundEmployer(token, amount)).wait();

      alert("Employer funded!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  // ---- EXECUTE ----
  async function executeInstruction() {
    try {
      const payroll = await getPayrollEngine();

      const tx = await payroll.executeInstruction(parseInt(instructionId));
      await tx.wait();

      alert("Payroll executed!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  // ---- LOAD INFO ----
  async function loadInfo() {
    try {
      const payroll = await getPayrollEngine();
      const data = await payroll.instructions(parseInt(instructionId));
      setInfo(data);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Payroll Automation</h1>

      {/* CREATE INSTRUCTION */}
      <div className="card">
        <h2>Create Instruction</h2>

        <input placeholder="Employee Address" value={employee}
               onChange={(e) => setEmployee(e.target.value)} />

        <input placeholder="ERC20 Token Address" value={token}
               onChange={(e) => setToken(e.target.value)} />

        <input placeholder="Gross Amount" value={grossAmount}
               onChange={(e) => setGrossAmount(e.target.value)} />

        <input placeholder="Split Percentage (0–100)" value={splitPercent}
               onChange={(e) => setSplitPercent(e.target.value)} />

        <input placeholder="Savings Wallet" value={savingsWallet}
               onChange={(e) => setSavingsWallet(e.target.value)} />

        <button onClick={createInstruction}>Create</button>
      </div>

      {/* FUND EMPLOYER */}
      <div className="card">
        <h2>Fund Employer</h2>
        <button onClick={fundEmployer}>Fund Contract</button>
      </div>

      {/* EXECUTE PAYROLL */}
      <div className="card">
        <h2>Execute Payroll</h2>
        <input placeholder="Instruction ID" value={instructionId}
               onChange={(e) => setInstructionId(e.target.value)} />
        <button onClick={executeInstruction}>Execute</button>
      </div>

      {/* VIEW */}
      <div className="card">
        <h2>View Instruction</h2>
        <button onClick={loadInfo}>Load Info</button>

        {info && (
          <div>
            <p><b>Employee:</b> {info.employee}</p>
            <p><b>Token:</b> {info.token}</p>
            <p><b>Amount:</b> {info.grossAmount.toString()}</p>
            <p><b>Executed:</b> {info.executed ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </div>
  );
}