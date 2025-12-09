import { expect } from "chai";
import { ethers } from "hardhat";
import { deployAll } from "../helpers/deployFixtures";

describe("LoanPool", function () {

  it("should create loan", async function () {
    const { loanPool, user1 } = await deployAll();

    await loanPool.connect(user1).createLoan(1000, 1);
    const loan = await loanPool.getLoan(0);

    expect(loan.borrower).to.equal(user1.address);
    expect(loan.principal).to.equal(1000);
  });

  it("should repay loan and increase reputation", async function () {
    const { loanPool, reputation, user1 } = await deployAll();

    await loanPool.connect(user1).createLoan(1000, 1);
    await loanPool.connect(user1).repay(0, { value: 1050 });

    expect(await reputation.getScore(user1.address)).to.equal(610);
  });

  it("repaying late decreases reputation", async function () {
    const { loanPool, reputation, user1 } = await deployAll();

    await loanPool.connect(user1).createLoan(1000, 1);

    // travel 2 days
    await ethers.provider.send("evm_increaseTime", [2 * 86400]);
    await ethers.provider.send("evm_mine", []);

    await loanPool.connect(user1).repay(0, { value: 1050 });

    expect(await reputation.getScore(user1.address)).to.equal(580);
  });

});