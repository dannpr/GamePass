# Generic state connector usage case

This repository is a generic example of how to use the state connector to interact with the Flare Network.
There are three main components:
- [blogpost](./blogpost.md) - a detailed walkthrough of the example state connector usage for simple a Payment attestation type.
This is a good starting point for understanding the state connector usage, as it goes through the process step by step and explains everything in detail.
- [blogpost-others](./blogpost-others.md) - walkthrough through other attestation types (NonPayment, AddressValidity, BlockHeight, BalanceDecreasingTransaction)
- [blogpost-evm](./blogpost-evm.md) - walkthrough through the usage of the state connector for Ethereum Virtual Machine (EVM) chains.
EVM attestation type is a special case, as it is also able to catch events from the EVM chain, which gives it a lot of flexibility.
If you are part of hackathon, start with the [blogpost](./blogpost.md) and then jump straight to the EVM type which give you the most power.

------
# Flare Hardhat Starter Kit

**IMPORTANT!!**
The supporting library uses openzeppelin version `4.9.3`, be careful to use the documentation and examples from that library version.

## Getting started

If you are new to hardhat please checkout [hardhat getting started doc](https://hardhat.org/hardhat-runner/docs/getting-started#overview)

### Clone and install dependencies:

```
git clone https://github.com/flare-foundation/flare-hardhat-starter.git
cd flare-hardhat-starter
```
then run:


```
yarn
```
or 
```
npm install
```


**Now Make sure to first copy .env.example into .env and set your private key**

Now you can compile

```
yarn hardhat compile
or 
npx hardhat compile
```

This will compile all .sol files in your /contracts folder. It will also generate artifacts, that will be needed for testing. Contracts Imports.sol imports MockContracts and flare related mocks thus enabling mocking the contracts from typescript.

Run Tests
```
yarn hardhat test
or 
npx hardhat test
```

& Deploy

Checkout the ```hardhat.config.ts``` file where you define which networks you want to interact with. Flare mainnet & test networks details are already added in that file!

Again make sure that you have added API Keys in .env file

```
npx hardhat run scripts/tryDeployment.ts
```

Thank You!
### Resources:
- [Flare Dev Docs](https://docs.flare.network/dev/)
- [Hardhat Docs](https://hardhat.org/docs)
