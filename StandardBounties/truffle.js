const HDWalletProvider = require("truffle-hdwallet-provider");
let mnemonic = 'redacted';

module.exports = {
  networks: {
      //download testrpc and type `testrpc` in your console to start a locally hosted blockchain
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
    	provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io"),
    	network_id: "4",
    	gas: 4500000,
    	gasPrice: 25000000000
    }
  }
};
