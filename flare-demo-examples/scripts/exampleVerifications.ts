import flareLib = require("@flarenetwork/flare-periphery-contract-artifacts");
import "dotenv/config";
import { network } from 'hardhat';


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

interface AttestationRequest {
    abiEncodedRequest: string;
    status: string;
}

async function prepareAttestationRequest(attestationType: string, network: string, sourceId: string, requestBody: any): Promise<AttestationRequest> {
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


async function prepareAttestationResponse(attestationType: string, network: string, sourceId: string, requestBody: any): Promise<any> {
    const response = await fetch(
        `${ATTESTATION_URL}/verifier/${network}/${attestationType}/prepareResponse`,
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


// 
