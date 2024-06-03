const {Web3} = require('web3');
const web3 = new Web3('http://127.0.0.1:7545'); // URL of your Ganache instance

async function inspectBlocks() {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    
    for (let i = 0; i <= latestBlockNumber; i++) {
        const block = await web3.eth.getBlock(i);
        console.log(`Block Number: ${block.number}`);
        console.log(`Block Hash: ${block.hash}`);
        console.log(`Parent Hash: ${block.parentHash}`);
        console.log('----------------------------------');
        
        // Ensure the parentHash of the current block matches the hash of the previous block
        if (i > 0) {
            const previousBlock = await web3.eth.getBlock(i - 1);
            if (block.parentHash !== previousBlock.hash) {
                console.log(`Block ${block.number} is not properly chained to Block ${block.number - 1}`);
            }
        }
    }
}

inspectBlocks();
