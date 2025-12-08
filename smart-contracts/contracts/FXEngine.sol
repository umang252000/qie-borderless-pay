// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IQIEOracle {
    function latestAnswer() external view returns (int256);
}

contract FXEngine {
    
    IQIEOracle public oracle;

    constructor(address _oracle) {
        oracle = IQIEOracle(_oracle);
    }

    // amount in USD → returns amount in QIE tokens
    function convertUSDToQIE(uint256 amountUSD) public view returns (uint256) {
        int256 price = oracle.latestAnswer(); 
        require(price > 0, "Invalid oracle price");

        // Example: if 1 QIE = $0.10 → price = 0.1 * 1e18
        return (amountUSD * 1e18) / uint256(price);
    }
}