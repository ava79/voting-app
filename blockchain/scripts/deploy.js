async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Fetch balance using ethers.provider.getBalance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance) + " MATIC"); // Or ethers.utils.formatEther for older ethers

  const Voting = await ethers.getContractFactory("Voting");
  console.log("Deploying Voting contract...");
  const voting = await Voting.deploy();

  // await voting.deployed(); // This is often not needed with recent Hardhat versions as deploy() waits.

  // To get the address, it's better to wait for the deployment transaction to be mined.
  // The .deploy() call returns a contract object that has a deploymentTransaction() method.
  // We can wait for this transaction to be included in a block.
  await voting.deploymentTransaction().wait(1); // Wait for 1 confirmation

  console.log("Voting contract deployed to:", await voting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
