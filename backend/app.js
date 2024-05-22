const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Web3 } = require('web3');

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

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Registering user:', { username, password });

    // Generate a new Ethereum account
    const account = web3.eth.accounts.create();
    const privateKey = account.privateKey;
    const address = account.address;

    console.log('Generated account:', { privateKey, address });

    // Save the user to MongoDB with plain-text password
    const user = new User({
      name: username,
      password: password, // Store plain-text password (not recommended for real projects)
      privateKey,
      address,
    });
    await user.save();

    console.log('User saved to MongoDB:', user);

    // Get an existing account from Ganache to fund the new account
    const accounts = await web3.eth.getAccounts();
    const fundingAccount = accounts[0]; // Use the first account from Ganache

    console.log('Funding account:', fundingAccount);

    // Log before sending transaction
    console.log('Sending transaction to fund the new account');
    const receipt = await web3.eth.sendTransaction({
      from: fundingAccount,
      to: address,
      value: web3.utils.toWei('10', 'ether'), // Transfer 10 Ether
      gas: 2000000,
    });

    // Log after transaction is sent
    console.log('Transaction sent, receipt:', receipt);

    res.status(201).json({ message: 'User created and account funded', address, privateKey });
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
