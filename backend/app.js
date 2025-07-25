// app.js (or server.js)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Web3 } = require('web3');
const Wallet = require('ethereumjs-wallet').default;
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const User = require('./models/User');

//First DB variable
const governmentDBConnection = mongoose.createConnection('mongodb+srv://shaiyinonnaor:Z1QNFVMxZpfERxV4@governmentaldb.laueuty.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Government DB Scheme 
const GovernmentUser = governmentDBConnection.model('GovernmentUser', new mongoose.Schema({
  name: String,
  lastName: String,
  id: String,
  isAssigned: Boolean
}));
//Second DB variable
mongoose.connect('mongodb+srv://shaiYinon:shaiYinon@pollster.rmi7ajf.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  //Ganache connection
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

const mnemonic = 'ridge smile flower slender board public humble fold verify pill grid will';
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);
const hdPath = "m/44'/60'/0'/0/";

let assignedAccounts = {};

//fetch the wallet keys
async function getAccountDetails(index) {
  const wallet = hdwallet.derivePath(hdPath + index).getWallet(); 
  return {
    address: '0x' + wallet.getAddress().toString('hex'),
    privateKey: '0x' + wallet.getPrivateKey().toString('hex')
  };
}

//finding the next available wallet and calling the fetch function
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
  //checks if the wallet is assigned correctly
  const { address, privateKey } = await getAccountDetails(accountIndex);
  if (address.toLowerCase() !== accountToAssign.toLowerCase()) {
    throw new Error('Mismatch between derived and assigned addresses');
  }

  return { accountToAssign, privateKey };
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, id } = req.body;

    //console.log('Registering user:', { username, password, id });
    //search the user in the gov DB via the id so we can assign a govermental user to the platform`s user
    const govUser = await GovernmentUser.findOne({ id: id });

  
    if (!govUser) {
      return res.status(400).json({ error: 'ID not found in government database' });
    }

    if (govUser.isAssigned) {
      return res.status(400).json({ error: 'A user already exists for this ID.' });
    }

    const { accountToAssign, privateKey } = await findNextAvailableAccount();
    assignedAccounts[accountToAssign] = true;
    //after the id validation we use this scheme to register the user into the second DB
    const user = new User({
      name: username,
      password: password,
      privateKey,
      address: accountToAssign,
      hasVoted: false 
    });
    await user.save();

    govUser.isAssigned = true;
    await govUser.save();

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

    if (user.hasVoted) {
      console.log('User has already voted:', username);
      return res.status(200).json({ message: 'Already voted', redirectUrl: '/alreadyvoted' });
    }

    console.log('Password valid for user:', username);

    res.status(200).json({ message: 'Login successful', redirectUrl: '/vote', username: user.name });
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
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    if (user.hasVoted) {
      return res.status(403).json({ error: 'User has already voted' });
    }

    const privateKey = user.privateKey;
    const fromAddress = user.address;
    const toAddress = candidateAddresses[vote]; // Get the candidate's address from the mapping

    if (!toAddress) {
      return res.status(400).json({ error: 'Invalid candidate selected' });
    }
    //we preform the transaction on behalf of the user
    const gasPrice = web3.utils.toWei('1', 'gwei'); 
    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toWei('1', 'ether'),
      gas: '21000', 
      gasPrice: gasPrice 
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    user.hasVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote registered', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error('Error during voting:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for results
app.get('/results', async (req, res) => {
  const candidates = {
    "Benny Gantz": {
      address: "0xE39D1B37d13b696100BB1c4F3AB11486D6A25229",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benny_Gantz_2019_%28cropped%29.jpg/220px-Benny_Gantz_2019_%28cropped%29.jpg"
    },
    "Bibi Netanyahu": {
      address: "0x4c3b6fF9D5410119972eEbC2ebd230924fb9C845",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Benjamin_Netanyahu%2C_February_2023.jpg/220px-Benjamin_Netanyahu_February_2023.jpg"
    },
    "Naftali Bennet": {
      address: "0x8AF840F5AB447F965F371C2EEa070611c790F8f4",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Naftali_Bennett_official_portrait.jpg/220px-Naftali_Bennett_official_portrait.jpg"
    }
  };

  const TOTAL_MANDATES = 120;
  
  try {
    const balances = await Promise.all(Object.values(candidates).map(async (candidate) => {
      const balanceWei = await web3.eth.getBalance(candidate.address);
      return web3.utils.fromWei(balanceWei, 'ether');
    }));

    const adjustedBalances = balances.map(balance => balance - 100);

    const totalVotes = adjustedBalances.reduce((sum, balance) => sum + balance, 0);

    const results = Object.keys(candidates).reduce((acc, candidate, index) => {
      const percentage = (adjustedBalances[index] / totalVotes) * 100;
      const mandates = Math.round((percentage / 100) * TOTAL_MANDATES);
      acc[candidate] = {
        name: candidate,
        votes: adjustedBalances[index],
        percentage: percentage.toFixed(2), 
        mandates: mandates,
        img: candidates[candidate].img
      };
      return acc;
    }, {});

    const sortedResults = Object.entries(results).sort((a, b) => b[1].votes - a[1].votes);
    const [winner, secondPlace, thirdPlace] = sortedResults;

    res.json({ 
      winner: winner[1], 
      secondPlace: secondPlace[1], 
      thirdPlace: thirdPlace[1] 
    });
  } catch (error) {
    console.error('Error counting votes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  