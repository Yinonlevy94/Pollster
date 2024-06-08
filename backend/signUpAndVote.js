const axios = require('axios');
const { Web3 } = require('web3');
const Wallet = require('ethereumjs-wallet').default;
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');
// naftali 19
// benny 31
// bibi 20
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
const mnemonic = 'ridge smile flower slender board public humble fold verify pill grid will';
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);
const path = "m/44'/60'/0'/0/";

const candidates = ["Benny Gantz", "Bibi Netanyahu", "Naftali Bennet"];

async function getAccountDetails(index) {
    const wallet = hdwallet.derivePath(path + index).getWallet();
    return {
        address: '0x' + wallet.getAddress().toString('hex'),
        privateKey: '0x' + wallet.getPrivateKey().toString('hex')
    };
}

async function signUpUser(username, password, index) {
    try {
        const { address, privateKey } = await getAccountDetails(index);
        const response = await axios.post('http://localhost:5000/api/register', {
            username,
            password
        });

        console.log(`User ${username} registered: ${response.data.message}`);
        return { username, privateKey, address };
    } catch (error) {
        console.error(`Error registering user ${username}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

async function voteForCandidate(username, candidate) {
    try {
        const response = await axios.post('http://localhost:5000/api/votepage', {
            username,
            vote: candidate
        });

        console.log(`User ${username} voted for ${candidate}: ${response.data.message}`);
    } catch (error) {
        console.error(`Error voting for ${candidate} by ${username}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

async function main() {
    for (let i = 0; i < 70; i++) {
        const username = `user${i}`;
        const password = `password${i}`;
        try {
            const user = await signUpUser(username, password, i);
            const candidate = candidates[Math.floor(Math.random() * candidates.length)];
            await voteForCandidate(user.username, candidate);
        } catch (error) {
            console.error(`Error processing user ${username}:`, error.message);
        }
    }
}

main().catch(error => console.error('Script failed:', error));
