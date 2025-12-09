// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFXEngine {
    /// @notice convert amountIn of tokenIn to tokenOut and return amountOut
    /// Implementation can be a view (trusted oracle) or an on-chain swap.
    function convert(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
}

contract PayrollEngine is ReentrancyGuard {
    struct PayrollInstruction {
        address employee;
        address token;          // ERC20 token to pay in
        uint256 grossAmount;    // total amount employer wants to pay (in token units)
        uint8 splitPercent;     // percent to go to savingsWallet (0-100)
        address savingsWallet;  // where split percent goes
        bool executed;
    }

    address public owner; // contract admin (deployer)
    IFXEngine public fxEngine; // optional FX engine
    uint256 public instructionCount;

    // employer => list of instruction ids (for lookup)
    mapping(address => uint256[]) public employerInstructions;
    mapping(uint256 => PayrollInstruction) public instructions;

    event InstructionCreated(
        uint256 indexed instructionId,
        address indexed employer,
        address indexed employee,
        address token,
        uint256 grossAmount,
        uint8 splitPercent,
        address savingsWallet
    );

    event InstructionExecuted(
        uint256 indexed instructionId,
        address indexed employer,
        address indexed employee,
        uint256 netPaidToEmployee,
        uint256 paidToSavings
    );

    event EmployerFunded(address indexed employer, address indexed token, uint256 amount);
    event Withdrawn(address indexed employer, address indexed token, uint256 amount);
    event FXEngineUpdated(address indexed newFxEngine);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyEmployer(uint256 instructionId) {
        // employer is the creator (we'll check via employerInstructions mapping)
        bool found = false;
        uint256[] memory list = employerInstructions[msg.sender];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == instructionId) {
                found = true;
                break;
            }
        }
        require(found, "Not instruction employer");
        _;
    }

    constructor(address _fxEngine) {
        owner = msg.sender;
        fxEngine = IFXEngine(_fxEngine);
    }

    /// @notice Owner can update FX engine (for conversions)
    function setFXEngine(address _fxEngine) external onlyOwner {
        fxEngine = IFXEngine(_fxEngine);
        emit FXEngineUpdated(_fxEngine);
    }

    /// @notice Employer creates a payroll instruction. This doesn't move funds yet.
    function createInstruction(
        address employee,
        address token,
        uint256 grossAmount,
        uint8 splitPercent,
        address savingsWallet
    ) external returns (uint256) {
        require(employee != address(0), "Invalid employee");
        require(token != address(0), "Invalid token");
        require(grossAmount > 0, "Invalid amount");
        require(splitPercent <= 100, "Invalid split");

        uint256 id = instructionCount;
        instructions[id] = PayrollInstruction({
            employee: employee,
            token: token,
            grossAmount: grossAmount,
            splitPercent: splitPercent,
            savingsWallet: savingsWallet,
            executed: false
        });

        employerInstructions[msg.sender].push(id);

        emit InstructionCreated(id, msg.sender, employee, token, grossAmount, splitPercent, savingsWallet);

        instructionCount++;
        return id;
    }

    /// @notice Employer must fund THIS contract with tokens prior to execution.
    /// This function helps standardize employer funding via ERC20 transferFrom.
    function fundEmployer(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit EmployerFunded(msg.sender, token, amount);
    }

    /// @notice Execute payroll instruction. Employer must be the creator and contract must hold sufficient funds.
    /// If fxEngine is set and token conversion is required, the employer can pass tokenToPay that differs from token in instruction.
    function executeInstruction(uint256 instructionId) external nonReentrant {
        // verify instruction exists and employer is msg.sender
        require(instructionId < instructionCount, "Invalid id");

        // find employer by searching mapping - this also ensures only the employer can execute
        bool isEmployer = false;
        uint256[] memory list = employerInstructions[msg.sender];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == instructionId) {
                isEmployer = true;
                break;
            }
        }
        require(isEmployer, "Only employer can execute");

        PayrollInstruction storage inst = instructions[instructionId];
        require(!inst.executed, "Already executed");

        uint256 gross = inst.grossAmount;
        uint8 splitP = inst.splitPercent;
        uint256 toSavings = (gross * splitP) / 100;
        uint256 toEmployee = gross - toSavings;

        // Ensure contract has enough balance of inst.token
        uint256 contractBalance = IERC20(inst.token).balanceOf(address(this));
        require(contractBalance >= gross, "Insufficient funds in contract for this token");

        // Transfer
        if (toEmployee > 0) {
            IERC20(inst.token).transfer(inst.employee, toEmployee);
        }
        if (toSavings > 0 && inst.savingsWallet != address(0)) {
            IERC20(inst.token).transfer(inst.savingsWallet, toSavings);
        }

        inst.executed = true;
        emit InstructionExecuted(instructionId, msg.sender, inst.employee, toEmployee, toSavings);
    }

    /// @notice If employer accidentally overfunded, they can withdraw tokens not yet allocated/executed.
    /// This tries to be permissive but safe: employer can withdraw tokens that are currently free.
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Zero");
        // compute reserved amount for this employer (sum of unexecuted instructions created by employer that use `token`)
        uint256 reserved = 0;
        uint256[] memory list = employerInstructions[msg.sender];
        for (uint256 i = 0; i < list.length; i++) {
            PayrollInstruction memory inst = instructions[list[i]];
            if (!inst.executed && inst.token == token) {
                reserved += inst.grossAmount;
            }
        }

        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        // available = contractBalance - reserved (but can't underflow)
        require(contractBalance >= reserved + amount, "Requested withdraw exceeds available funds");

        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, token, amount);
    }

    /// @notice Emergency function for owner to withdraw tokens (useful for testnet cleanup)
    function ownerWithdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        IERC20(token).transfer(owner, amount);
        emit Withdrawn(owner, token, amount);
    }

    /// @notice View employer reserved amount for a given token
    function reservedAmount(address employer, address token) public view returns (uint256) {
        uint256 reserved = 0;
        uint256[] memory list = employerInstructions[employer];
        for (uint256 i = 0; i < list.length; i++) {
            PayrollInstruction memory inst = instructions[list[i]];
            if (!inst.executed && inst.token == token) {
                reserved += inst.grossAmount;
            }
        }
        return reserved;
    }
}