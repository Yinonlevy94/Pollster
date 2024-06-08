const { Web3 } = require('web3');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
const mnemonic = 'ridge smile flower slender board public humble fold verify pill grid will';
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);
const path = "m/44'/60'/0'/0/";

async function getAccountDetails(index) {
    const wallet = hdwallet.derivePath(path + index).getWallet();
    return {
        address: '0x' + wallet.getAddress().toString('hex')
    };
}

async function getBalances() {
    const candidates = ['Benny Gantz', 'Bibi Netanyahu', 'Naftali Bennet'];
    let balances = [];

    for (let i = 0; i < 3; i++) {
        const { address } = await getAccountDetails(i);
        let balance = await web3.eth.getBalance(address);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = Math.ceil(parseFloat(balance)); // Round up to the nearest integer
        balances.push({ candidate: candidates[i], balance: balance });
    }

    return balances;
}

async function main() {
    try {
        const balances = await getBalances();
        balances.sort((a, b) => b.balance - a.balance);
        balances.forEach(b => console.log(`${b.candidate}: ${b.balance}`));
    } catch (error) {
        console.error('Script failed:', error);
    }
}

main();
