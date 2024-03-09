// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC7579ExecutorBase} from "modulekit/Modules.sol";
import {IERC7579Account} from "modulekit/Accounts.sol";
import {ModeLib} from "erc7579/lib/ModeLib.sol";

// Create a escrow of funds for a specific game
contract ExecutorTemplate is ERC7579ExecutorBase {
    /*//////////////////////////////////////////////////////////////////////////
                            CONSTANTS & STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    // Game execution config
    struct ExecutionConfig {
        uint gameUID;
        address winner;
        address executor;
    }

    // Game initiation config
    struct GameInitiationCongif {
        uint gameUID;
        address[] gamers;
        address token;
        uint256 amount;
    }

    // Mapping of game configs
    mapping(address gamerAccount => mapping(uint => GameInitiationCongif))
        internal _config;

    /*//////////////////////////////////////////////////////////////////////////
                                    CONFIG
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Get the config for the given game
     * @param account The account to get the config for
     * @param gameUID The game UID to get the config for
     * @return The config for the given game
     */
    function getInitGameConfig(
        address account,
        uint gameUID
    ) public view returns (GameInitiationCongif memory) {
        return _config[account][gameUID];
    }

    /**
     * Set the config for the given game
     * @param gameUID The game UID to set the config for
     * @param config The config to set from a gamer with the dapp
     */
    function setInitConfig(
        uint gameUID,
        GameInitiationCongif memory config
    ) public {
        GameInitiationCongif existingConfig = getInitGameConfig(
            msg.sender,
            gameUID
        );

        if (existingConfig.amount != 0) {
            revert("Game already running please set another one");
        }

        if (config.gamers.length < 2) {
            revert("Game must have at least 2 players");
        }

        if (config.amountMax < 0) {
            revert("Amount must be greater than 0");
        }

        if (config.executor == address(0)) {
            revert("Executor must be set");
        }

        if (config.token == address(0)) {
            revert("Token must be set");
        }

        _config[msg.sender][gameUID] = config;
    }

    /* Initialize the module with the given data
     * @param data The data to initialize the module with
     */
    function onInstall(bytes calldata data) external override {
        // Decode the data
        if (data.length == 0) return;
        (
            uint gameUID,
            address[] memory gamers,
            address token,
            uint256 amount,
            address executor
        ) = abi.decode(data, (uint, address[], address, uint256, address));

        // Set the config
        setInitConfig(
            gameUID,
            GameInitiationCongif({
                gameUID: gameUID,
                gamers: gamers,
                token: token,
                amount: amount,
                executor: executor
            })
        );
    }
    /* De-initialize the module with the given data
     * @param data The data to de-initialize the module with
     */
    function onUninstall(bytes calldata data) external override {}

    /*
     * Check if the module is initialized
     * @param smartAccount The smart account to check
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) external view returns (bool) {}

    /*//////////////////////////////////////////////////////////////////////////
                                 MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * ERC-7579 does not define any specific interface for executors, so the
     * executor can implement any logic that is required for the specific usecase.
     */

    /*
     * Execute the given data
     * @dev This is an example function that can be used to execute arbitrary data
     * @dev This function is not part of the ERC-7579 standard
     * @param data The data to execute
     */
    function rewardWinner(bytes calldata data) external {
        ExecutionConfig memory executor = abi.decode(data, (ExecutionConfig));

        for (
            uint i = 0;
            i < _config[executor.winner][executor.gameUID].gamers.length;
            i++
        ) {
            smartGamersAccount = IERC7579Account(
                _config[executor.winner][executor.gameUID].gamers[i]
            );

            smartGamersAccount.executeFromExecutor(
                ModeLib.encodeSimpleSingle(),
                ExecutionLib.encodeSingle(
                    _config[executor.winner][executor.gameUID].token,
                    0,
                    abi.encodeCall(
                        IERC20.transfer,
                        (
                            executor.winner,
                            _config[executor.winner][executor.gameUID].amount
                        )
                    )
                )
            );
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    METADATA
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * The name of the module
     * @return name The name of the module
     */
    function name() external pure returns (string memory) {
        return "ExecutorTemplate";
    }

    /**
     * The version of the module
     * @return version The version of the module
     */
    function version() external pure returns (string memory) {
        return "0.0.1";
    }

    /*
     * Check if the module is of a certain type
     * @param typeID The type ID to check
     * @return true if the module is of the given type, false otherwise
     */
    function isModuleType(
        uint256 typeID
    ) external pure override returns (bool) {
        return typeID == TYPE_EXECUTOR;
    }
}
