// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockOracle {
    int256 private price;
    uint8 private _decimals = 8;

    constructor(int256 _price) {
        price = _price;
    }

    function latestAnswer() external view returns (int256) {
        return price;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function setPrice(int256 newPrice) external {
        price = newPrice;
    }
}