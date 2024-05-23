const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Web3 = require('web3');
const Wallet = require('ethereumjs-wallet').default;
const { default: hdkey } = require('ethereumjs-wallet/hdkey');
const bip39 = require('bip39');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const User = require('./models/User'); // Import User model

mongoose.connect('mongodb+srv://shaiYinon:shaiYinon@pollster.rmi7ajf.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Correct initialization of Web3 with HTTP provider
const web3 = new Web3('http://127.0.0.1:7545'); // Ensure Ganache is running on port 7545

// Your mnemonic phrase from Ganache (replace this with your actual mnemonic phrase)
const mnemonic = 'trend poverty aunt scissors traffic couple possible burst found excuse uphold bless';

const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic));
const path = "m/44'/60'/0'/0/";

// Keep track of assigned accounts
let assignedAccounts = {};

async function getAccountDetails(index) {
  const wallet = hdwallet.derivePath(path + index).getWallet();
  return {
    address: '0x' + wallet.getAddress().toString('hex'),
    privateKey: '0x' + wallet.getPrivateKey().toString('hex')
  };
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Registering user:', { username, password });

    // Get an existing account from Ganache that hasn't been used yet
    const accounts = await web3.eth.getAccounts();
    let accountToAssign, accountIndex;

    for (let i = 0; i < accounts.length; i++) {
      if (!assignedAccounts[accounts[i]]) {
        accountToAssign = accounts[i];
        accountIndex = i;
        assignedAccounts[accounts[i]] = true; // Mark this account as used
        break;
      }
    }

    if (!accountToAssign) {
      throw new Error('No available accounts to assign');
    }

    // Retrieve the private key for the assigned account
    const { address, privateKey } = await getAccountDetails(accountIndex);
    if (address.toLowerCase() !== accountToAssign.toLowerCase()) {
      throw new Error('Mismatch between derived and assigned addresses');
    }

    // Save the user to MongoDB with plain-text password
    const user = new User({
      name: username,
      password: password, // Store plain-text password (not recommended for real projects)
      privateKey,
      address: accountToAssign,
    });
    await user.save();

    console.log('User saved to MongoDB:', user);

    res.status(201).json({ message: 'User created and account assigned', address: accountToAssign, privateKey });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
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
      return res.status(404).json({ error: 'User does not exist' });
    }

    console.log('User found:', user);

    // Directly compare plain-text passwords
    if (password !== user.password) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid password' });
    }

    console.log('Password valid for user:', username);

    res.status(200).json({ message: 'Login successful', redirectUrl: '/api/vote' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
