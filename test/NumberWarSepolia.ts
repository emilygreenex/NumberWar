import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployments, ethers, fhevm } from "hardhat";
import { NumberWar } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("NumberWarSepolia", function () {
  let signers: Signers;
  let numberWarContract: NumberWar;
  let numberWarContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("NumberWar");
      numberWarContractAddress = deployment.address;
      numberWarContract = await ethers.getContractAt("NumberWar", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("plays a round and decrypts results", async function () {
    steps = 6;

    this.timeout(4 * 40000);

    progress("Calling joinGame()");
    const tx = await numberWarContract.connect(signers.alice).joinGame();
    await tx.wait();

    progress("Reading encrypted system number");
    const encryptedNumber = await numberWarContract.getSystemNumber(signers.alice.address);
    expect(encryptedNumber).to.not.eq(ethers.ZeroHash);

    progress("Decrypting system number");
    const clearNumber = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedNumber,
      numberWarContractAddress,
      signers.alice,
    );
    progress(`System number: ${clearNumber}`);

    progress("Encrypting player number 1");
    const encryptedInput = await fhevm
      .createEncryptedInput(numberWarContractAddress, signers.alice.address)
      .add8(1)
      .encrypt();

    progress("Submitting player number");
    const submitTx = await numberWarContract
      .connect(signers.alice)
      .submitNumber(encryptedInput.handles[0], encryptedInput.inputProof);
    await submitTx.wait();

    progress("Decrypting outcome");
    const encryptedOutcome = await numberWarContract.getLastOutcome(signers.alice.address);
    await fhevm.userDecryptEbool(
      FhevmType.ebool,
      encryptedOutcome,
      numberWarContractAddress,
      signers.alice,
    );
  });
});
