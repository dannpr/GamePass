// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IPaymentVerification} from "@flarenetwork/flare-periphery-contracts/coston/stateConnector/interface/IPaymentVerification.sol";
import {Payment} from "@flarenetwork/flare-periphery-contracts/coston/stateConnector/interface/Payment.sol";
import {FlareContractsRegistryLibrary} from "@flarenetwork/flare-periphery-contracts/coston/util-contracts/ContractRegistryLibrary.sol";

contract PaymentAggregationExample {
    mapping(bytes32 => uint256) public totalReceived;
    mapping(bytes32 => mapping(bytes32 => bool)) public transactionProcessed;

    Payment.Proof[] public processedPayments;

    function isPaymentValid(
        Payment.Proof calldata payment
    ) public view returns (bool) {
        // Use the library to get the verifier contract and verify that is
        return
            FlareContractsRegistryLibrary
                .auxiliaryGetIPaymentVerification()
                .verifyPayment(payment);
    }

    function addPayment(Payment.Proof calldata payment) public {
        // Check with state connector
        require(
            isPaymentValid(payment),
            "Payment is not confirmed by the State Connector"
        );

        // Additional dApp dependent checks

        // We only accept testBTC payments
        require(
            payment.data.sourceId ==
                0x7465737442544300000000000000000000000000000000000000000000000000,
            "Payment made on incorrect chain"
        );

        // We don't want to double count payments
        require(
            transactionProcessed[
                payment.data.responseBody.receivingAddressHash
            ][payment.data.requestBody.transactionId] == false,
            "Payment already processed"
        );
        transactionProcessed[payment.data.responseBody.receivingAddressHash][
            payment.data.requestBody.transactionId
        ] = true;

        if (payment.data.responseBody.receivedAmount > 0) {
            totalReceived[
                payment.data.responseBody.receivingAddressHash
            ] += uint256(payment.data.responseBody.receivedAmount);
        }

        processedPayments.push(payment);
    }
}
