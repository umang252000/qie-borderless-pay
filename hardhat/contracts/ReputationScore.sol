// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReputationScore {

    mapping(address => uint256) private scores;
    mapping(address => bool) public authorized;

    address public owner;

    event ScoreIncreased(address indexed user, uint256 newScore);
    event ScoreDecreased(address indexed user, uint256 newScore);
    event Authorized(address indexed contractAddress, bool status);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorized[msg.sender], "Not authorized");
        _;
    }

    /// @notice Set LoanPool or other contracts as authorized caller
    function setAuthorized(address caller, bool status) external onlyOwner {
        authorized[caller] = status;
        emit Authorized(caller, status);
    }

    /// @notice Get the current score (default 600)
    function getScore(address user) public view returns (uint256) {
        uint256 score = scores[user];
        return score == 0 ? 600 : score;
    }

    /// @notice LoanPool calls this when a user repays on time
    function increaseScore(address user, uint256 amount)
        external
        onlyAuthorized
    {
        uint256 current = getScore(user);
        uint256 newScore = current + amount;

        if (newScore > 1000) newScore = 1000;

        scores[user] = newScore;
        emit ScoreIncreased(user, newScore);
    }

    /// @notice LoanPool calls when a user repays late
    function decreaseScore(address user, uint256 amount)
        external
        onlyAuthorized
    {
        uint256 current = getScore(user);
        uint256 newScore = current > amount ? current - amount : 0;

        scores[user] = newScore;
        emit ScoreDecreased(user, newScore);
    }
}