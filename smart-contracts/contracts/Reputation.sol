// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Reputation {
    
    mapping(address => uint256) public scores;

    event ScoreChanged(address indexed user, uint256 newScore);

    constructor() {
        // Default score for all users
    }

    function getScore(address user) public view returns (uint256) {
        if (scores[user] == 0) return 500;
        return scores[user];
    }

    function addScore(address user, uint256 points) external {
        uint256 newScore = getScore(user) + points;
        if (newScore > 900) newScore = 900;
        scores[user] = newScore;

        emit ScoreChanged(user, newScore);
    }

    function reduceScore(address user, uint256 points) external {
        uint256 base = getScore(user);
        uint256 newScore = (base > points) ? base - points : 300;
        scores[user] = newScore;

        emit ScoreChanged(user, newScore);
    }
}