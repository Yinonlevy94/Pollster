pragma solidity ^0.8.0;

contract token {
    address public minter;
    mapping(address => uint) balances;
    constructor(){
        minter = msg.sender;
    }

    function mint(address receiver, uint amount) public{
        require(msg.sender == minter, "Only the minter can mint tokens.");
        balances[receiver] += amount;
    }


    function send(address receiver) public{
        if(balances[msg.sender] < 1)
        revert("you already have voted");
        // Hash sender's and receiver's addresses
        bytes32 senderHash = keccak256(abi.encodePacked(msg.sender));
        bytes32 receiverHash = keccak256(abi.encodePacked(receiver));
        
        // Update balances
        balances[msg.sender] = 0;
        balances[receiver]++;

    }

        function getBalance(address account) public view returns (uint) {
            return balances[account];
    }
    

}