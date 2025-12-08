// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Reputation.sol";
import "./FXEngine.sol";

contract LoanPool {
    
    struct Loan {
        uint256 amount;
        uint256 interest;
        uint256 dueDate;
        bool repaid;
    }

    mapping(address => Loan[]) public loans;

    Reputation public reputation;
    FXEngine public fx;

    uint256 public baseInterest = 5; // 5%
    uint256 public loanDuration = 30 days;

    event LoanRequested(address indexed user, uint256 amount, uint256 interest);
    event LoanRepaid(address indexed user, uint256 amount);
    
    constructor(address _reputation, address _fx) {
        reputation = Reputation(_reputation);
        fx = FXEngine(_fx);
    }

    function requestLoan(uint256 amountInUSD) external {
        require(amountInUSD > 0, "Invalid amount");

        // 1) Convert USD to QIE token equivalent using oracle
        uint256 qieAmount = fx.convertUSDToQIE(amountInUSD);

        // 2) Reputation-based interest rate reduction
        uint256 score = reputation.getScore(msg.sender);
        uint256 adjustedInterest = baseInterest;

        if (score > 700) {
            adjustedInterest = 3;   // good users get cheaper loans
        } else if (score > 500) {
            adjustedInterest = 4;
        }

        loans[msg.sender].push(
            Loan({
                amount: qieAmount,
                interest: adjustedInterest,
                dueDate: block.timestamp + loanDuration,
                repaid: false
            })
        );

        emit LoanRequested(msg.sender, qieAmount, adjustedInterest);
    }

    function repayLoan(uint256 index) external payable {
        Loan storage ln = loans[msg.sender][index];
        require(!ln.repaid, "Already repaid");
        require(block.timestamp <= ln.dueDate, "Loan overdue");

        uint256 repayAmount = ln.amount + (ln.amount * ln.interest / 100);
        require(msg.value >= repayAmount, "Insufficient repayment");

        ln.repaid = true;

        // Increase reputation score for timely repayment
        reputation.addScore(msg.sender, 20);

        emit LoanRepaid(msg.sender, repayAmount);
    }

    function getLoans(address user) external view returns (Loan[] memory) {
        return loans[user];
    }
}