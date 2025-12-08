// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PayrollEngine {

    struct PayrollConfig {
        address wallet;
        uint256 percentSplit;   // e.g. 20 = 20% to savings
        address savingsWallet;
    }

    mapping(address => PayrollConfig) public configs;

    event PayrollSet(address indexed user, uint256 split);
    event SalaryPaid(address indexed user, uint256 amount);

    function setPayroll(uint256 splitPercent, address savingsWallet) external {
        require(splitPercent <= 50, "Max 50% split");
        require(savingsWallet != address(0), "Invalid savings wallet");

        configs[msg.sender] = PayrollConfig({
            wallet: msg.sender,
            percentSplit: splitPercent,
            savingsWallet: savingsWallet
        });

        emit PayrollSet(msg.sender, splitPercent);
    }

    function paySalary(address user) external payable {
        PayrollConfig memory cfg = configs[user];

        uint256 savings = (msg.value * cfg.percentSplit) / 100;
        uint256 main = msg.value - savings;

        payable(cfg.wallet).transfer(main);
        payable(cfg.savingsWallet).transfer(savings);

        emit SalaryPaid(user, msg.value);
    }
}