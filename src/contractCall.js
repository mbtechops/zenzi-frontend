const { RpcProvider, Contract, Account } = require("starknet");

const { BigNumber } = require("bignumber.js");

require("dotenv").config();

const { SEPOLIA_URL, CONTRACT_ADDRESS, ACCOUNT_ADDRESS, PRIVATE_KEY } =
  process.env;


const PROVIDER = new RpcProvider({
  nodeUrl: SEPOLIA_URL,
});

const ADDR =
  "0x03fcbe78b720d74cb54642db76d64433b15b21b91172528be6cd4f8cf95998cb";

async function checkBalance() {
  const classDefinition = await PROVIDER.getClassAt(CONTRACT_ADDRESS); // Replace with your contract ABI
  const abi = classDefinition.abi;

  const viewContract = new Contract(abi, CONTRACT_ADDRESS, PROVIDER);

  try {
    try {
      const tx = await viewContract.token_balance(ADDR);
      console.log(`Balance of ${ADDR} is: ${BigNumber(tx).toString()}`);
    } catch (error) {
      console.error("Error: " + error.message);
    }
  } catch (error) {
    console.error("Error calling StarkNet contract:", error);
  }
}

const hex_it = (tx) => {
  return "0x" + tx.toString(16);
};

async function allocateToken(token_amount) {
  console.log("Calling StarkNet contract to allocate token...");

  const classDefinition = await PROVIDER.getClassAt(CONTRACT_ADDRESS); // Replace with your contract ABI
  const abi = classDefinition.abi;

  const account = new Account(PROVIDER, ACCOUNT_ADDRESS, PRIVATE_KEY);
  const callContract = new Contract(abi, CONTRACT_ADDRESS, account);

  try {
    const res = await callContract.allocate_token(10, ADDR);

    const txHash = res?.transaction_hash;

    const txResult = await PROVIDER.waitForTransaction(txHash);

    console.log("Transaction successful: ", txResult.transaction_hash);

    checkBalance();

  } catch (error) {
    console.error("Error: " + error.message);
  }
}
async function depositToken(token_amount) {
  console.log("Calling StarkNet contract to deposit token...");

  const classDefinition = await PROVIDER.getClassAt(CONTRACT_ADDRESS); // Replace with your contract ABI
  const abi = classDefinition.abi;

  const account = new Account(PROVIDER, ACCOUNT_ADDRESS, PRIVATE_KEY);
  const callContract = new Contract(abi, CONTRACT_ADDRESS, account);

  try {
    const res = await callContract.deposit_token(
      ACCOUNT_ADDRESS,
      token_amount,
      "0x070662f85e0d54ca2c90d9ccb7afb905a069a1e154b8c2615a7ac265fc51516d"
    );

    const txHash = res?.transaction_hash;

    const txResult = await PROVIDER.waitForTransaction(txHash);

    console.log("Transaction successful: ", txResult.transaction_hash);

    checkBalance();
  } catch (error) {
    console.error("Error: " + error.message);
  }
}

module.exports = {
  checkBalance,
  allocateToken,
  depositToken,
};