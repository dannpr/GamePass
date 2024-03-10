import "@nomicfoundation/hardhat-verify";
import { artifacts, run } from 'hardhat';
import { PaymentAggregationExampleContract, PaymentAggregationExampleInstance } from '../typechain-types';
import { checkMerkleProof } from './requestVerificaton';
const PaymentAggregationExample: PaymentAggregationExampleContract = artifacts.require('PaymentAggregationExample');

async function deployPaymentAggregationExample(): PaymentAggregationExampleInstance {
    const paymentAggregationExample: PaymentAggregationExampleInstance = await PaymentAggregationExample.new();
    console.log("PaymentAggregationExample deployed to:", paymentAggregationExample.address);
    try {
        const result = await run("verify:verify", {
            address: paymentAggregationExample.address,
            constructorArguments: [],
        })

        console.log(result)
    } catch (e: any) {
        console.log(e.message)
    }
    return paymentAggregationExample;
}


async function main() {

    const paymentAggregationExample = await deployPaymentAggregationExample();
    const payment = await checkMerkleProof(791508);

    const tx = await paymentAggregationExample.addPayment(payment);
    await tx.wait();
}

main().then(() => process.exit(0))