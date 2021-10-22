import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { utils } from "ethers";
import { ethers, waffle } from "hardhat";
import {
  ACLRegistry,
  BeneficiaryRegistry,
  BeneficiaryVaults,
  ContractRegistry,
  IUniswapV2Pair,
  KeeperIncentive,
  MockERC20,
  Region,
  RewardsEscrow,
  RewardsManager,
  Staking,
  UniswapV2Router02,
  WETH9,
} from "../typechain";
const UniswapV2FactoryJSON = require("../artifactsUniswap/UniswapV2Factory.json");
const UniswapV2Router02JSON = require("../artifactsUniswap/UniswapV2Router.json");
const UniswapV2PairJSON = require("../artifactsUniswap/UniswapV2Pair.json");

const overrides = {
  gasLimit: 9999999,
};

let owner: SignerWithAddress;
let contracts: Contracts;
const provider = waffle.provider;
const DEFAULT_REGION = ethers.utils.id("World");

interface Contracts {
  pop: MockERC20;
  testERC20: MockERC20;
  weth: WETH9;
  region: Region;
  insurance: Contract;
  treasury: Contract;
  aclRegistry: ACLRegistry;
  beneficiaryVaults: BeneficiaryVaults;
  beneficiaryRegistry: BeneficiaryRegistry;
  staking: Staking;
  rewardsManager: RewardsManager;
  uniswapRouter: UniswapV2Router02;
  wethPair: IUniswapV2Pair;
  testERC20Pair: IUniswapV2Pair;
  rewardsEscrow: RewardsEscrow;
  keeperIncentive: KeeperIncentive;
  contractRegistry: ContractRegistry;
}

async function deployContracts(): Promise<Contracts> {
  const mockERC20Factory = await ethers.getContractFactory("MockERC20");
  const pop = (await mockERC20Factory.deploy(
    "Testpop",
    "Tpop",
    18
  )) as MockERC20;
  const testERC20 = (await mockERC20Factory.deploy(
    "TestToken",
    "TT",
    18
  )) as MockERC20;

  const weth = (await (
    await (await ethers.getContractFactory("WETH9")).deploy()
  ).deployed()) as WETH9;

  const insurance = (await (
    await (await ethers.getContractFactory("MockInsurance")).deploy()
  ).deployed()) as unknown as Contract;

  const treasury = (await (
    await (await ethers.getContractFactory("MockTreasury")).deploy()
  ).deployed()) as unknown as Contract;

  const aclRegistry = await (
    await (await ethers.getContractFactory("ACLRegistry")).deploy()
  ).deployed();

  const contractRegistry = await (
    await (
      await ethers.getContractFactory("ContractRegistry")
    ).deploy(aclRegistry.address)
  ).deployed();

  const beneficiaryVaults = await (
    await (
      await ethers.getContractFactory("BeneficiaryVaults")
    ).deploy(contractRegistry.address)
  ).deployed();

  const region = await (
    await (
      await ethers.getContractFactory("Region")
    ).deploy(beneficiaryVaults.address, contractRegistry.address)
  ).deployed();

  const beneficiaryRegistry = await (
    await (
      await ethers.getContractFactory("BeneficiaryRegistry")
    ).deploy(contractRegistry.address)
  ).deployed();

  const rewardsEscrow = (await (
    await (
      await ethers.getContractFactory("RewardsEscrow")
    ).deploy(contractRegistry.address)
  ).deployed()) as RewardsEscrow;

  const staking = (await (
    await (
      await ethers.getContractFactory("Staking")
    ).deploy(contractRegistry.address)
  ).deployed()) as Staking;

  const keeperIncentive = await (
    await (
      await ethers.getContractFactory("KeeperIncentive")
    ).deploy(contractRegistry.address)
  ).deployed();

  const factoryV2 = await deployContract(owner, UniswapV2FactoryJSON, [
    owner.address,
  ]);

  const uniswapRouter = (await deployContract(
    owner,
    UniswapV2Router02JSON,
    [factoryV2.address, weth.address],
    overrides
  )) as UniswapV2Router02;

  const rewardsManager = (await (
    await (
      await ethers.getContractFactory("RewardsManager")
    ).deploy(contractRegistry.address, uniswapRouter.address)
  ).deployed()) as RewardsManager;

  await factoryV2.createPair(weth.address, pop.address);
  await factoryV2.createPair(testERC20.address, pop.address);

  const wethPairAddress = await factoryV2.getPair(weth.address, pop.address);
  const testERC20PairAddress = await factoryV2.getPair(
    testERC20.address,
    pop.address
  );

  const wethPair = new Contract(
    wethPairAddress,
    JSON.stringify(UniswapV2PairJSON.abi),
    owner
  ) as unknown as IUniswapV2Pair;
  const testERC20Pair = new Contract(
    testERC20PairAddress,
    JSON.stringify(UniswapV2PairJSON.abi),
    owner
  ) as unknown as IUniswapV2Pair;

  await aclRegistry
    .connect(owner)
    .grantRole(ethers.utils.id("DAO"), owner.address);
  await aclRegistry
    .connect(owner)
    .grantRole(ethers.utils.id("Keeper"), owner.address);
  await aclRegistry
    .connect(owner)
    .grantRole(ethers.utils.id("RewardsManager"), rewardsManager.address);

  await keeperIncentive
    .connect(owner)
    .createIncentive(
      utils.formatBytes32String("RewardsManager"),
      0,
      true,
      false
    );

  await keeperIncentive
    .connect(owner)
    .createIncentive(
      utils.formatBytes32String("RewardsManager"),
      0,
      true,
      false
    );

  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("POP"), pop.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("Region"),
      region.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("Insurance"),
      insurance.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("Treasury"),
      treasury.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("BeneficiaryRegistry"),
      beneficiaryRegistry.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("Staking"),
      staking.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("RewardsEscrow"),
      rewardsEscrow.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("RewardsManager"),
      rewardsManager.address,
      ethers.utils.id("1")
    );
  await contractRegistry
    .connect(owner)
    .addContract(
      ethers.utils.id("KeeperIncentive"),
      keeperIncentive.address,
      ethers.utils.id("1")
    );

  return {
    pop,
    testERC20,
    weth,
    region,
    insurance,
    treasury,
    aclRegistry,
    beneficiaryVaults,
    beneficiaryRegistry,
    staking,
    rewardsManager,
    uniswapRouter,
    wethPair,
    testERC20Pair,
    rewardsEscrow,
    keeperIncentive,
    contractRegistry,
  };
}

