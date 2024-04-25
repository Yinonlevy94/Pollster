// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Tether
 * @dev Simple ERC20 Token example, with fixed supply and token characteristics.
 */
contract Tether {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint8 public decimals;

    /**
     * Token distribution to the creator of the contract.
     *
     * @dev Assigns the total supply to the transaction sender, which is the account
     * that is deploying the contract.
     */
    mapping(address => uint256) public balanceOf;

    /**
     * @dev Sets the values for `name`, `symbol`, `totalSupply` and `decimals`.
     * All four of these values are immutable: they can only be set once during
     * construction.
     */
    constructor() {
        name = "Tether";
        symbol = "USDT";
        totalSupply = 1000000000000000000; // 1 billion tokens, assuming 18 decimals
        decimals = 18;
        balanceOf[msg.sender] = totalSupply;
    }
}
