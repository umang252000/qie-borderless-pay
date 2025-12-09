// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Minimal interface for QIE or Chainlink-style oracle
interface IPriceFeed {
    function latestAnswer() external view returns (int256);
    function decimals() external view returns (uint8);
}

contract FXEngine {
    address public owner;

    // token => oracle feed address
    mapping(address => address) public priceFeeds;

    event PriceFeedUpdated(address indexed token, address indexed feed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Wire a token to its oracle price feed
    function setPriceFeed(address token, address feed) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(feed != address(0), "Invalid feed");
        priceFeeds[token] = feed;
        emit PriceFeedUpdated(token, feed);
    }

    /// @notice Get latest price of token (USD or QIE-based depending on feed)
    function getPrice(address token) public view returns (uint256) {
        address feed = priceFeeds[token];
        require(feed != address(0), "Feed not set");

        int256 answer = IPriceFeed(feed).latestAnswer();
        require(answer > 0, "Invalid oracle answer");

        uint8 dec = IPriceFeed(feed).decimals();

        return uint256(answer) * (10 ** (18 - dec));  
        // Normalize price to 18 decimals
    }

    /// @notice Convert tokenIn → tokenOut amount based on oracle price ratio
    function convert(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        require(amountIn > 0, "Zero amount");

        uint256 priceIn = getPrice(tokenIn);     // in 1e18
        uint256 priceOut = getPrice(tokenOut);   // in 1e18

        // Convert amountIn to USD-value (normalized)
        uint256 value = (amountIn * priceIn) / 1e18;

        // USD-value → amountOut in tokenOut units
        amountOut = (value * 1e18) / priceOut;
    }
}