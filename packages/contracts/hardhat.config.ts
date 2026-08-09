import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

dotenvConfig();

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "0000000000000000000000000000000000000000000000000000000000000000";
const SEPOLIA_RPC = process.env.RPC_URL_SEPOLIA ?? "https://sepolia.drpc.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: { count: 20, accountsBalance: "10000000000000000000000" },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: SEPOLIA_RPC,
      chainId: 11155111,
      accounts: PRIVATE_KEY !== "0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY ?? "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
