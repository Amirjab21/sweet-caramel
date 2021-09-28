pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./Governed.sol";

contract KeeperIncentive is Governed {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  struct Incentive {
    uint256 reward; //pop reward for calling the function
    bool enabled;
    bool openToEveryone; //can everyone call the function to get the reward or only approved?
  }

  /* ========== STATE VARIABLES ========== */

  IERC20 public immutable POP;
  uint256 public incentiveBudget;
  mapping(bytes32 => Incentive) public incentives;
  mapping(bytes32 => mapping(address => bool)) public approved;
  mapping(bytes32 => address) public controllerContracts;

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
  event Approved(bytes32 contractName, address account);
  event RemovedApproval(bytes32 contractName, address account);
  event ApprovalToggled(bytes32 contractName, bool openToEveryone);
  event IncentiveToggled(bytes32 contractName, bool enabled);
  event ControllerContractAdded(bytes32 contractName, address contractAddress);

  /* ========== CONSTRUCTOR ========== */

  constructor(IERC20 _pop, address _governance) public Governed(_governance) {
    POP = _pop;
  }

  /* ==========  MUTATIVE FUNCTIONS  ========== */

  function handleKeeperIncentive(bytes32 contractName_, address keeper)
    external
  {
    require(
      msg.sender == controllerContracts[contractName_],
      "Can only be called by the controlling contract"
    );

    Incentive memory incentive = incentives[contractName_];

    if (!incentive.openToEveryone) {
      require(
        approved[contractName_][keeper],
        "you are not approved as a keeper"
      );
    }
    if (incentive.enabled && incentive.reward <= incentiveBudget) {
      incentiveBudget = incentiveBudget.sub(incentive.reward);
      POP.safeTransfer(keeper, incentive.reward);
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
  ) public onlyGovernance {
    incentives[contractName_] = Incentive({
      reward: _reward,
      enabled: _enabled,
      openToEveryone: _openToEveryone
    });
    emit IncentiveCreated(contractName_, _reward, _openToEveryone);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function updateIncentive(
    bytes32 contractName_,
    uint256 _reward,
    bool _enabled,
    bool _openToEveryone
  ) external onlyGovernance {
    Incentive storage incentive = incentives[contractName_];
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

  function approveAccount(bytes32 contractName_, address _account)
    external
    onlyGovernance
  {
    approved[contractName_][_account] = true;
    emit Approved(contractName_, _account);
  }

  function removeApproval(bytes32 contractName_, address _account)
    external
    onlyGovernance
  {
    approved[contractName_][_account] = false;
    emit RemovedApproval(contractName_, _account);
  }

  function toggleApproval(bytes32 contractName_) external onlyGovernance {
    Incentive storage incentive = incentives[contractName_];
    incentive.openToEveryone = !incentive.openToEveryone;
    emit ApprovalToggled(contractName_, incentive.openToEveryone);
  }

  function toggleIncentive(bytes32 contractName_) external onlyGovernance {
    Incentive storage incentive = incentives[contractName_];
    incentive.enabled = !incentive.enabled;
    emit IncentiveToggled(contractName_, incentive.enabled);
  }

  function fundIncentive(uint256 _amount) external {
    POP.safeTransferFrom(msg.sender, address(this), _amount);
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
    onlyGovernance
  {
    controllerContracts[contractName_] = contract_;
    emit ControllerContractAdded(contractName_, contract_);
  }
}
