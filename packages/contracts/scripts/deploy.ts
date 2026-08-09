import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying BountyEscrow from account: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

  const BountyEscrow = await ethers.getContractFactory("BountyEscrow");
  const contract = await BountyEscrow.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`BountyEscrow deployed to: ${address}`);

  // Write the address + ABI so the server/frontend can consume them.
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  const artifact = await ethers.getContractAt("BountyEscrow", address);
  const artifactData = (await import("../artifacts/contracts/BountyEscrow.sol/BountyEscrow.json")).default;

  fs.writeFileSync(
    path.join(deploymentsDir, "bounty-escrow.json"),
    JSON.stringify(
      {
        address,
        chainId: (await deployer.provider.getNetwork()).chainId.toString(),
        abi: artifactData.abi,
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log(`Deployment metadata written to deployments/bounty-escrow.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
