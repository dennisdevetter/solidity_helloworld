const fs = require('fs')
const Web3 = require('web3')

require('dotenv').config()

// read smart contract data
const bytecode = fs.readFileSync('Voter_sol_Voter.bin', 'utf-8')
const abiStr = fs.readFileSync('Voter_sol_Voter.abi', 'utf-8')
const abi = JSON.parse(abiStr)

// create Web3
const web3 = new Web3()
web3.setProvider(
    new web3.providers.HttpProvider(
        process.env.INFURA_URL
    )
)

// add private key
const account = web3.eth.accounts.privateKeyToAccount(
    process.env.ACCOUNT_PRIVATE_KEY
)
web3.eth.accounts.wallet.add(account)

// Deploying smart contract
console.log('Deploying the contract')

const voterContract = new web3.eth.Contract(abi)

voterContract.deploy({
    data: '0x' + bytecode,
    arguments: [
        ['option1','option2']
    ]
})
.send({
    from: account.address,
    gas: 1500000
})
.on('transactionHash', (transactionHash) => {
    console.log(`Transaction hash: ${transactionHash}`)
})
.on('confirmation', (confirmationNumber, receipt) => {
    console.log(`Confirmation number: ${confirmationNumber}`)
    console.log(`Block number: ${receipt.blockNumber}`)
    console.log(`Block hash: ${receipt.blockHash}`)
})
.then((contractInstance) => {
    console.log(`Contract address: ${contractInstance.options.address}`)
})
.catch((error) => {
    console.log(`Error: ${error}`)
})
