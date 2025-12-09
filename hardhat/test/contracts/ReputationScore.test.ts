import { expect } from "chai";
import { deployAll } from "../helpers/deployFixtures";

describe("ReputationScore", function () {

  it("initial score should default to 600", async function () {
    const { reputation, user1 } = await deployAll();
    expect(await reputation.getScore(user1.address)).to.equal(600);
  });

  it("authorized contract can increase score (via LoanPool)", async function () {
    const { reputation, loanPool, user1 } = await deployAll();

    // Create → repay → increases score by +10
    await loanPool.connect(user1).createLoan(1000, 1);
    await loanPool.connect(user1).repay(0, { value: 1050 });

    expect(await reputation.getScore(user1.address)).to.equal(610);
  });

  it("non-authorized caller cannot update score", async function () {
    const { reputation, user1 } = await deployAll();

    await expect(
      reputation.increaseScore(user1.address, 10)
    ).to.be.revertedWith("Not authorized");
  });

  it("score never exceeds 1000", async function () {
    const { reputation, loanPool, user1 } = await deployAll();

    await loanPool.connect(user1).createLoan(1000, 1);

    // Simulate 50 repayments — score should cap at 1000
    for (let i = 0; i < 40; i++) {
      await loanPool.connect(user1).createLoan(1000, 1);
      await loanPool.connect(user1).repay(i, { value: 1050 });
    }

    expect(await reputation.getScore(user1.address)).to.equal(1000);
  });

});