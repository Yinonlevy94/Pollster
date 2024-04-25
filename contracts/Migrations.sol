// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Migrations{
    address public owner;
    uint public last_completed_migration;

    constructor() {
        owner = msg.sender;
    }

    modifier restricted(){
        if(msg.sender == owner) _;//continue
    }

    function setCompleted(uint completed) public restricted{
        last_completed_migration = completed;
    }

    function update(address new_address) public restricted {
    Migrations updated = Migrations(new_address);
    updated.setCompleted(last_completed_migration);
}

}