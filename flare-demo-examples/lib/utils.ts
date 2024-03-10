import { time } from '@openzeppelin/test-helpers';
import BN from "bn.js";
import { ethers, run } from 'hardhat';

export async function getTime(): Promise<number> {
    await time.advanceBlock();
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp = block!!.timestamp;
    return timestamp
}

/**
 * Helper wrapper to convert number to BN 
 * @param x number expressed in any reasonable type
 * @returns same number as BN
 */
export function toBN(x: BN | number | string): BN {
    if (x instanceof BN) return x;
    return web3.utils.toBN(x);
}

export async function sleep(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

/**
 * Sets parameters for shifting time to future. Note: seems like 
 * no block is mined after this call, but the next mined block has
 * the the timestamp equal time + 1 
 * @param tm 
 */
export async function increaseTimeTo(tm: number) {
    await ethers.provider.send("evm_mine", [tm]);

}

export async function requestVerification(address: string, args: any[], repeat: number = 5) {
    for (let j = 0; j < repeat; j++) {
        try {
            await run("verify:verify", {
                address: address,
                constructorArguments: args,
            })
            break;
        } catch (e) {

        }
        await sleep(5000)
    }

}

/**
 * Return latest block timestamp as number (seconds since 1.1.1970).
 */
export async function latestBlockTimestamp() {
    const latestBlock = await web3.eth.getBlock('latest');
    return Number(latestBlock.timestamp);
}
