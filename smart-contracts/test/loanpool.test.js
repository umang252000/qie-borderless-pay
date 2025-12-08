const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanPool", function () {

    let owner, user;
    let reputation, oracle, fx, loanPool;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock oracle
        const OracleMock = await ethers.getContractFactory("OracleMock");
        oracle = await OracleMock.deploy(200000000000000000); // 0.2 USD per QIE (example)

        // Deploy Reputation
        const Reputation = await ethers.getContractFactory("Reputation");
        reputation = await Reputation.deploy();

        // Deploy FXEngine
        const FX = await ethers.getContractFactory("FXEngine");
        fx = await FX.deploy(oracle.address);

        // Deploy LoanPool
        const LoanPool = await ethers.getContractFactory("LoanPool");
        loanPool = await LoanPool.deploy(reputation.address, fx.address);
    });

    it("should allow user to request a loan", async function () {
        await expect(loanPool.connect(user).requestLoan(100))
            .to.emit(loanPool, "LoanRequested");
        
        const loans = await loanPool.getLoans(user.address);
        expect(loans.length).to.equal(1);
    });

    it("should allow user to repay loan", async function () {
        await loanPool.connect(user).requestLoan(100);
        const loans = await loanPool.getLoans(user.address);
        const amount = loans[0].amount;

        const interestPay = amount.add(amount.mul(5).div(100)); // 5% interest

        await expect(
            loanPool.connect(user).repayLoan(0, { value: interestPay })
        ).to.emit(loanPool, "LoanRepaid");
    });

    it("should increase user reputation on timely repayment", async function () {
        await loanPool.connect(user).requestLoan(100);
        const loans = await loanPool.getLoans(user.address);
        const amount = loans[0].amount;
        const repay = amount.add(amount.mul(5).div(100));

        await loanPool.connect(user).repayLoan(0, { value: repay });

        const score = await reputation.getScore(user.address);
        expect(score).to.be.greaterThan(500);
    });
});