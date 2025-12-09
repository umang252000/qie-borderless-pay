import hre from "hardhat";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.join(__dirname, "..", "..", "frontend", "src", "abis");
const MANIFEST = path.join(__dirname, "..", "deployments.json");

// ---------------------
// Save ABI + Address
// ---------------------
async function saveFrontendFiles(name, contract) {
  await fs.mkdir(FRONTEND_DIR, { recursive: true });

  const artifact = await hre.artifacts.readArtifact(name);

  const data = {
    address: contract.target,     // <-- IMPORTANT for Ethers v6
    abi: artifact.abi,
  };

  await fs.writeFile(
    path.join(FRONTEND_DIR, `${name}.json`),
    JSON.stringify(data, null, 2)
  );

  console.log(`→ Saved ABI + address for ${name}`);
}

// ---------------------
// Deploy Helper (v6)
// ---------------------
async function deployContract(name, args = []) {
  console.log(`\nDeploying ${name}...`);
  
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.deploy(...args);

  await contract.waitForDeployment();      // <-- v6 required

  console.log(`${name} deployed at: ${contract.target}`);
  return contract;
}

// ---------------------
// Main Deploy Script
// ---------------------
async function main() {
  console.log("🚀 Running Multi-Contract Deployment");
  console.log("Network:", hre.network.name);

  const deployed = {};

  // 1) ReputationScore
  const rep = await deployContract("ReputationScore");
  deployed.ReputationScore = rep.target;
  await saveFrontendFiles("ReputationScore", rep);

  // 2) FXEngine
  const fx = await deployContract("FXEngine", []);
  deployed.FXEngine = fx.target;
  await saveFrontendFiles("FXEngine", fx);

  // 3) LoanPool — constructor needs ONLY reputation address
  const loan = await deployContract("LoanPool", [rep.target]);
  deployed.LoanPool = loan.target;
  await saveFrontendFiles("LoanPool", loan);

  // 4) PayrollEngine — constructor needs ONLY FXEngine address
  const payroll = await deployContract("PayrollEngine", [fx.target]);
  deployed.PayrollEngine = payroll.target;
  await saveFrontendFiles("PayrollEngine", payroll);

  // Save manifest
  await fs.writeFile(
    MANIFEST,
    JSON.stringify(
      {
        network: hre.network.name,
        timestamp: Date.now(),
        deployed,
      },
      null,
      2
    )
  );

  console.log("\n✨ Deployment Complete!");
}

main().catch((err) => {
  console.error("Deploy script failed:", err);
  process.exit(1);
});