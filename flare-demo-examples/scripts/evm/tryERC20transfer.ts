import flareLib = require("@flarenetwork/flare-periphery-contract-artifacts");
import "dotenv/config";

import hardhat, { ethers } from "hardhat";
import { requestVerification, sleep } from "../../lib/utils";
import { MintableERC20Contract } from "../../typechain-types";

const randomEthereumAddress = "0xFf02F742106B8a25C26e65C1f0d66BEC3C90d429";

const { EVM_VERIFIER_URL, ATTESTATION_API_KEY, ATTESTATION_URL } = process.env;

const MintableERC20: MintableERC20Contract = artifacts.require("MintableERC20");

// Simple hex encoding
function toHex(data: string): string {
    var result = "";
    for (var i = 0; i < data.length; i++) {
        result += data.charCodeAt(i).toString(16);
    }
    return "0x" + result.padEnd(64, "0");
}


interface AttestationResponse {
    abiEncodedRequest: string;
    status: string;
}

interface EVMRequestBody {
    transactionHash: string,
    requiredConfirmations: string,
    provideInput: boolean,
    listEvents: boolean,
    logIndices: number[]

}

async function prepareAttestationRequest(attestationType: string, network: string, sourceId: string, requestBody: EVMRequestBody): Promise<any> {
    const response = await fetch(
        `${EVM_VERIFIER_URL}/verifier/${network}/${attestationType}/prepareRequest`,
        {
            method: "POST",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" },
            body: JSON.stringify({
                "attestationType": toHex(attestationType),
                "sourceId": toHex(sourceId),
                "requestBody": requestBody
            })
        }
    );
    const data = await response.json();
    return data;
}

async function prepareAttestationResponse(attestationType: string, network: string, sourceId: string, requestBody: EVMRequestBody): Promise<AttestationResponse> {
    const response = await fetch(
        `${EVM_VERIFIER_URL}/verifier/${network}/${attestationType}/prepareResponse`,
        {
            method: "POST",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" },
            body: JSON.stringify({
                "attestationType": toHex(attestationType),
                "sourceId": toHex(sourceId),
                "requestBody": requestBody
            })
        }
    );
    const data = await response.json();
    return data;
}

async function requestMerkleProof(scRound: number, txID: string) {

    const attestationRequest = await prepareAttestationRequest(
        "EVMTransaction",
        "eth",
        "testETH",
        {
            transactionHash: txID,
            requiredConfirmations: "1",
            provideInput: true,
            listEvents: true,
            logIndices: []
        }
    );

    const attestationProof = {
        "roundId": Number(scRound),
        "requestBytes": attestationRequest.abiEncodedRequest
    };
    const response = await fetch(
        `${ATTESTATION_URL}/attestation-client/api/proof/get-specific-proof`,
        {
            method: "POST",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" },
            body: JSON.stringify(attestationProof)
        }
    );

    // Verified attestation proof from verifiers API endpoint.
    const responseData = await response.json();
    return responseData;
}


async function createSepoliaTransactions() {
    const [deployer] = await ethers.getSigners();
    const args = ["Sepolia-USDT", "SUSDT"]
    const erc20 = await MintableERC20.new(...args);

    await requestVerification(erc20.address, args)
    console.log("Sepolia USDT deployed to:", erc20.address);
    const tx1 = await erc20.mint(deployer.address, 1000000);
    const tx2 = await erc20.transfer(randomEthereumAddress, 1000);
    await sleep(10000);
    console.log(tx1.tx);
    console.log(
        JSON.stringify(await prepareAttestationResponse("EVMTransaction", "eth", "testETH", {
            transactionHash: tx1.tx,
            requiredConfirmations: "1",
            provideInput: true,
            listEvents: true,
            logIndices: []
        }), null, 2)
    )

    console.log(tx2.tx);
    console.log(
        JSON.stringify(await prepareAttestationResponse("EVMTransaction", "eth", "testETH", {
            transactionHash: tx2.tx,
            requiredConfirmations: "1",
            provideInput: true,
            listEvents: true,
            logIndices: []
        }), null, 2)
    )
}

async function main() {

    if (hardhat.network.name == "sepolia") {
        await createSepoliaTransactions();
    } else if (hardhat.network.name == "coston") {
        // Todo create proofs for coston
    }

}

main().then(() => process.exit(0))
