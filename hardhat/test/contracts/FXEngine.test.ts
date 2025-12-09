import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "ethers";

describe("FXEngine", function () {
  it("converts using oracle prices", async function () {
    const FXEngine = await ethers.getContractFactory("FXEngine");
    const fx = await FXEngine.deploy();

    const MockOracle = await ethers.getContractFactory("MockOracle");

    const oracleUSD = await MockOracle.deploy(1_0000_0000);  // $1
    const oracleINR = await MockOracle.deploy(1_200_000);     // $0.012

    const tokenUSD = "0x1111111111111111111111111111111111111111";
    const tokenINR = "0x2222222222222222222222222222222222222222";

    // Ethers v6 uses .target for contract address
    await fx.setPriceFeed(tokenUSD, oracleUSD.target);
    await fx.setPriceFeed(tokenINR, oracleINR.target);

    const amountInUSD = parseUnits("100", 18);
    const converted = await fx.convert(tokenUSD, tokenINR, amountInUSD);

    // Expected = 100 / 0.012 = approx 8333.33
    const approx = parseUnits("8333", 18);

    expect(converted).to.be.closeTo(approx, approx / 100n);
  });
});