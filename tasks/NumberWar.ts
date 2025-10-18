import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:address", "Prints the NumberWar address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const numberWar = await deployments.get("NumberWar");

  console.log("NumberWar address is " + numberWar.address);
});

task("task:join", "Starts a new round and decrypts the system number")
  .addOptionalParam("address", "Optionally specify the NumberWar contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get("NumberWar");
    console.log(`NumberWar: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("NumberWar", deployment.address);

    const tx = await contract.connect(signer).joinGame();
    console.log(`Wait for tx:${tx.hash}...`);
    await tx.wait();

    const encryptedNumber = await contract.getSystemNumber(signer.address);
    console.log(`Encrypted system number: ${encryptedNumber}`);

    const clearNumber = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedNumber,
      deployment.address,
      signer,
    );

    console.log(`Clear system number: ${clearNumber}`);
    console.log(`Active round: ${await contract.hasActiveRound(signer.address)}`);
  });

task("task:submit", "Submits the player number and decrypts the outcome")
  .addOptionalParam("address", "Optionally specify the NumberWar contract address")
  .addParam("value", "The player number between 1 and 10")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const playerValue = parseInt(taskArguments.value);
    if (!Number.isInteger(playerValue)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get("NumberWar");
    console.log(`NumberWar: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("NumberWar", deployment.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add8(playerValue)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .submitNumber(encryptedInput.handles[0], encryptedInput.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);
    await tx.wait();

    const encryptedOutcome = await contract.getLastOutcome(signer.address);
    console.log(`Encrypted outcome: ${encryptedOutcome}`);

    const clearOutcome = await fhevm.userDecryptEbool(
      FhevmType.ebool,
      encryptedOutcome,
      deployment.address,
      signer,
    );

    console.log(`Player won: ${clearOutcome}`);
    console.log(`Active round: ${await contract.hasActiveRound(signer.address)}`);
  });

task("task:status", "Decrypts the last outcome and displays the current state")
  .addOptionalParam("address", "Optionally specify the NumberWar contract address")
  .addOptionalParam("player", "Player address to inspect")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get("NumberWar");

    const signers = await ethers.getSigners();
    const player = taskArguments.player ? await ethers.getAddress(taskArguments.player) : signers[0].address;
    const signer = signers.find((s) => s.address.toLowerCase() === player.toLowerCase()) ?? signers[0];

    const contract = await ethers.getContractAt("NumberWar", deployment.address);

    const active = await contract.hasActiveRound(player);
    console.log(`Active round: ${active}`);

    const encryptedOutcome = await contract.getLastOutcome(player);
    console.log(`Encrypted outcome: ${encryptedOutcome}`);

    if (encryptedOutcome !== ethers.ZeroHash) {
      const clearOutcome = await fhevm.userDecryptEbool(
        FhevmType.ebool,
        encryptedOutcome,
        deployment.address,
        signer,
      );
      console.log(`Player won: ${clearOutcome}`);
    } else {
      console.log("Player outcome unavailable");
    }
  });
