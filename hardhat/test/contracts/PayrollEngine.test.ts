import { expect } from "chai";
import { ethers } from "hardhat";
import { deployAll } from "../helpers/deployFixtures";
import { parseEther } from "ethers";

describe("PayrollEngine", function () {
  it("creates and executes payroll", async function () {
    const { payroll, employer, user1, savings } = await deployAll();

    const Mock = await ethers.getContractFactory("MockToken");
    const token = await Mock.connect(employer).deploy();

    // Approve the payroll contract to spend tokens
    await token.connect(employer).approve(payroll.target, parseEther("1000"));

    // Fund employer inside the payroll contract
    await payroll.connect(employer).fundEmployer(token.target, parseEther("1000"));

    // Create instruction
    const tx = await payroll.connect(employer).createInstruction(
      user1.address,
      token.target,
      parseEther("100"),
      20,
      savings.address
    );

    // Decode emitted InstructionCreated event
    const receipt = await tx.wait();
    const log = receipt!.logs[0];

    const decoded = payroll.interface.parseLog({
      topics: log.topics,
      data: log.data
    });

    const instructionId = decoded!.args.instructionId;

    // Execute payroll instruction
    await payroll.connect(employer).executeInstruction(instructionId);

    // Check balances
    expect(await token.balanceOf(user1.address)).to.equal(parseEther("80"));
    expect(await token.balanceOf(savings.address)).to.equal(parseEther("20"));
  });
});