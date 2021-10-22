import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BeneficiaryRegistry } from "../typechain";

let owner: SignerWithAddress,
  unauthed: SignerWithAddress,
  beneficiary: SignerWithAddress,
  council: SignerWithAddress;
let registry: BeneficiaryRegistry;
const DEFAULT_REGION = ethers.utils.id("World");

describe("BeneficiaryRegistry", function () {
  beforeEach(async function () {
    [owner, unauthed, beneficiary, council] = await ethers.getSigners();

    const aclRegistry = await (
      await (await ethers.getContractFactory("ACLRegistry")).deploy()
    ).deployed();

    const contractRegistry = await (
      await (
        await ethers.getContractFactory("ContractRegistry")
      ).deploy(aclRegistry.address)
    ).deployed();

    registry = await (
      await (
        await ethers.getContractFactory("BeneficiaryRegistry")
      ).deploy(contractRegistry.address)
    ).deployed();

    await aclRegistry
      .connect(owner)
      .grantRole(ethers.utils.id("BeneficiaryGovernance"), owner.address);

    await aclRegistry
      .connect(owner)
      .grantRole(ethers.utils.id("Council"), council.address);

    await aclRegistry
      .connect(owner)
      .grantPermission(ethers.utils.id("World"), council.address);
  });

  it("Should add a beneficiary to the registry", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      DEFAULT_REGION,
      ethers.utils.formatBytes32String("testCid")
    );
    expect(await registry.beneficiaryExists(beneficiary.address)).to.equal(
      true
    );
  });

  it("Should not allow an unauthorized address to add a beneficiary to the registry", async function () {
    await expect(
      registry
        .connect(unauthed)
        .addBeneficiary(
          beneficiary.address,
          DEFAULT_REGION,
          ethers.utils.formatBytes32String("testCid")
        )
    ).to.be.revertedWith("you dont have the right role");
  });

  it("Should not allow an unauthorized address to revoke a beneficiary", async function () {
    await expect(
      registry.connect(unauthed).revokeBeneficiary(beneficiary.address)
    ).to.be.revertedWith(
      "Only the BeneficiaryGovernance or council may perform this action"
    );
  });

  it("Should revoke beneficiary as owner", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      DEFAULT_REGION,
      ethers.utils.formatBytes32String("testCid")
    );
    await registry.connect(owner).revokeBeneficiary(beneficiary.address);
    expect(await registry.beneficiaryExists(beneficiary.address)).to.equal(
      false
    );
  });

  it("Should revoke beneficiary as council", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      DEFAULT_REGION,
      ethers.utils.formatBytes32String("testCid")
    );
    await registry.connect(council).revokeBeneficiary(beneficiary.address);
    expect(await registry.beneficiaryExists(beneficiary.address)).to.equal(
      false
    );
  });

  it("Should get a beneficiary by address", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      DEFAULT_REGION,
      ethers.utils.formatBytes32String("testCid")
    );
    expect(
      ethers.utils.parseBytes32String(
        await registry.getBeneficiary(beneficiary.address)
      )
    ).to.equal("testCid");
  });

  it("Should get a beneficiary by address (public)", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      DEFAULT_REGION,
      ethers.utils.formatBytes32String("testCid")
    );
    expect(
      ethers.utils.parseBytes32String(
        await registry.connect(unauthed).getBeneficiary(beneficiary.address)
      )
    ).to.equal("testCid");
  });
});
