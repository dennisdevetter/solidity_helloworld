// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0.0;

contract Crowdfunding {

    enum State { Ongoing, Failed, Succeeded, Paidout }

    string public name;
    uint public targetAmount;
    uint public fundingDeadline;
    address payable public beneficiary;
    State public state;
    mapping(address => uint) public amounts;
    bool public collected;

    modifier inState(State expectedState) {
        require(state == expectedState, 'Incorrect crowdfunding state');
        _;
    }

    constructor (
        string memory campaingName,
        uint targetAmountEth, 
        uint durationInMin,
        address payable beneficiaryAddress
    ){
        name = campaingName;
        targetAmount = targetAmountEth * 1 ether;
        fundingDeadline = currentTime() + durationInMin * 1 minutes; // convert to seconds
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;
    }

    receive() external payable inState(State.Ongoing) {
        require(beforeDeadline(), 'Deadline has passed');
        amounts[msg.sender] += msg.value;

        if(totalCollected() >= targetAmount) {
            collected = true;
        }
    }

    function finishCrowdfunding() public inState(State.Ongoing) {
        require(afterDeadline(), 'Deadline has not passed');

        if(!collected) {
            state = State.Failed;
        } else {
            state = State.Succeeded;
        }
    }

    function beforeDeadline() public view returns (bool) {
        return currentTime() < fundingDeadline;
    }

    function afterDeadline() public view returns (bool) {
        return !beforeDeadline();
    }

    function totalCollected() public view returns (uint) {
        return address(this).balance;
    }
 
    function currentTime() private view returns (uint) {
        return block.timestamp; // time in seconds
    }

}