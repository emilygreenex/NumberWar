import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { NumberWar, NumberWar__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("NumberWar")) as NumberWar__factory;
  const numberWarContract = (await factory.deploy()) as NumberWar;
  const numberWarContractAddress = await numberWarContract.getAddress();

  return { numberWarContract, numberWarContractAddress };
}

describe("NumberWar", function () {
  let signers: Signers;
  let numberWarContract: NumberWar;
  let numberWarContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ numberWarContract, numberWarContractAddress } = await deployFixture());
  });

  it("assigns an encrypted system number between 1 and 10", async function () {
    const tx = await numberWarContract.connect(signers.alice).joinGame();
    await tx.wait();

    const encryptedNumber = await numberWarContract.getSystemNumber(signers.alice.address);
    const clearNumber = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedNumber,
      numberWarContractAddress,
      signers.alice,
    );

    expect(clearNumber).to.be.gte(1);
    expect(clearNumber).to.be.lte(10);
    expect(await numberWarContract.hasActiveRound(signers.alice.address)).to.eq(true);
  });

  it("confirms a winning round when the sum is even", async function () {
    const joinTx = await numberWarContract.connect(signers.alice).joinGame();
    await joinTx.wait();

    const encryptedNumber = await numberWarContract.getSystemNumber(signers.alice.address);
    const systemNumberRaw = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedNumber,
      numberWarContractAddress,
      signers.alice,
    );
    const systemNumber = Number(systemNumberRaw);
    const playerNumber = systemNumber % 2 === 0 ? 2 : 1;
    const encryptedInput = await fhevm
      .createEncryptedInput(numberWarContractAddress, signers.alice.address)
      .add8(BigInt(playerNumber))
      .encrypt();

    const submitTx = await numberWarContract
      .connect(signers.alice)
      .submitNumber(encryptedInput.handles[0], encryptedInput.inputProof);
    await submitTx.wait();

    const encryptedOutcome = await numberWarContract.getLastOutcome(signers.alice.address);
    const clearOutcome = await fhevm.debugger.decryptEbool(encryptedOutcome);

    expect(clearOutcome).to.eq(true);
    expect(await numberWarContract.hasActiveRound(signers.alice.address)).to.eq(false);
  });

  it("confirms a losing round when the sum is odd", async function () {
    const joinTx = await numberWarContract.connect(signers.alice).joinGame();
    await joinTx.wait();

    const encryptedNumber = await numberWarContract.getSystemNumber(signers.alice.address);
    const systemNumberRaw = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedNumber,
      numberWarContractAddress,
      signers.alice,
    );
    const systemNumber = Number(systemNumberRaw);
    const playerNumber = systemNumber % 2 === 0 ? 1 : 2;
    const encryptedInput = await fhevm
      .createEncryptedInput(numberWarContractAddress, signers.alice.address)
      .add8(BigInt(playerNumber))
      .encrypt();

    const submitTx = await numberWarContract
      .connect(signers.alice)
      .submitNumber(encryptedInput.handles[0], encryptedInput.inputProof);
    await submitTx.wait();

    const encryptedOutcome = await numberWarContract.getLastOutcome(signers.alice.address);
    const clearOutcome = await fhevm.debugger.decryptEbool(encryptedOutcome);

    expect(clearOutcome).to.eq(false);
  });
});
