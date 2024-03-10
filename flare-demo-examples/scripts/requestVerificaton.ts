import flareLib = require("@flarenetwork/flare-periphery-contract-artifacts");
import "dotenv/config";
import { ethers, network } from 'hardhat';


const { ATTESTATION_URL, ATTESTATION_API_KEY, USE_TESTNET_ATTESTATIONS } = process.env;

// The same function can also be found in State Connector utils bundled with the artifact periphery package (`encodeAttestationName`)

// Simple hex encoding
function toHex(data: string): string {
    var result = "";
    for (var i = 0; i < data.length; i++) {
        result += data.charCodeAt(i).toString(16);
    }
    return "0x" + result.padEnd(64, "0");
}

// Preset the networks
const isTestnet = network.name === "coston" || ["false", undefined].includes(USE_TESTNET_ATTESTATIONS);
const BTC_NAME = isTestnet ? "testBTC" : "BTC";
const ETH_NAME = isTestnet ? "testETH" : "ETH";
const XRP_NAME = isTestnet ? "testXRP" : "XRP";
const DOGE_NAME = isTestnet ? "testDOGE" : "DOGE";

const BTC_NETWORK = "btc";
const ETH_NETWORK = "eth";
const XRP_NETWORK = "xrp";
const DOGE_NETWORK = "doge";

interface AttestationResponse {
    abiEncodedRequest: string;
    status: string;
}

async function prepareAttestationRequest(attestationType: string, network: string, sourceId: string, requestBody: any): Promise<AttestationResponse> {
    const response = await fetch(
        `${ATTESTATION_URL}/verifier/${network}/${attestationType}/prepareRequest`,
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

async function prepareAttestationResponse(attestationType: string, network: string, requestData: any): Promise<any> {
    const response = await fetch(
        `${ATTESTATION_URL}/verifier/${network}/${attestationType}/prepareResponse`,
        {
            method: "POST",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        }
    );
    const data = await response.json();
    return data;
}


const BTC_TRANSACTION_ID = "0x" + "01c17d143c03b459707f540fd5ee9f02a730c4cd114f310ef294b706ccf131d1";

async function prepareRequest() {
    const attestationType = toHex("Payment");
    const sourceType = toHex("testBTC");
    // Attestation Request object to be sent to API endpoint
    const requestData = {
        "attestationType": attestationType,
        "sourceId": sourceType,
        "requestBody": {
            "transactionId": BTC_TRANSACTION_ID,
            "inUtxo": "8",
            "utxo": "4"
        }
    }

    const response = await fetch(
        `${ATTESTATION_URL}/verifier/btc/Payment/prepareRequest`,
        {
            method: "POST",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        }
    );
    const data = await response.json();
    // console.log("Prepared request:", data);
    return data;
}

async function submitRequest() {
    const requestData = await prepareRequest();

    const stateConnector = await ethers.getContractAt(
        flareLib.nameToAbi("IStateConnector", "coston").data,
        flareLib.nameToAddress("StateConnector", "coston"),
    );

    // Call to the StateConnector protocol to provide attestation.
    const tx = await stateConnector.requestAttestations(
        requestData.abiEncodedRequest
    );
    const receipt = await tx.wait();

    // Get block number of the block containing contract call
    const blockNumber = receipt.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber);

    // Get constants from State connector smart contract
    const BUFFER_TIMESTAMP_OFFSET = Number(await stateConnector.BUFFER_TIMESTAMP_OFFSET());
    const BUFFER_WINDOW = Number(await stateConnector.BUFFER_WINDOW());

    // Calculate roundId
    const roundId = Math.floor((block!.timestamp - BUFFER_TIMESTAMP_OFFSET) / BUFFER_WINDOW);
    // console.log("scRound:", roundId);
    return roundId;
}

async function requestMerkleProof(scRound: number) {

    const attestationRequest = await prepareRequest();

    const attestationProof = {
        "roundId": scRound,
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
    // console.log("Response", JSON.stringify(responseData));
    return responseData;
}


export async function checkMerkleProof(scRound: number) {



    // Check that the round is already finalized
    const stateConnector = await ethers.getContractAt(
        flareLib.nameToAbi("IStateConnector", "coston").data,
        flareLib.nameToAddress("StateConnector", "coston"),
    );

    const lastFinalized = await stateConnector.lastFinalizedRoundId();

    if (scRound > lastFinalized) {
        console.log("scRound:", scRound, "is not finalized yet");
        return;
    }

    const response = await requestMerkleProof(scRound);

    const paymentVerifier = await ethers.getContractAt(
        flareLib.nameToAbi("IPaymentVerification", "coston").data,
        flareLib.nameToAddress("IPaymentVerification", "coston"),
    );
    const payment = {
        data: response.data.response,
        merkleProof: response.data.merkleProof
    }

    const tx = await paymentVerifier.verifyPayment(payment);
    console.log("Verification tx:", tx);
    return payment;
}

async function getPreparedResponse() {
    const attestationType = toHex("Payment");
    const sourceType = toHex("testBTC");
    // Attestation Request object to be sent to API endpoint
    const requestData = {
        "attestationType": attestationType,
        "sourceId": sourceType,
        "requestBody": {
            "transactionId": BTC_TRANSACTION_ID,
            "inUtxo": "8",
            "utxo": "4"
        }
    }

    const response = await fetch(
        `${ATTESTATION_URL}/verifier/btc/Payment/prepareResponse`,
        {
            method: "POST",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        }
    );
    const data = await response.json();
    console.log("Prepared response:", data);
    return data;
}

// prepareRequest().then(() => process.exit(0));

// submitRequest().then(() => process.exit(0));

// requestMerkleProof(791508).then(() => process.exit(0));

// checkMerkleProof(791508).then(() => process.exit(0));

// getPreparedResponse().then(() => process.exit(0));
