const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Web3 } = require('web3');
const Wallet = require('ethereumjs-wallet').default;
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const User = require('./models/User');

mongoose.connect('mongodb+srv://shaiYinon:shaiYinon@pollster.rmi7ajf.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

const mnemonic = 'ridge smile flower slender board public humble fold verify pill grid will';

const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);
const path = "m/44'/60'/0'/0/";

let assignedAccounts = {};

async function getAccountDetails(index) {
  const wallet = hdwallet.derivePath(path + index).getWallet();
  return {
    address: '0x' + wallet.getAddress().toString('hex'),
    privateKey: '0x' + wallet.getPrivateKey().toString('hex')
  };
}

async function findNextAvailableAccount() {
  const accounts = await web3.eth.getAccounts();
  let accountToAssign, accountIndex;

  for (let i = 0; i < accounts.length; i++) {
    const existingUser = await User.findOne({ address: accounts[i] });
    if (!assignedAccounts[accounts[i]] && !existingUser) {
      accountToAssign = accounts[i];
      accountIndex = i;
      break;
    }
  }

  if (!accountToAssign) {
    throw new Error('No available accounts to assign');
  }

  const { address, privateKey } = await getAccountDetails(accountIndex);
  if (address.toLowerCase() !== accountToAssign.toLowerCase()) {
    throw new Error('Mismatch between derived and assigned addresses');
  }

  return { accountToAssign, privateKey };
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Registering user:', { username, password });

    const { accountToAssign, privateKey } = await findNextAvailableAccount();
    assignedAccounts[accountToAssign] = true;

    const user = new User({
      name: username,
      password: password,
      privateKey,
      address: accountToAssign,
      hasVoted: false // Ensure hasVoted field is set to false initially
    });
    await user.save();

    console.log('User saved to MongoDB:', user);

    res.status(201).json({ message: 'User created and account assigned', address: accountToAssign, privateKey });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for user: ${username}`);

  try {
    const user = await User.findOne({ name: username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ error: 'User does not exist' });
    }

    console.log('User found:', user);

    if (password !== user.password) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid password' });
    }

    console.log('Password valid for user:', username);

    // Correct redirect URL to /api/vote
    res.status(200).json({ message: 'Login successful', redirectUrl: '/api/vote', username: user.name });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

const candidateAddresses = {
  "Benny Gantz": "0xE39D1B37d13b696100BB1c4F3AB11486D6A25229",
  "Bibi Netanyahu": "0x4c3b6fF9D5410119972eEbC2ebd230924fb9C845",
  "Naftali Bennet": "0x8AF840F5AB447F965F371C2EEa070611c790F8f4"
};

app.post('/api/votepage', async (req, res) => {
  const { username, vote } = req.body;

  try {
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    // Ensure the user has not voted yet
    if (user.hasVoted) {
      return res.status(403).json({ error: 'User has already voted' });
    }

    const privateKey = user.privateKey;
    const fromAddress = user.address;
    const toAddress = candidateAddresses[vote]; // Get the candidate's address from the mapping

    if (!toAddress) {
      return res.status(400).json({ error: 'Invalid candidate selected' });
    }

    const gasPrice = web3.utils.toWei('1', 'gwei'); // Set gas price higher than the base fee (875 Gwei)
    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toWei('1', 'ether'),
      gas: '21000', // Minimal gas limit for a simple transaction
      gasPrice: gasPrice // Ensure gas price is reasonable
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    // Mark the user as having voted
    user.hasVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote registered', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error('Error during voting:', error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
