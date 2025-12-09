// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ReputationScore.sol";

contract LoanPool {
    struct Loan {
        address borrower;
        uint256 principal;
        uint256 interest;     // fixed interest set during creation
        uint256 dueDate;
        bool repaid;
    }

    uint256 public loanCount;
    ReputationScore public reputation;

    mapping(uint256 => Loan) public loans;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 interest,
        uint256 dueDate
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        bool late
    );

    constructor(address reputationAddress) {
        reputation = ReputationScore(reputationAddress);
    }

    /// @notice create a micro-loan
    function createLoan(uint256 principal, uint256 durationDays) external {
        require(principal > 0, "Invalid amount");
        require(durationDays > 0, "Invalid duration");

        uint256 interest = (principal * 5) / 100; // 5% simple interest

        loans[loanCount] = Loan({
            borrower: msg.sender,
            principal: principal,
            interest: interest,
            dueDate: block.timestamp + (durationDays * 1 days),
            repaid: false
        });

        emit LoanCreated(
            loanCount,
            msg.sender,
            principal,
            interest,
            block.timestamp + (durationDays * 1 days)
        );

        loanCount++;
    }

    /// @notice repay loan
    function repay(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];

        require(msg.sender == loan.borrower, "Not borrower");
        require(!loan.repaid, "Already repaid");

        uint256 total = loan.principal + loan.interest;
        require(msg.value >= total, "Insufficient repayment");

        loan.repaid = true;

        bool late = block.timestamp > loan.dueDate;

        if (late) {
            reputation.decreaseScore(loan.borrower, 20);
        } else {
            reputation.increaseScore(loan.borrower, 10);
        }

        emit LoanRepaid(loanId, msg.sender, msg.value, late);
    }

    /// @dev view function for UI
    function getLoan(uint256 loanId)
        external
        view
        returns (
            address borrower,
            uint256 principal,
            uint256 interest,
            uint256 dueDate,
            bool repaid
        )
    {
        Loan storage loan = loans[loanId];
        return (
            loan.borrower,
            loan.principal,
            loan.interest,
            loan.dueDate,
            loan.repaid
        );
    }
}