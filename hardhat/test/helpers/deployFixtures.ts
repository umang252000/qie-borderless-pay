import { ethers } from "hardhat";

export async function deployAll() {
  const [owner, user1, user2, employer, savings] = await ethers.getSigners();

  // Deploy ReputationScore
  const Reputation = await ethers.getContractFactory("ReputationScore");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();

  // Deploy LoanPool
  const LoanPool = await ethers.getContractFactory("LoanPool");
  const loanPool = await LoanPool.deploy(reputation.target);
  await loanPool.waitForDeployment();

  // Authorize LoanPool to update reputation
  await reputation.setAuthorized(loanPool.target, true);

  // Deploy FXEngine
  const FX = await ethers.getContractFactory("FXEngine");
  const fx = await FX.deploy();
  await fx.waitForDeployment();

  // Deploy PayrollEngine
  const Payroll = await ethers.getContractFactory("PayrollEngine");
  const payroll = await Payroll.deploy(fx.target);
  await payroll.waitForDeployment();

  return {
    owner,
    user1,
    user2,
    employer,
    savings,
    reputation,
    loanPool,
    fx,
    payroll
  };
}