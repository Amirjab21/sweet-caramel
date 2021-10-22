pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

contract KeeperIncentive {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  struct Incentive {
    uint256 reward; //pop reward for calling the function
    bool enabled;
    bool openToEveryone; //can everyone call the function to get the reward or only approved?
  }

  /* ========== STATE VARIABLES ========== */

  IContractRegistry public contractRegistry;

  uint256 public incentiveBudget;
  mapping(bytes32 => Incentive[]) public incentives;
  mapping(bytes32 => address) public controllerContracts;
  uint256 public burnRate;
  address internal immutable burnAddress =
    0x00000000219ab540356cBB839Cbe05303d7705Fa; //ETH2.0 Staking Contract

  /* ========== EVENTS ========== */

  event IncentiveCreated(
    bytes32 contractName,
    uint256 reward,
    bool openToEveryone
  );
  event IncentiveChanged(
    bytes32 contractName,
    uint256 oldReward,
    uint256 newReward,
    bool oldOpenToEveryone,
    bool newOpenToEveryone
  );
  event IncentiveFunded(uint256 amount);
  event ApprovalToggled(bytes32 contractName, bool openToEveryone);
  event IncentiveToggled(bytes32 contractName, bool enabled);
  event ControllerContractAdded(bytes32 contractName, address contractAddress);
  event Burned(uint256 amount);
  event BurnRateChanged(uint256 oldRate, uint256 newRate);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) public {
    contractRegistry = _contractRegistry;
    burnRate = 25e16;
  }

  /* ==========  MUTATIVE FUNCTIONS  ========== */

  function handleKeeperIncentive(
    bytes32 contractName_,
    uint8 i,
    address keeper
  ) external {
    require(
      msg.sender == controllerContracts[contractName_],
      "Can only be called by the controlling contract"
    );

    Incentive memory incentive = incentives[contractName_][i];

    if (!incentive.openToEveryone) {
      IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
        .requireRole(keccak256("Keeper"), keeper);
    }
    if (incentive.enabled && incentive.reward <= incentiveBudget) {
      incentiveBudget = incentiveBudget.sub(incentive.reward);
      uint256 amountToBurn = incentive.reward.mul(burnRate).div(1e18);
      uint256 incentivePayout = incentive.reward.sub(amountToBurn);
      IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransfer(
        keeper,
        incentivePayout
      );
      _burn(amountToBurn);
    }
  }

  /* ========== SETTER ========== */

  /**
   * @notice Create Incentives for keeper to call a function
   * @param contractName_ Name of contract that uses ParticipationRewards in bytes32
   * @param _reward The amount in POP the Keeper receives for calling the function
   * @param _enabled Is this Incentive currently enabled?
   * @param _openToEveryone Can anyone call the function for rewards or only keeper?
   * @dev This function is only for creating unique incentives for future contracts
   * @dev Multiple functions can use the same incentive which can than be updated with one governance vote
   */
  function createIncentive(
    bytes32 contractName_,
    uint256 _reward,
    bool _enabled,
    bool _openToEveryone
  ) public {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    incentives[contractName_].push(
      Incentive({
        reward: _reward,
        enabled: _enabled,
        openToEveryone: _openToEveryone
      })
    );
    emit IncentiveCreated(contractName_, _reward, _openToEveryone);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function updateIncentive(
    bytes32 contractName_,
    uint8 i,
    uint256 _reward,
    bool _enabled,
    bool _openToEveryone
  ) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    Incentive storage incentive = incentives[contractName_][i];
    uint256 oldReward = incentive.reward;
    bool oldOpenToEveryone = incentive.openToEveryone;
    incentive.reward = _reward;
    incentive.enabled = _enabled;
    incentive.openToEveryone = _openToEveryone;
    emit IncentiveChanged(
      contractName_,
      oldReward,
      _reward,
      oldOpenToEveryone,
      _openToEveryone
    );
  }

  function toggleApproval(bytes32 contractName_, uint8 i) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    Incentive storage incentive = incentives[contractName_][i];
    incentive.openToEveryone = !incentive.openToEveryone;
    emit ApprovalToggled(contractName_, incentive.openToEveryone);
  }

  function toggleIncentive(bytes32 contractName_, uint8 i) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    Incentive storage incentive = incentives[contractName_][i];
    incentive.enabled = !incentive.enabled;
    emit IncentiveToggled(contractName_, incentive.enabled);
  }

  function fundIncentive(uint256 _amount) external {
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransferFrom(
      msg.sender,
      address(this),
      _amount
    );
    incentiveBudget = incentiveBudget.add(_amount);
    emit IncentiveFunded(_amount);
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
    emit ControllerContractAdded(contractName_, contract_);
  }

  /**
   * @notice Sets the current burn rate as a percentage of the incentive reward.
   * @param _burnRate Percentage in Mantissa. (1e14 = 1 Basis Point)
   */
  function updateBurnRate(uint256 _burnRate) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")))
      .requireRole(keccak256("DAO"), msg.sender);
    emit BurnRateChanged(burnRate, _burnRate);
    burnRate = _burnRate;
  }

  function _burn(uint256 _amount) internal {
    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(
      burnAddress,
      _amount
    );
    emit Burned(_amount);
  }
}
