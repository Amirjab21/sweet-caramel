pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "../core/utils/KeeperIncentive.sol";

contract KeeperIncentiveHelper {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  KeeperIncentive public keeperIncentive;
  bytes32 public immutable contractName = "KeeperIncentiveHelper";

  event FunctionCalled(address account);

  constructor(KeeperIncentive keeperIncentive_) public {
    keeperIncentive = keeperIncentive_;
  }

  function incentivisedFunction() public {
    keeperIncentive.handleKeeperIncentive(contractName, 0, msg.sender);
    emit FunctionCalled(msg.sender);
  }
}
