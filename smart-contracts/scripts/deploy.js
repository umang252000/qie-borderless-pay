const hre = require("hardhat");

async function main() {

    console.log("Deploying Reputation...");
    const Reputation = await hre.ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();
    console.log("Reputation deployed at:", reputation.address);

    console.log("Deploying FXEngine...");
    const Oracle = "<YOUR_QIE_ORACLE_ADDRESS>"; // QIE oracle address here
    const FXEngine = await hre.ethers.getContractFactory("FXEngine");
    const fx = await FXEngine.deploy(Oracle);
    await fx.deployed();
    console.log("FX Engine deployed at:", fx.address);

    console.log("Deploying LoanPool...");
    const LoanPool = await hre.ethers.getContractFactory("LoanPool");
    const loanPool = await LoanPool.deploy(reputation.address, fx.address);
    await loanPool.deployed();
    console.log("LoanPool deployed at:", loanPool.address);

    console.log("🎉 Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});