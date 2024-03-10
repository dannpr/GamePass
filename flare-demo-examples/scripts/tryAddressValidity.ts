const { ATTESTATION_URL, ATTESTATION_API_KEY } = process.env;
const exampleXRPLAddress = "r9RLXvWuRro3RX33pk4xsN58tefYZ8Tvbj"
const someDogecoinAddress = "njyMWWyh1L7tSX6QkWRgetMVCVyVtfoDta"
const someBTCAddress = "tb1qq3fm2kdklehk545c5rgfxzfhe7ph5tt640cayu"

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

async function main() {

    console.log(
        await prepareAttestationResponse("AddressValidity", "xrp", "testXRP",
            { addressStr: exampleXRPLAddress })
    )
    console.log(
        await prepareAttestationResponse("AddressValidity", "xrp", "testXRP",
            { addressStr: "0xhahahahaha" })
    )
    console.log(
        await prepareAttestationResponse("AddressValidity", "xrp", "testXRP",
            { addressStr: "Hello world!" })
    )

    console.log(
        await prepareAttestationResponse("AddressValidity", "btc", "testBTC",
            { addressStr: someBTCAddress })
    )
    console.log(
        await prepareAttestationResponse("AddressValidity", "btc", "testBTC",
            { addressStr: "0xhahahahaha" })
    )
    console.log(
        await prepareAttestationResponse("AddressValidity", "btc", "testBTC",
            { addressStr: "Hello world!" })
    )

    console.log(
        await prepareAttestationResponse("AddressValidity", "doge", "testDOGE",
            { addressStr: someDogecoinAddress })
    )
    console.log(
        await prepareAttestationResponse("AddressValidity", "doge", "testDOGE",
            { addressStr: "0xhahahahaha" })
    )
    console.log(
        await prepareAttestationResponse("AddressValidity", "doge", "testDOGE",
            { addressStr: "Hello world!" })
    )




}

main().then(() => process.exit(0))
