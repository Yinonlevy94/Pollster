const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Web3 } = require('web3');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const User = require('./models/User'); // Import User model

mongoose.connect('mongodb+srv://shaiYinon:shaiYinon@pollster.rmi7ajf.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Correct initialization of Web3 with HTTP provider
const web3 = new Web3('http://localhost:8545'); // Ensure Ganache is running on port 8545

// Use a verified private key from Ganache CLI
const predefinedPrivateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

// Validate the predefined private key
try {
  const predefinedAccount = web3.eth.accounts.privateKeyToAccount(predefinedPrivateKey);
  web3.eth.accounts.wallet.add(predefinedAccount);
  web3.eth.defaultAccount = predefinedAccount.address;
} catch (error) {
  console.error('Invalid predefined private key:', error);
  process.exit(1); // Exit the process if the private key is invalid
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Generate a new Ethereum account
    const account = web3.eth.accounts.create();
    const privateKey = account.privateKey;
    const address = account.address;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to MongoDB
    const user = new User({
      name: username,
      password: hashedPassword,
      privateKey,
      address,
    });
    await user.save();

    // Log the transaction details before sending
    console.log(`Funding new account: ${address} from predefined account: ${predefinedAccount.address}`);

    // Fund the new account from the predefined account
    const receipt = await web3.eth.sendTransaction({
      from: predefinedAccount.address,
      to: address,
      value: web3.utils.toWei('10', 'ether'), // Transfer 10 Ether
      gas: 2000000,
    });

    // Log the transaction receipt
    console.log('Transaction receipt:', receipt);

    res.status(201).json({ message: 'User created and account funded', address });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ error: 'Username already exists' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
