pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

contract ParticipationReward is ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */
  enum VaultStatus {
    Init,
    Open
  }

  struct Vault {
    VaultStatus status;
    uint256 endTime;
    uint256 shares;
    uint256 tokenBalance;
    mapping(address => uint256) shareBalances;
    mapping(address => bool) claimed;
  }

  IContractRegistry public contractRegistry;

  uint256 public rewardBalance;
  uint256 public totalVaultsBudget;
  mapping(bytes32 => uint256) public rewardBudgets;
  mapping(bytes32 => Vault) public vaults;
  mapping(address => bytes32[]) public userVaults;
  mapping(bytes32 => address) public controllerContracts;
  mapping(bytes32 => bool) public rewardsEnabled;

  /* ========== EVENTS ========== */
  event RewardBudgetChanged(bytes32 contractName_, uint256 amount);
  event VaultInitialized(bytes32 vaultId);
  event VaultOpened(bytes32 vaultId);
  event VaultClosed(bytes32 vaultId);
  event RewardClaimed(bytes32 vaultId, address account_, uint256 amount);
  event RewardsClaimed(address account_, uint256 amount);
  event SharesAdded(bytes32 vaultId_, address account_, uint256 shares_);
  event RewardBalanceIncreased(address account, uint256 amount);
  event ControllerContractAdded(bytes32 contractName_, address contract_);
  event RewardsToggled(bytes32 contractName_, bool prevState, bool newState);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
  }

  /* ========== VIEWS ========== */

  function isClaimable(bytes32 vaultId_, address beneficiary_)
    public
    view
    vaultExists(vaultId_)
    returns (bool)
  {
    return
      vaults[vaultId_].status == VaultStatus.Open &&
      vaults[vaultId_].shareBalances[beneficiary_] > 0 &&
      vaults[vaultId_].claimed[beneficiary_] == false;
  }

  /**
   * @notice Checks if a beneficiary has a claim in the specified vault
   * @param vaultId_ Bytes32
   * @param beneficiary_ address of the beneficiary
   */
  function hasClaim(bytes32 vaultId_, address beneficiary_)
    public
    view
    vaultExists(vaultId_)
    returns (bool)
  {
    return
      vaults[vaultId_].shareBalances[beneficiary_] > 0 &&
      vaults[vaultId_].claimed[beneficiary_] == false;
  }

  /**
   * @notice Returns the vault status
   * @param vaultId_ Bytes32
   */
  function getVaultStatus(bytes32 vaultId_)
    external
    view
    returns (VaultStatus)
  {
    return vaults[vaultId_].status;
  }

  /**
   * @notice Returns all vaultIds which an account has/had claims in
   * @param account address
   */
  function getUserVaults(address account)
    external
    view
    returns (bytes32[] memory)
  {
    return userVaults[account];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice Initializes a vault for voting claims
   * @param contractName_ Name of contract that uses ParticipationRewards in bytes32
   * @param vaultId_ Bytes32
   * @param endTime_ Unix timestamp in seconds after which a vault can be closed
   * @dev There must be enough funds in this contract to support opening another vault
   */
  function initializeVault(
    bytes32 contractName_,
    bytes32 vaultId_,
    uint256 endTime_
  ) external onlyControllerContract(contractName_) returns (bool, bytes32) {
    require(
      rewardsEnabled[contractName_],
      "participationRewards are not enabled for this contract"
    );
    require(vaults[vaultId_].endTime == 0, "Vault must not exist");
    require(endTime_ > block.timestamp, "end must be in the future");

    uint256 expectedVaultBudget = totalVaultsBudget.add(
      rewardBudgets[contractName_]
    );
    if (expectedVaultBudget > rewardBalance || rewardBalance == 0) {
      return (false, "");
    }

    totalVaultsBudget = expectedVaultBudget;

    Vault storage vault = vaults[vaultId_];
    vault.endTime = endTime_;
    vault.tokenBalance = rewardBudgets[contractName_];

    emit VaultInitialized(vaultId_);
    return (true, vaultId_);
  }

  /**
   * @notice Open a vault it can receive rewards and accept claims
   * @dev Vault must be in an initialized state
   * @param contractName_ the controller contract
   * @param vaultId_ Vault ID in bytes32
   */
  function openVault(bytes32 contractName_, bytes32 vaultId_)
    external
    onlyControllerContract(contractName_)
    vaultExists(vaultId_)
  {
    require(
      vaults[vaultId_].status == VaultStatus.Init,
      "Vault must be initialized"
    );
    require(
      vaults[vaultId_].endTime <= block.timestamp,
      "wait till endTime is over"
    );
    //TODO should vaults also be mapped to contracts? Currently contract A could technically open vaults for contract B the only protection against that is governance who decides which contracts get added
    vaults[vaultId_].status = VaultStatus.Open;

    emit VaultOpened(vaultId_);
  }

  /**
   * @notice Adds Shares of an account to the current vault
   * @param contractName_ the controller contract
   * @param vaultId_ Bytes32
   * @param account_ address
   * @param shares_ uint256
   * @dev This will be called by contracts after an account has voted in order to add them to the vault of the specified election.
   */
  function addShares(
    bytes32 contractName_,
    bytes32 vaultId_,
    address account_,
    uint256 shares_
  ) external onlyControllerContract(contractName_) vaultExists(vaultId_) {
    require(
      vaults[vaultId_].status == VaultStatus.Init,
      "Vault must be initialized"
    );
    vaults[vaultId_].shares = vaults[vaultId_].shares.add(shares_);
    vaults[vaultId_].shareBalances[account_] = shares_;

    userVaults[account_].push(vaultId_);

    emit SharesAdded(vaultId_, account_, shares_);
  }

  /**
   * @notice Claim rewards of a vault
   * @param index_ uint256
   * @dev Uses the vaultId_ at the specified index of userVaults.
   * @dev This function is used when a user only wants to claim a specific vault or if they decide the gas cost of claimRewards are to high for now.
   * @dev (lower cost but also lower reward)
   */
  function claimReward(uint256 index_) external nonReentrant {
    bytes32 vaultId_ = userVaults[msg.sender][index_];
    require(vaults[vaultId_].status == VaultStatus.Open, "vault is not open");
    require(!vaults[vaultId_].claimed[msg.sender], "already claimed");
    uint256 reward = _claimVaultReward(vaultId_, index_, msg.sender);
    require(reward > 0, "no rewards");
    require(reward <= rewardBalance, "not enough funds for payout");

    totalVaultsBudget = totalVaultsBudget.sub(reward);
    rewardBalance = rewardBalance.sub(reward);

    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransfer(
      msg.sender,
      reward
    );

    emit RewardsClaimed(msg.sender, reward);
  }

  /**
   * @notice Claim rewards of a a number of vaults
   * @param indices_ uint256[]
   * @dev Uses the vaultIds at the specified indices of userVaults.
   * @dev This function is used when a user only wants to claim multiple vaults at once (probably most of the time)
   * @dev The array of indices is limited to 19 as we want to prevent gas overflow of looping through too many vaults
   */
  function claimRewards(uint256[] calldata indices_) external nonReentrant {
    require(indices_.length < 20, "claiming too many vaults");
    uint256 total;

    for (uint256 i = 0; i < indices_.length; i++) {
      bytes32 vaultId_ = userVaults[msg.sender][indices_[i]];
      if (
        vaults[vaultId_].status == VaultStatus.Open &&
        !vaults[vaultId_].claimed[msg.sender]
      ) {
        total = total.add(_claimVaultReward(vaultId_, indices_[i], msg.sender));
      }
    }

    require(total > 0, "no rewards");
    require(total <= rewardBalance, "not enough funds for payout");

    totalVaultsBudget = totalVaultsBudget.sub(total);
    rewardBalance = rewardBalance.sub(total);

    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransfer(
      msg.sender,
      total
    );

    emit RewardsClaimed(msg.sender, total);
  }

  /**
   * @notice Underlying function to calculate the rewards that a user gets and set the vault to claimed
   * @param vaultId_ Bytes32
   * @param index_ uint256
   * @param account_ address
   * @dev We dont want it to error when a vault is empty for the user as this would terminate the entire loop when used in claimRewards()
   */
  function _claimVaultReward(
    bytes32 vaultId_,
    uint256 index_,
    address account_
  ) internal returns (uint256) {
    uint256 userShares = vaults[vaultId_].shareBalances[account_];
    if (userShares > 0) {
      uint256 reward = vaults[vaultId_].tokenBalance.mul(userShares).div(
        vaults[vaultId_].shares
      );
      vaults[vaultId_].tokenBalance = vaults[vaultId_].tokenBalance.sub(reward);
      vaults[vaultId_].claimed[account_] = true;

      delete userVaults[account_][index_];
      return reward;
    }
    return 0;
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  /**
   * @notice Sets the budget of rewards in POP per vault
   * @param contractName_ the name of the controller contract in bytes32
   * @param amount uint256 reward amount in POP per vault
   * @dev When opening a vault this contract must have enough POP to fund the rewardBudgets of the new vault
   * @dev Every controller contract has their own rewardsBudget to set indivual rewards per controller contract
   */
  function setRewardsBudget(bytes32 contractName_, uint256 amount) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    require(amount > 0, "must be larger 0");
    rewardBudgets[contractName_] = amount;
    emit RewardBudgetChanged(contractName_, amount);
  }

  /**
   * @notice In order to allow a contract to use ParticipationReward they need to be added as a controller contract
   * @param contractName_ the name of the controller contract in bytes32
   * @param contract_ the address of the controller contract
   * @dev all critical functions to init/open vaults and add shares to them can only be called by controller contracts
   */
  function addControllerContract(bytes32 contractName_, address contract_)
    external
  {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    controllerContracts[contractName_] = contract_;
    rewardsEnabled[contractName_] = true;
    emit ControllerContractAdded(contractName_, contract_);
  }

  /**
   * @notice Governance can disable rewards for a controller contract in order to stop an unused contract to leech rewards
   * @param contractName_ the address of the controller contract
   * @dev all critical functions to init/open vaults and add shares to them can only be called by controller contracts
   */
  function toggleRewards(bytes32 contractName_) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    bool prevState = rewardsEnabled[contractName_];
    rewardsEnabled[contractName_] = !prevState;
    emit RewardsToggled(
      contractName_,
      prevState,
      rewardsEnabled[contractName_]
    );
  }

  /**
   * @notice Transfer POP to the contract for vault rewards
   * @param amount uint256 amount in POP to be used for vault rewards
   * @dev Sufficient RewardsBalance will be checked when opening a new vault to see if enough POP exist to support the new Vault
   */
  function contributeReward(uint256 amount) external {
    require(amount > 0, "must be larger 0");
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransferFrom(
      msg.sender,
      address(this),
      amount
    );
    rewardBalance = rewardBalance.add(amount);
    emit RewardBalanceIncreased(msg.sender, amount);
  }

  /* ========== MODIFIERS ========== */

  /**
   * @notice Modifier to check if a vault exists
   * @param vaultId_ Bytes32
   */
  modifier vaultExists(bytes32 vaultId_) {
    require(vaults[vaultId_].endTime > 0, "Uninitialized vault slot");
    _;
  }

  /**
   * @notice Checks if the msg.sender is the controllerContract
   * @param contractName_ Bytes32
   */
  modifier onlyControllerContract(bytes32 contractName_) {
    require(
      msg.sender == controllerContracts[contractName_],
      "Can only be called by the controlling contract"
    );
    _;
  }
}