async function prepareContracts(): Promise<void> {
  const currentBlockNumber = await provider.getBlockNumber();
  const currentTimestamp = await (
    await ethers.provider.getBlock(currentBlockNumber)
  ).timestamp;
  await contracts.pop.mint(owner.address, parseEther("100000"));
  await contracts.testERC20.mint(owner.address, parseEther("10000"));
  await contracts.pop
    .connect(owner)
    .approve(contracts.uniswapRouter.address, parseEther("10000"));
  await contracts.testERC20
    .connect(owner)
    .approve(contracts.uniswapRouter.address, parseEther("10000"));
  await contracts.uniswapRouter.addLiquidityETH(
    contracts.pop.address,
    parseEther("1000"),
    parseEther("1000"),
    parseEther("1"),
    owner.address,
    currentTimestamp + 60,
    { ...overrides, value: parseEther("1") }
  );
  await contracts.uniswapRouter.addLiquidity(
    contracts.pop.address,
    contracts.testERC20.address,
    parseEther("1000"),
    parseEther("1000"),
    parseEther("1000"),
    parseEther("1000"),
    owner.address,
    currentTimestamp + 60
  );
  await contracts.keeperIncentive
    .connect(owner)
    .createIncentive(
      utils.formatBytes32String("RewardsManager"),
      0,
      true,
      false
    );
  await contracts.keeperIncentive
    .connect(owner)
    .createIncentive(
      utils.formatBytes32String("RewardsManager"),
      0,
      true,
      false
    );
  await contracts.keeperIncentive
    .connect(owner)
    .addControllerContract(
      utils.formatBytes32String("RewardsManager"),
      contracts.rewardsManager.address
    );
}

