import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  expectEvent,
  expectRevert,
  expectValue,
} from "../lib/utils/expectValue";
import BalanceTree from "../lib/utils/merkle_distributor/balanceTree";
import {
  ACLRegistry,
  AirdropDistributor,
  ContractRegistry,
  MockERC20,
} from "../typechain";

let admin: SignerWithAddress,
  other: SignerWithAddress,
  claimer: SignerWithAddress,
  claimer0: SignerWithAddress,
  claimer1: SignerWithAddress;

let contractRegistry: ContractRegistry;
let aclRegistry: ACLRegistry;
let airdropDistributor: AirdropDistributor;
let mockToken: MockERC20;

const ZERO_ROOT =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("AirdropDistributor", () => {
  beforeEach(async () => {
    [admin, other, claimer, claimer0, claimer1] = await ethers.getSigners();

    mockToken = await (
      await ethers.getContractFactory("MockERC20")
    ).deploy("Mock ERC20", "MOCK", 18);
    await mockToken.deployed();

    aclRegistry = await (
      await ethers.getContractFactory("ACLRegistry")
    ).deploy();
    await aclRegistry.deployed();

    contractRegistry = await (
      await ethers.getContractFactory("ContractRegistry")
    ).deploy(aclRegistry.address);
    contractRegistry.deployed();

    airdropDistributor = await (
      await ethers.getContractFactory("AirdropDistributor")
    ).deploy(contractRegistry.address);
    await airdropDistributor.deployed();

    await aclRegistry
      .connect(admin)
      .grantRole(ethers.utils.id("DAO"), admin.address);
  });

  context("setup", async () => {
    it("has a contract registry", async () => {
      await expectValue(
        await airdropDistributor.contractRegistry(),
        contractRegistry.address
      );
    });

    it("has an ACL registry", async () => {
      await expectValue(
        await airdropDistributor.aclRegistry(),
        aclRegistry.address
      );
    });
  });

  context("creating airdrops", async () => {
    it("DAO role can add a new airdrop", async () => {
      await airdropDistributor.addAirdrop(mockToken.address, ZERO_ROOT);
      const [address, merkleRoot] = await airdropDistributor.airdrops(1);
      await expectValue(address, mockToken.address);
      await expectValue(merkleRoot, ZERO_ROOT);
    });

    it("Others cannot add a new airdrop", async () => {
      await expectRevert(
        airdropDistributor
          .connect(other)
          .addAirdrop(mockToken.address, ZERO_ROOT),
        "you dont have the right role"
      );
    });
  });

  context("claims", async () => {
    describe("empty proof", async () => {
      it("Claim fails for empty proof", async () => {
        await airdropDistributor.addAirdrop(mockToken.address, ZERO_ROOT);
        await expectRevert(
          airdropDistributor
            .connect(claimer)
            .claim(1, 0, claimer.address, 10, []),
          "Invalid proof."
        );
      });

      it("Claim fails for invalid airdrop", async () => {
        await expectRevert(
          airdropDistributor
            .connect(claimer)
            .claim(0, 0, claimer.address, 10, []),
          "Invalid proof."
        );
      });
    });

    describe("two account tree", async () => {
      let tree: BalanceTree;

      beforeEach(async () => {
        tree = new BalanceTree([
          { account: claimer0.address, amount: parseEther("100") },
          { account: claimer1.address, amount: parseEther("101") },
        ]);
        await airdropDistributor
          .connect(admin)
          .addAirdrop(mockToken.address, tree.getHexRoot());
        await mockToken.mint(airdropDistributor.address, parseEther("201"));
      });

      it("successful claims", async () => {
        const proof0 = tree.getProof(0, claimer0.address, parseEther("100"));
        await expectEvent(
          await airdropDistributor
            .connect(claimer0)
            .claim(1, 0, claimer0.address, parseEther("100"), proof0),
          airdropDistributor,
          "Claim",
          [1, 0, claimer0.address, parseEther("100")]
        );

        const proof1 = tree.getProof(1, claimer1.address, parseEther("101"));
        await expectEvent(
          await airdropDistributor
            .connect(claimer0)
            .claim(1, 1, claimer1.address, parseEther("101"), proof1),
          airdropDistributor,
          "Claim",
          [1, 1, claimer1.address, parseEther("101")]
        );
      });

      it("transfers tokens", async () => {
        await expectValue(await mockToken.balanceOf(claimer0.address), 0);
        const proof0 = tree.getProof(0, claimer0.address, parseEther("100"));
        await airdropDistributor
          .connect(claimer0)
          .claim(1, 0, claimer0.address, parseEther("100"), proof0);
        await expectValue(
          await mockToken.balanceOf(claimer0.address),
          parseEther("100")
        );
      });

      it("transfers tokens to correct claimant when claimed by third party", async () => {
        await expectValue(await mockToken.balanceOf(claimer0.address), 0);
        await expectValue(await mockToken.balanceOf(claimer1.address), 0);
        const proof0 = tree.getProof(0, claimer0.address, parseEther("100"));
        await airdropDistributor
          .connect(claimer1)
          .claim(1, 0, claimer0.address, parseEther("100"), proof0);
        await expectValue(
          await mockToken.balanceOf(claimer0.address),
          parseEther("100")
        );
        await expectValue(await mockToken.balanceOf(claimer1.address), 0);
      });

      it("sets isClaimed", async () => {
        const proof0 = tree.getProof(0, claimer0.address, parseEther("100"));
        await expectValue(await airdropDistributor.isClaimed(1, 0), false);
        await expectValue(await airdropDistributor.isClaimed(1, 1), false);
        await airdropDistributor
          .connect(claimer1)
          .claim(1, 0, claimer0.address, parseEther("100"), proof0);
        await expectValue(await airdropDistributor.isClaimed(1, 0), true);
        await expectValue(await airdropDistributor.isClaimed(1, 1), false);
      });
    });
  });
});
