const xrpl = require("xrpl")

const { XRPL_PRIVATE_KEY, ATTESTATION_URL, ATTESTATION_API_KEY } = process.env;
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

    // Standard payment reference must be 32 bytes - so we right pad with 0
    const MemoData = xrpl.convertStringToHex(message).padEnd(64, "0")
    const MemoType = xrpl.convertStringToHex("Text");
    const MemoFormat = xrpl.convertStringToHex("text/plain");

    let memos = []
    if (message) {
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
    console.log("Payment:")
    // 1. prove the payment:
    const resultPayment = await prepareAttestationResponse("Payment", "xrp", "testXRP",
        {
            "transactionId": "0x" + signed.hash,
            "inUtxo": "0",
            "utxo": "0"
        }
    )

    if (resultPayment.status != "VALID") {
        console.log("Something wrong when confirming payment");
    }
    console.log(resultPayment)
    if (resultPayment.response.responseBody.standardPaymentReference != ("0x" + MemoData)) {
        console.log("Something wrong with message reference");
        console.log(resultPayment.response.responseBody.standardPaymentReference);
        console.log(MemoData);
    }
    if (resultPayment.response.responseBody.receivingAddressHash != web3.utils.soliditySha3(target)) {
        console.log("Something wrong with target address hash");
    }

    // Get information about transaction: block and block timestamp -> we will need this to create the range, where the transaction has happened
    console.log("Failing non existence proof:")
    const blockNumber = Number(resultPayment.response.responseBody.blockNumber)
    const blockTimestamp = Number(resultPayment.response.responseBody.blockTimestamp)

    const targetRange = {
        minimalBlockNumber: (blockNumber - 5).toString(), // Search few block before
        deadlineBlockNumber: (blockNumber + 1).toString(), // Search a few blocks after, but not too much, as they need to already be indexed by attestation clients
        deadlineTimestamp: (blockTimestamp + 3).toString(), // Search a bit after
        destinationAddressHash: web3.utils.soliditySha3(target) // The target address for transaction
    }

    // Try to verify non existence for a transaction and correct parameters
    // This should not verify it

    const resultFailedNonExistence = await prepareAttestationResponse("ReferencedPaymentNonexistence", "xrp", "testXRP",
        {
            ...targetRange,
            amount: amount.toString(),
            standardPaymentReference: "0x" + MemoData
        }
    )

    console.log(resultFailedNonExistence);

    if (resultFailedNonExistence.status != "INVALID") {
        console.log("Something wrong with failed non existence");
    }

    console.log("Successful non existence proofs:")

    // Change the memo field a bit and successfully prove non existence
    let wrongMemoData = xrpl.convertStringToHex(message).padEnd(64, "1") // We pad 1 instead of 0
    const resultWrongMemoNonExistence = await prepareAttestationResponse("ReferencedPaymentNonexistence", "xrp", "testXRP",
        {
            ...targetRange,
            amount: amount.toString(),
            standardPaymentReference: "0x" + wrongMemoData
        }
    )

    console.log(resultWrongMemoNonExistence)

    if (resultWrongMemoNonExistence.status != "VALID") {
        console.log("Something wrong with wrong memo non existence");
    }

    // Change the value and successfully prove non existence.

    const resultWrongAmountNonExistence = await prepareAttestationResponse("ReferencedPaymentNonexistence", "xrp", "testXRP",
        {
            ...targetRange,
            amount: (amount + 1).toString(), // Increase the amount, so the transaction we made is now invalid
            standardPaymentReference: "0x" + MemoData
        }
    )

    console.log(resultWrongAmountNonExistence)

    if (resultWrongAmountNonExistence.status != "VALID") {
        console.log("Something wrong with wrong amount non existence");
    }
}

async function main() {
    await sendXRPLTransaction("Hello world!")
}

main().then(() => process.exit(0))