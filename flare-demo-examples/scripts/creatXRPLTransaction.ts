const xrpl = require("xrpl")

const { XRPL_PRIVATE_KEY } = process.env;
const receiverAddress = "r9RLXvWuRro3RX33pk4xsN58tefYZ8Tvbj"


async function getXRPLclient(): Promise<any> {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    return client
}

async function sendXRPLTransaction(priceString: string): Promise<string> {
    const client = await getXRPLclient()

    const test_wallet = xrpl.Wallet.fromSeed(XRPL_PRIVATE_KEY)
    const MemoData = (xrpl.convertStringToHex(priceString) + "aa").padEnd(64, "0")
    const MemoType = xrpl.convertStringToHex("Text");
    // MemoFormat values: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    const MemoFormat = xrpl.convertStringToHex("text/plain");

    const transaction = await client.autofill({
        "TransactionType": "Payment",
        "Account": test_wallet.address,
        "Amount": "10",
        "Destination": receiverAddress,
        "Memos": [{
            "Memo": {
                "MemoType": MemoType,
                "MemoData": MemoData,
                "MemoFormat": MemoFormat
            }
        }]
    })

    const signed = test_wallet.sign(transaction)
    console.log("Sent transaction for: ", priceString, " hash: ", signed.hash)
    const tx = await client.submitAndWait(signed.tx_blob)

    await client.disconnect()

    return signed.hash
}

async function main() {
    const priceString = "Hello world!"
    await sendXRPLTransaction(priceString)
}

main().then(() => process.exit(0))