require("@nomiclabs/hardhat-waffle");

module.exports = {
    networks: {
      hardhat: {
        chainId: 1337
      },
      localhost: {
        url: "http://127.0.0.1:8545"
      },
    },
    solidity: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      },
    },
    paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts"
    },
    mocha: {
      timeout: 20000
    }
}