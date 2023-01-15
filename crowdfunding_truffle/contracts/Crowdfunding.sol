// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0.0;

contract Crowdfunding {

    enum State { Ongoing, Failed, Succeeded, Paidout }

    string public name;
    uint public targetAmount;
    uint public fundingDeadline;
    address payable public beneficiary;
    State public state;

    constructor (
        string memory campaingName,
        uint targetAmountEth, 
        uint durationInMin,
        address payable beneficiaryAddress
    ){
        name = campaingName;
        targetAmount * targetAmountEth * 1 ether;
        fundingDeadline = currentTime() + durationInMin * 1 minutes; // convert to seconds
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;
    }

    function currentTime() private view returns (uint) {
        return block.timestamp; // time in seconds
    }

}