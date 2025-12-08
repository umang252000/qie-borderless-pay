// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract OracleMock {
    int256 public price;

    constructor(int256 _price) {
        price = _price;
    }

    function latestAnswer() external view returns (int256) {
        return price;
    }

    function setPrice(int256 _p) external {
        price = _p;
    }
}