describe("Integration", function () {
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    contracts = await deployContracts();
    await prepareContracts();
  });

  describe("swapTokenForRewards", function () {
    it("swaps ERC20 to pop", async function () {
      await contracts.testERC20
        .connect(owner)
        .transfer(contracts.rewardsManager.address, parseEther("10"));
      expect(
        await contracts.testERC20.balanceOf(contracts.rewardsManager.address)
      ).to.equal(parseEther("10"));

      const amountOut = await contracts.uniswapRouter.getAmountsOut(
        parseEther("10"),
        [contracts.testERC20.address, contracts.pop.address]
      );
      await contracts.rewardsManager.swapTokenForRewards(
        [contracts.testERC20.address, contracts.pop.address],
        amountOut[1]
      );
      expect(
        await contracts.pop.balanceOf(contracts.rewardsManager.address)
      ).to.equal(amountOut[1]);
    });
  });
  describe("distributeRewards", function () {
    beforeEach(async function () {
      await contracts.pop.mint(
        contracts.rewardsManager.address,
        parseEther("100")
      );
    });

    it("distribute rewards to contracts", async function () {
      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("32"));
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(
        await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)
      ).to.equal(parseEther("34"));
    });

    it("distribute rewards according to current split", async function () {
      await contracts.rewardsManager.setRewardSplits([
        parseEther("20"),
        parseEther("18"),
        parseEther("2"),
        parseEther("60"),
      ]);
      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("20")
      );
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("18"));
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(
        await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)
      ).to.equal(parseEther("60"));
    });

    it("distribute rewards to newly set Insurance", async function () {
      const newInsurance = await (
        await (await ethers.getContractFactory("MockInsurance")).deploy()
      ).deployed();

      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("32"));
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(
        await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)
      ).to.equal(parseEther("34"));

      await contracts.pop.mint(
        contracts.rewardsManager.address,
        parseEther("100")
      );

      await contracts.contractRegistry.updateContract(
        ethers.utils.id("Insurance"),
        newInsurance.address,
        ethers.utils.id("1")
      );
      await contracts.rewardsManager.distributeRewards();
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(await contracts.pop.balanceOf(newInsurance.address)).to.equal(
        parseEther("2")
      );
    });
    it("distribute rewards to newly set Treasury", async function () {
      const newTreasury = await (
        await (await ethers.getContractFactory("MockTreasury")).deploy()
      ).deployed();

      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("32"));
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(
        await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)
      ).to.equal(parseEther("34"));

      await contracts.pop.mint(
        contracts.rewardsManager.address,
        parseEther("100")
      );

      await contracts.contractRegistry.updateContract(
        ethers.utils.id("Treasury"),
        newTreasury.address,
        ethers.utils.id("1")
      );
      await contracts.rewardsManager.distributeRewards();
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("32"));
      expect(await contracts.pop.balanceOf(newTreasury.address)).to.equal(
        parseEther("32")
      );
    });

    it("distribute rewards to newly set Staking", async function () {
      const newStaking = await (
        await (
          await ethers.getContractFactory("Staking")
        ).deploy(contracts.contractRegistry.address)
      ).deployed();

      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("32"));
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(
        await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)
      ).to.equal(parseEther("34"));

      await contracts.pop.mint(
        contracts.rewardsManager.address,
        parseEther("100")
      );

      await contracts.contractRegistry.updateContract(
        ethers.utils.id("Staking"),
        newStaking.address,
        ethers.utils.id("1")
      );
      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(await contracts.pop.balanceOf(newStaking.address)).to.equal(
        parseEther("32")
      );
    });

    it("distribute rewards to newly set BeneficiaryVaults", async function () {
      const newBeneficiaryVaults = await (
        await (
          await ethers.getContractFactory("BeneficiaryVaults")
        ).deploy(contracts.contractRegistry.address)
      ).deployed();

      await contracts.region
        .connect(owner)
        .addRegion(ethers.utils.id("NewRegion"), newBeneficiaryVaults.address);

      await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(
        await contracts.pop.balanceOf(contracts.treasury.address)
      ).to.equal(parseEther("32"));
      expect(
        await contracts.pop.balanceOf(contracts.insurance.address)
      ).to.equal(parseEther("2"));
      expect(
        await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)
      ).to.equal(parseEther("17"));
      expect(
        await contracts.pop.balanceOf(newBeneficiaryVaults.address)
      ).to.equal(parseEther("17"));
    });
    it("distribute rewards to contracts", async function () {
      const result = await contracts.rewardsManager.distributeRewards();
      expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
        parseEther("32")
      );
      expect(result)
        .to.emit(contracts.staking, "RewardAdded")
        .withArgs(parseEther("32"));
    });
  });
});
