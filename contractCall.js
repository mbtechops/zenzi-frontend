const {RpcProvider, Contract, Account} = require('starknet');
// import {BigNumber} from "bignumber.js";
const {BigNumber} = require('bignumber.js');

require('dotenv').config();

const {SEPOLIA_URL, CONTRACT_ADDRESS, ACCOUNT_ADDRESS, PRIVATE_KEY} = process.env;

const sepoliaUrl = process.env.SEPOLIA_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const accountAddress = process.env.ACCOUNT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

const provider = new RpcProvider({
    nodeUrl: sepoliaUrl,
});


async function checkBalance() {
    const classDefinition = await provider.getClassAt(contractAddress); // Replace with your contract ABI
    const abi = classDefinition.abi;

    const viewContract = new Contract(abi, contractAddress, provider);

    const account = new Account(provider, accountAddress, privateKey);
    const callContract = new Contract(abi, contractAddress, account);

    try {

        const addr = "0x03fcbe78b720d74cb54642db76d64433b15b21b91172528be6cd4f8cf95998cb";

        try {
            const tx = await viewContract.balance_of(addr);
            console.log(`Balance of ${addr} is: ${BigNumber(tx).toString()}`);
        } catch (error) {
            console.error("Error: " + error.message);
        }
    } catch (error) {
        console.error('Error calling StarkNet contract:', error);
    }
}

const hex_it = (tx) => {
    return "0x" + tx.toString(16);
};

async function transferTo(amount) {
    console.log("Calling StarkNet contract to tranfer token...");

    const classDefinition = await provider.getClassAt(contractAddress); // Replace with your contract ABI
    const abi = classDefinition.abi;

    const account = new Account(provider, accountAddress, privateKey);
    const callContract = new Contract(abi, contractAddress, account);

    try {

        const addr = "0x03fcbe78b720d74cb54642db76d64433b15b21b91172528be6cd4f8cf95998cb";

        const res = await callContract.transfer(addr, amount);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        console.log("Transaction successful: ", txResult.transaction_hash);

        checkBalance();
                
    } catch (error) {
        console.error("Error: " + error.message);
    }
}

module.exports = {
    checkBalance,
    transferTo
};