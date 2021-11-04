import "@float-capital/solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@popcorn/utils/src/envLoader";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-secure-signer";
import "./lib/tasks";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      chainId: 1,
      url:
        process.env.RPC_URL ||
        `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    hardhat: {
      initialBaseFeePerGas: 0,
    },
    rinkeby: {
      url:
        process.env.RPC_URL ||
        `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      tags: ["rinkeby"],
    },
    kovan: {
      url:
        process.env.RPC_URL ||
        `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      tags: ["LBP"],
    },
    gorli: {
      url:
        process.env.RPC_URL ||
        `https://gorli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    enabled: false,
  },
  mocha: {
    timeout: 120000,
  },
};
