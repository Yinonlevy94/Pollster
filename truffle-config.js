/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation, and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * https://trufflesuite.com/docs/truffle/reference/configuration
 *
 * Hands-off deployment with Infura
 * --------------------------------
 *
 * Do you have a complex application that requires lots of transactions to deploy?
 * Use this approach to make deployment a breeze 🏖️:
 *
 * Infura deployment needs a wallet provider (like @truffle/hdwallet-provider)
 * to sign transactions before they're sent to a remote public node.
 * Infura accounts are available for free at 🔍: https://infura.io/register
 *
 * You'll need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. You can store your secrets 🤐 in a .env file.
 * In your project root, run `$ npm install dotenv`.
 * Create .env (which should be .gitignored) and declare your MNEMONIC
 * and Infura PROJECT_ID variables inside.
 * For example, your .env file will have the following structure:
 *
 * MNEMONIC = <Your 12 phrase mnemonic>
 * PROJECT_ID = <Your Infura project id>
 *
 * Deployment with Truffle Dashboard (Recommended for best security practice)
 * --------------------------------------------------------------------------
 *
 * Are you concerned about security and minimizing rekt status 🤔?
 * Use this method for best security:
 *
 * Truffle Dashboard lets you review transactions in detail, and leverages
 * MetaMask for signing, so there's no need to copy-paste your mnemonic.
 * More details can be found at 🔎:
 *
 * https://trufflesuite.com/docs/truffle/getting-started/using-the-truffle-dashboard/
 */

// require('dotenv').config();
// const { MNEMONIC, PROJECT_ID } = process.env;

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// Load environment variables from .env file if necessary
// require('dotenv').config();

// Uncomment the line below if you are using HDWalletProvider for deployment to a public network
// const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    // Configuration for development network
    development: {
      host: "127.0.0.1",     // Localhost (default for Ganache)
      port: 7545,            // Standard Ganache UI port
      network_id: "*",       // Connect to any network
    },
    // Configuration for other networks can be added here
  },

  // Set default Mocha test options
  mocha: {
    // timeout: 100000 can be useful for slow blockchain interactions such as live networks
  },

  // Solidity compiler configuration
  compilers: {
    solc: {
      version: "0.8.21",    // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,   // Enable Solc optimizer
          runs: 200        // Optimize for how many times you intend to run the code
        },
        evmVersion: "byzantium" // Modify as per your target EVM version
      }
    }
  },

  // Configuration for Truffle DB (optional)
  db: {
    enabled: false,        // Set to true to enable Truffle DB
    host: "127.0.0.1",     // Host for Truffle DB
    adapter: {
      name: "indexeddb",   // Using IndexedDB adapter
      settings: {
        directory: ".db"   // Data directory for DB
      }
    }
  }
};

