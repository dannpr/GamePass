// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IEVMTransactionVerification} from "@flarenetwork/flare-periphery-contracts/coston/stateConnector/interface/IEVMTransactionVerification.sol";
import {EVMTransaction} from "@flarenetwork/flare-periphery-contracts/coston/stateConnector/interface/EVMTransaction.sol";
import {FlareContractsRegistryLibrary} from "@flarenetwork/flare-periphery-contracts/coston/util-contracts/ContractRegistryLibrary.sol";


struct EventInfo {
    address sender;
    uint256 value;
    bytes data;
}

struct BalanceInfo {
    address holder;
    address token;
    uint256 amount;
    uint64 blockNumber;
    uint64 timestamp;
    EVMTransaction.Event rawEvent;
    bytes32 proofHash;
}

contract ERC20BalanceMonitor {

    mapping(uint256 => BalanceInfo) public balances; // blockNumber => BalanceInfo

    function isEVMTransactionProofValid(
        EVMTransaction.Proof calldata transaction
    ) public view returns (bool) {
        // Use the library to get the verifier contract and verify that this transaction was proved by state connector
        return FlareContractsRegistryLibrary
                .auxiliaryGetIEVMTransactionVerification()
                .verifyEVMTransaction(transaction);
    }


    /*
    The function assumes that the event emitted in the eventIndex is the result of checking the balance of specific ERC20 token as emitted by FallbackWithEventContract (see previous blogpost).
    The main idea is to first emit the event checking the balance and then properly decode it
    */
    function confirmBalanceEvent(EVMTransaction.Proof calldata transaction, address tokenAddress, address targetAddress, uint256 eventIndex) public
    {
        // We explicitly ignore the proof here, but in production code, you should always verify the proof
        // We ignore it so we can test the whole contract much faster on the same network using only the 
        // In this blogpost we will just use the `prepareResponse` endpoint which has everything we need but the proof
        require(
            true || isEVMTransactionProofValid(transaction),
            "Invalid proof"
        );

        EVMTransaction.Event memory _event = transaction.data.responseBody.events[eventIndex];
        // This just check the happy path - do kkep in mind, that this can possibly faked
        // And keep in mind that the specification does not require the topic0 to be event signature
        require(
            _event.topics[0] == keccak256("CallResult(address,bool,bytes,bytes)"),
            "Invalid event"
        );

        // _event.emitterAddress should be the contract we "trust" to correctly call the ERC20 token

        (address target, bool result, bytes memory callData, bytes memory returnData) = abi.decode(
            _event.data,
            (address, bool, bytes, bytes)
        );

        require(target == tokenAddress, "Invalid token address");


        bytes memory expectedCalldata = abi.encodeWithSignature("balanceOf(address)", targetAddress);
        require(
            keccak256(callData) == keccak256(expectedCalldata),
            "Invalid calldata"
        );
         // If a tuple was returned from the call, we can unpack it using abi.decode in the same way as in the event data decoding
        uint256 balance = abi.decode(returnData, (uint256));

        balances[transaction.data.responseBody.blockNumber] = BalanceInfo({
            holder: targetAddress,
            token: tokenAddress,
            amount: balance,
            blockNumber: transaction.data.responseBody.blockNumber,
            timestamp: transaction.data.responseBody.timestamp,
            rawEvent: _event,
            proofHash: keccak256(abi.encode(transaction))
        });
    }
}
