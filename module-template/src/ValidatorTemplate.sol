// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC7579ValidatorBase, ERC7579HookBase} from "modulekit/Modules.sol";
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";

// Validate a transaction with an already created escrow for a specific game
contract ValidatorTemplate is ERC7579HookBase, ERC7579ValidatorBase {
    /*//////////////////////////////////////////////////////////////////////////
                                    CONSTANTS
    //////////////////////////////////////////////////////////////////////////*/

    // Escrow contract address
    address public immutable ESCROW =
        0x0000000000000000000000000000000000000000;

    struct UserDeposit {
        uint256 amount;
        address token;
        address ESCROW;
    }

    mapping(address => UserDeposit) private userAmountEscrow;

    /*//////////////////////////////////////////////////////////////////////////
                                    CONFIG
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Initialize the module with the given data
     * @param data The data to initialize the module with
     */
    function onInstall(bytes calldata data) external override {
        if (data.length == 0) {
            revert("ValidatorTemplate: data is empty");
        }
        (uint256 amount, address token, address escrow) = abi.decode(
            data,
            (uint256, address, address)
        );
        UserDeposit storage depositAmount = userAmountEscrow[msg.sender];

        depositAmount.amount = amount;
        depositAmount.token = token;
        depositAmount.ESCROW = escrow;
    }

    /**
     * De-initialize the module with the given data
     * @param data The data to de-initialize the module with
     */
    function onUninstall(bytes calldata data) external override {
        if (userAmountEscrow[msg.sender].amount > 0) {
            revert("ValidatorTemplate: deposit amount is not 0");
        }
        delete userAmountEscrow[msg.sender];
    }

    /**
     * Check if the module is initialized
     * @param smartAccount The smart account to check
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) external view returns (bool) {}

    /*//////////////////////////////////////////////////////////////////////////
                                    MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    function preCheck(
        address msgSender,
        bytes calldata msgData
    ) external override returns (bytes memory hookData) {
        hookData = abi.encode(true);
    }

    function postCheck(
        bytes calldata hookData
    ) external override returns (bool success) {
        (success) = abi.decode(hookData, (bool));
    }

    /**
     * Validates PackedUserOperation
     * @param userOp UserOperation to be validated.
     * @param userOpHash Hash of the UserOperation to be validated.
     * @return sigValidationResult the result of the signature validation, which can be:
     *  - 0 if the signature is valid
     *  - 1 if the signature is invalid
     *  - <20-byte> aggregatorOrSigFail, <6-byte> validUntil and <6-byte> validAfter (see ERC-4337
     * for more details)
     */
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) external view override returns (ValidationData) {
        // verify the signature with the user value

        return ValidationData.wrap(0);
    }

    /**
     * Validates an ERC-1271 signature
     * @param sender The sender of the ERC-1271 call to the account
     * @param hash The hash of the message
     * @param signature The signature of the message
     * @return sigValidationResult the result of the signature validation, which can be:
     *  - EIP1271_SUCCESS if the signature is valid
     *  - EIP1271_FAILED if the signature is invalid
     */
    function isValidSignatureWithSender(
        address sender,
        bytes32 hash,
        bytes calldata signature
    ) external view virtual override returns (bytes4 sigValidationResult) {
        return EIP1271_FAILED;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     METADATA
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * The name of the module
     * @return name The name of the module
     */
    function name() external pure returns (string memory) {
        return "ValidatorTemplate";
    }

    /**
     * The version of the module
     * @return version The version of the module
     */
    function version() external pure returns (string memory) {
        return "0.0.1";
    }

    /**
     * Check if the module is of a certain type
     * @param typeID The type ID to check
     * @return true if the module is of the given type, false otherwise
     */
    function isModuleType(
        uint256 typeID
    ) external pure override returns (bool) {
        return typeID == TYPE_HOOK;
    }
}
