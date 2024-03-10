const xrpl = require("xrpl")

const { XRPL_PRIVATE_KEY, ATTESTATION_URL, ATTESTATION_API_KEY, USE_TESTNET_ATTESTATIONS } = process.env;
const receiverAddress = "r9RLXvWuRro3RX33pk4xsN58tefYZ8Tvbj"

function toHex(data: string): string {
    var result = "";
    for (var i = 0; i < data.length; i++) {
        result += data.charCodeAt(i).toString(16);
    }
    return "0x" + result.padEnd(64, "0");
}

function fromHex(data: string): string {
    data = data.replace(/^(0x\.)/, '');
    return data
        .split(/(\w\w)/g)
        .filter(p => !!p)
        .map(c => String.fromCharCode(parseInt(c, 16)))
        .join('');
}

async function prepareAttestationResponse(attestationType: string, network: string, sourceId: string, requestBody: any): Promise<AttestationResponse> {
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

async function getXRPLclient(): Promise<any> {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    return client
}

async function sendXRPLTransaction(message: string = "", amount: number = 10, target: string = "r9RLXvWuRro3RX33pk4xsN58tefYZ8Tvbj"): Promise<string> {
    const client = await getXRPLclient()

    const test_wallet = xrpl.Wallet.fromSeed(XRPL_PRIVATE_KEY)

    let memos = []
    if (message) {
        // Standard payment reference must be 32 bytes - so we right pad with 0
        const MemoData = xrpl.convertStringToHex(message).padEnd(64, "0")
        const MemoType = xrpl.convertStringToHex("Text");
        const MemoFormat = xrpl.convertStringToHex("text/plain");

        memos.push({
            "Memo": {
                "MemoType": MemoType,
                "MemoData": MemoData,
                "MemoFormat": MemoFormat
            }
        })
    }

    const transaction = await client.autofill({
        "TransactionType": "Payment",
        "Account": test_wallet.address,
        "Amount": amount.toString(),
        "Destination": target,
        "Memos": memos,
    })

    const signed = test_wallet.sign(transaction)
    console.log(`See transaction at https://testnet.xrpl.org/transactions/${signed.hash}`)
    await client.submitAndWait(signed.tx_blob)

    await client.disconnect()

    // sleep for 10 seconds to allow the transaction to be processed
    await new Promise(resolve => setTimeout(resolve, 10 * 1000))

    const result = await prepareAttestationResponse("BalanceDecreasingTransaction", "xrp", "testXRP",
        {
            "transactionId": "0x" + signed.hash,
            "sourceAddressIndicator": web3.utils.soliditySha3(test_wallet.address),
        }
    )

    console.log(
        result
    );

    console.log(fromHex(result.response.responseBody.standardPaymentReference));
}

async function main() {
    await sendXRPLTransaction("Hello world!")
}

main().then(() => process.exit(0))
