import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const ConnectButton = document.getElementById("connect");
const fundButton = document.getElementById("fund");
const balanceBtn = document.getElementById("balance");
const AmtField = document.getElementById("amtField");
const withdrawBtn = document.getElementById("withdraw");
// console.log(ethers);
async function connect() {
  if (window.ethereum) {
    console.log("Client has metamask");
    try {
      const connectedAccount = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected to account: " + connectedAccount[0]);
      ConnectButton.innerText = "Connected";
    } catch (err) {
      console.log(err);
    }
  } else {
    ConnectButton.innerHTML = "Please install MetaMask";
  }
}

async function fund(ethAmount) {
  //   console.log(`Funding ${ethAmount} ETH`);
  try {
    if (window.ethereum) {
      // i.e if metamask is installed
      // To make the txn we need:
      //  provider i.e the rpc provider
      // signeer / wallet
      // contract
      // For contract we'll need 1] abi 2] address

      const provider = new ethers.providers.Web3Provider(window.ethereum); // This method looks into metamask and retuns the rpc url of the provider , and then creates a provider object
      const signer = provider.getSigner(); // Since our provider is connected to our wallet, we can get the signer directly with this method , signer => account that is connected to the website
      // console.log(signer);
      // console.log(provider);
      const contract = new ethers.Contract(contractAddress, abi, signer); // we'll need the contract's abi , address and signer( which we'll use to interact with the contarct)
      // For deploying we use ContractFactory , but to get an exitsing contract we use Contract
      console.log(contract);
      const txnRes = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //   waiting for the txn to be mined and then provide feedback to the user
      await listenForTxnToBeMined(txnRes.hash, provider);
      console.log("Transaction complete");
    } else {
      console.log("Please install MetaMask");
    }
  } catch (err) {
    console.log(err);
  }
}

function listenForTxnToBeMined(txnHash, provider) {
  console.log(`Mining  ${txnHash} ...`);
  return new Promise((resolve, reject) => {
    // returning a promise so that we can use await on the listenForTxnToBeMined function , and next line of codes can only be exucuted when the txn is mined, which is done when the
    // event with txn hash is emitted , and the event is emitted when the txn is mined , the event handler gets passed the txn receipt, and once
    // the event is emmitted we resolve the promise , and hence await in the fund function can execute next lines of code.
    provider.once(txnHash, (txnReceipt) => {
      console.log(`Completed with ${txnReceipt.confirmations} confirmations`);
      resolve();
    });
  });
}

async function getBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum); // This method looks into metamask and retuns the rpc url of the provider , and then creates a provider object
  const signer = provider.getSigner(); // Since our provider is connected to our wallet, we can get the signer directly with this method , signer => account that is connected to the website
  // console.log(signer);
  // console.log(provider);
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const balance = await provider.getBalance(contract.address);
  console.log(ethers.utils.formatEther(balance), "Eth");
}

async function withdraw() {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // This method looks into metamask and retuns the rpc url of the provider , and then creates a provider object
      const signer = provider.getSigner(); // Since our provider is connected to our wallet, we can get the signer directly with this method , signer => account that is connected to the website
      // console.log(signer);
      // console.log(provider);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      console.log("Withdrawing...");
      const txnRes = await contract.withdraw();
      await listenForTxnToBeMined(txnRes.hash, provider);
      console.log("Withdraw Transaction complete");
    } else {
      console.log("Please install MetaMask");
    }
  } catch (err) {
    console.log(err);
  }
}

ConnectButton.addEventListener("click", connect);
fundButton.addEventListener("click", () => {
  const ethAmount = AmtField.value;
  if (ethAmount >= 1) {
    fund(ethAmount);
  } else {
    alert("Amount must be greater than or equal to 1");
  }
});
balanceBtn.addEventListener("click", getBalance);
withdrawBtn.addEventListener("click", withdraw);
