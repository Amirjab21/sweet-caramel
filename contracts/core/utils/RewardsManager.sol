// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./KeeperIncentive.sol";
import "../interfaces/IRegion.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IInsurance.sol";
import "../interfaces/IBeneficiaryVaults.sol";
import "../interfaces/IRewardsManager.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

/**
 * @title Popcorn Rewards Manager
 * @notice Manages distribution of POP rewards to Popcorn Treasury, DAO Staking, and Beneficiaries
 */
contract RewardsManager is IRewardsManager, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  enum RewardTargets {
    Staking,
    Treasury,
    Insurance,
    BeneficiaryVaults
  }

  /* ========== STATE VARIABLES ========== */

  uint256 public constant SWAP_TIMEOUT = 600;
  bytes32 public immutable contractName = "RewardsManager";

  IContractRegistry public contractRegistry;
  IUniswapV2Router02 public immutable uniswapV2Router;

  uint256[4] public rewardSplits;
  mapping(uint8 => uint256[2]) private rewardLimits;

  /* ========== EVENTS ========== */

  event StakingDeposited(address to, uint256 amount);
  event TreasuryDeposited(address to, uint256 amount);
  event InsuranceDeposited(address to, uint256 amount);
  event BeneficiaryVaultsDeposited(uint256 amount);
  event RewardsDistributed(uint256 amount);
  event RewardSplitsUpdated(uint256[4] splits);
  event TokenSwapped(address token, uint256 amountIn, uint256 amountOut);
  event RegionChanged(IRegion from, IRegion to);

  /* ========== CONSTRUCTOR ========== */

  constructor(
    IContractRegistry contractRegistry_,
    IUniswapV2Router02 uniswapV2Router_
  ) {
    contractRegistry = contractRegistry_;
    uniswapV2Router = uniswapV2Router_;
    rewardLimits[uint8(RewardTargets.Staking)] = [20e18, 80e18];
    rewardLimits[uint8(RewardTargets.Treasury)] = [10e18, 80e18];
    rewardLimits[uint8(RewardTargets.Insurance)] = [0, 10e18];
    rewardLimits[uint8(RewardTargets.BeneficiaryVaults)] = [20e18, 90e18];
    rewardSplits = [32e18, 32e18, 2e18, 34e18];
  }

  /* ========== VIEW FUNCTIONS ========== */

  function getRewardSplits() external view returns (uint256[4] memory) {
    return rewardSplits;
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  receive() external payable {}

  /**
   * @param path_ Uniswap path specification for source token to POP
   * @param minAmountOut_ Minimum desired amount (>0) of POP tokens to be received from swap
   * @dev Path specification requires at least source token as first in path and POP address as last
   * @dev Token swap internals implemented as described at https://uniswap.org/docs/v2/smart-contracts/router02/#swapexacttokensfortokens
   * @return swapped in/out amounts uint256 tuple
   */
  function swapTokenForRewards(address[] calldata path_, uint256 minAmountOut_)
    public
    nonReentrant
    returns (uint256[] memory)
  {
    KeeperIncentive(contractRegistry.getContract(keccak256("KeeperIncentive")))
      .handleKeeperIncentive(contractName, 0, msg.sender);
    require(path_.length >= 2, "Invalid swap path");
    require(minAmountOut_ > 0, "Invalid amount");
    require(
      path_[path_.length - 1] == contractRegistry.getContract(keccak256("POP")),
      "POP must be last in path"
    );

    IERC20 _token = IERC20(path_[0]);
    uint256 _balance = _token.balanceOf(address(this));
    require(_balance > 0, "No swappable balance");

    _token.safeIncreaseAllowance(address(uniswapV2Router), _balance);
    uint256[] memory _amounts = uniswapV2Router.swapExactTokensForTokens(
      _balance,
      minAmountOut_,
      path_,
      address(this),
      block.timestamp.add(SWAP_TIMEOUT)
    );
    emit TokenSwapped(path_[0], _amounts[0], _amounts[1]);

    return _amounts;
  }

  /**
   * @notice Distribute POP rewards to dependent RewardTarget contracts
   * @dev Contract must have POP balance in order to distribute according to rewardSplits ratio
   */
  function distributeRewards() public nonReentrant {
    KeeperIncentive(contractRegistry.getContract(keccak256("KeeperIncentive")))
      .handleKeeperIncentive(contractName, 1, msg.sender);
    uint256 _availableReward = IERC20(
      contractRegistry.getContract(keccak256("POP"))
    ).balanceOf(address(this));
    require(_availableReward > 0, "No POP balance");

    //@todo check edge case precision overflow
    uint256 _stakingAmount = _availableReward
      .mul(rewardSplits[uint8(RewardTargets.Staking)])
      .div(100e18);
    uint256 _treasuryAmount = _availableReward
      .mul(rewardSplits[uint8(RewardTargets.Treasury)])
      .div(100e18);
    uint256 _insuranceAmount = _availableReward
      .mul(rewardSplits[uint8(RewardTargets.Insurance)])
      .div(100e18);
    uint256 _beneficiaryVaultsAmount = _availableReward
      .mul(rewardSplits[uint8(RewardTargets.BeneficiaryVaults)])
      .div(100e18);

    _distributeToStaking(_stakingAmount);
    _distributeToTreasury(_treasuryAmount);
    _distributeToInsurance(_insuranceAmount);
    _distributeToVaults(_beneficiaryVaultsAmount);

    emit RewardsDistributed(_availableReward);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function _distributeToStaking(uint256 amount_) internal {
    if (amount_ == 0) return;
    address staking = contractRegistry.getContract(keccak256("Staking"));

    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(
      staking,
      amount_
    );
    IStaking(staking).notifyRewardAmount(amount_);
    emit StakingDeposited(staking, amount_);
  }

  function _distributeToTreasury(uint256 amount_) internal {
    if (amount_ == 0) return;
    address treasury = contractRegistry.getContract(keccak256("Treasury"));
    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(
      treasury,
      amount_
    );
    emit TreasuryDeposited(treasury, amount_);
  }

  function _distributeToInsurance(uint256 amount_) internal {
    if (amount_ == 0) return;
    address insurance = contractRegistry.getContract(keccak256("Insurance"));
    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(
      insurance,
      amount_
    );
    emit InsuranceDeposited(insurance, amount_);
  }

  function _distributeToVaults(uint256 amount_) internal {
    if (amount_ == 0) return;
    //This might lead to a gas overflow since the region array is unbound
    IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
    address[] memory regionVaults = IRegion(
      contractRegistry.getContract(keccak256("Region"))
    ).getAllVaults();
    uint256 split = amount_.div(regionVaults.length);
    for (uint256 i; i < regionVaults.length; i++) {
      POP.transfer(regionVaults[i], split);
    }
    emit BeneficiaryVaultsDeposited(amount_);
  }

  /* ========== SETTER ========== */

  /**
   * @notice Set new reward distribution allocations
   * @param splits_ Array of RewardTargets enumerated uint256 values within rewardLimits range
   * @dev Values must be within rewardsLimit range, specified in percent to 18 decimal place precision
   */
  function setRewardSplits(uint256[4] calldata splits_) public {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    uint256 _total = 0;
    for (uint8 i = 0; i < 4; i++) {
      require(
        splits_[i] >= rewardLimits[i][0] && splits_[i] <= rewardLimits[i][1],
        "Invalid split"
      );
      _total = _total.add(splits_[i]);
    }
    require(_total == 100e18, "Invalid split total");
    rewardSplits = splits_;
    emit RewardSplitsUpdated(splits_);
  }
}
