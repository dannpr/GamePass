// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import {RegistryDeployer} from "modulekit/deployment/RegistryDeployer.sol";

// Import modules here
import {ExecutorTemplate} from "../src/ExecutorTemplate.sol";

/// @title DeployModuleScript
contract DeployModuleScript is Script, RegistryDeployer {
    function run() public {
        // Setup module bytecode, deploy params, and data
        bytes memory bytecode = type(ExecutorTemplate).creationCode;
        bytes memory deployParams = "";
        bytes memory data = "";

        // Get private key for deployment
        vm.startBroadcast(vm.envUint("PK"));

        // Deploy module
        address module = deployModule({
            code: bytecode,
            deployParams: deployParams,
            salt: bytes32(uint256(keccak256(abi.encodePacked("hey")))),
            data: data
        });

        // Stop broadcast and log module address
        vm.stopBroadcast();
        console.log("Deploying module at: %s", module);
    }
}
