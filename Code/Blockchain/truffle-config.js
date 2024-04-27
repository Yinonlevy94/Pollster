module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1711884021532",
      networkCheckTimeout: 10000000, 
    },    
  },
  compilers: {
    solc: {
      version: "^0.8.0",
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
      }
    }
  }
};
