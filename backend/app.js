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
      return res.status(404).json({ error: 'User does not exist' });
    }

    console.log('User found:', user);

    if (password !== user.password) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid password' });
    }

    console.log('Password valid for user:', username);

    res.status(200).json({ message: 'Login successful', redirectUrl: 'api/vote' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/votepage', (req,res) =>{
  console.log(req.body);
  res.status(200).json({ message: 'Vote recieved' });
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
