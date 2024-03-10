// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// A simple contract that accepts anything and emits event about information
contract FallbackWithEventContract {

    address public owner;

    event CallResult(address target, bool result, bytes data, bytes returnData);

    constructor() {
        owner = msg.sender;
    }

    function getState(address target, bytes calldata cdata) external payable {
        // Just forward the call to the contract we want to interact with
        // Caution - this is very unsafe, as the calldata can be anything
        // If this contract were to had some tokens for example, the calldata could be used to transfer them.
        (bool result, bytes memory returnData) = target.call{value: msg.value}(cdata);
        emit CallResult(target, result, cdata, returnData);
        // A bit safer way would be to only allow specific functions to be called or use something like this: https://github.com/gnosis/util-contracts/blob/main/contracts/storage/StorageAccessible.sol
    }

    function destroy() public {
        require(msg.sender == owner, "You are not the owner");
        selfdestruct(payable(owner));
    }
}
