const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    goerli: {
      provider: function() {
          return new HDWalletProvider("child transfer correct cool trap luxury extend fog bone hobby bunker pistol","wss://goerli.infura.io/v3/18baa37fbca94914b855188d807a19e3")
        },

        network_id: "5"

       }
    }
};