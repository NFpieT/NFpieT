require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
    networks: {
      hardhat: {
        chainId: 1337
      },
      localhost: {
        url: "http://127.0.0.1:8545"
      },
      matic: {
        url: API_URL,
        accounts: [`0x${PRIVATE_KEY}`]
      }
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
      timeout: 60000
    }
}