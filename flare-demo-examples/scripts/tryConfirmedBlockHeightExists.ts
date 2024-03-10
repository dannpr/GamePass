const { ATTESTATION_URL, ATTESTATION_API_KEY } = process.env;

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

async function getVerifierBlockRange(network: string): Promise<any> {
    return (await (await fetch(
        `${ATTESTATION_URL}/verifier/${network}/api/indexer/block-range`,
        {
            method: "GET",
            headers: { "X-API-KEY": ATTESTATION_API_KEY as string, "Content-Type": "application/json" }
        }
    )).json()).data
}

async function main() {
    const btcRange = await getVerifierBlockRange("btc")
    const dogeRange = await getVerifierBlockRange("doge")
    const xrplRange = await getVerifierBlockRange("xrp")

    console.log("BTC Range: ", btcRange)
    console.log(
        await prepareAttestationResponse("ConfirmedBlockHeightExists", "btc", "testBTC",
            {
                blockNumber: btcRange.last.toString(),
                queryWindow: "123"
            })
    )

    console.log("DOGE Range: ", dogeRange)
    console.log(
        await prepareAttestationResponse("ConfirmedBlockHeightExists", "doge", "testDOGE",
            {
                blockNumber: dogeRange.last.toString(),
                queryWindow: "123"
            })
    )

    console.log("XRPL Range: ", xrplRange)
    console.log(
        await prepareAttestationResponse("ConfirmedBlockHeightExists", "xrp", "testXRP",
            {
                blockNumber: xrplRange.last.toString(),
                queryWindow: "123"
            })
    )
}

main().then(() => process.exit(0))

