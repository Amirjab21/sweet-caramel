// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

import "./interfaces/IACLRegistry.sol";
import "./interfaces/IContractRegistry.sol";

contract AirdropDistributor {
  struct Airdrop {
    address token;
    bytes32 merkleRoot;
    mapping(uint256 => uint256) claims;
  }

  mapping(uint256 => Airdrop) public airdrops;

  IContractRegistry public contractRegistry;
  IACLRegistry public immutable aclRegistry;

  uint256 private id;

  event Claim(
    uint256 airdropId,
    uint256 index,
    address account,
    uint256 amount
  );

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
    aclRegistry = IACLRegistry(
      contractRegistry.getContract(keccak256("ACLRegistry"))
    );
  }

  function claim(
    uint256 airdropId,
    uint256 index,
    address account,
    uint256 amount,
    bytes32[] calldata merkleProof
  ) external {
    bytes32 node = keccak256(abi.encodePacked(index, account, amount));
    require(!isClaimed(airdropId, index), "Already claimed.");
    require(
      MerkleProof.verify(merkleProof, airdrops[airdropId].merkleRoot, node),
      "Invalid proof."
    );
    _setClaimed(airdropId, index);
    require(
      IERC20(airdrops[airdropId].token).transfer(account, amount),
      "Transfer failed."
    );
    emit Claim(airdropId, index, account, amount);
  }

  function isClaimed(uint256 airdropId, uint256 index)
    public
    view
    returns (bool)
  {
    uint256 claimedWordIndex = index / 256;
    uint256 claimedBitIndex = index % 256;
    uint256 claimedWord = airdrops[airdropId].claims[claimedWordIndex];
    uint256 mask = (1 << claimedBitIndex);
    return claimedWord & mask == mask;
  }

  function addAirdrop(address token, bytes32 merkleRoot) external {
    aclRegistry.requireRole(keccak256("DAO"), msg.sender);
    id++;
    airdrops[id].token = token;
    airdrops[id].merkleRoot = merkleRoot;
  }

  function _setClaimed(uint256 airdropId, uint256 index) private {
    uint256 claimedWordIndex = index / 256;
    uint256 claimedBitIndex = index % 256;
    airdrops[airdropId].claims[claimedWordIndex] =
      airdrops[airdropId].claims[claimedWordIndex] |
      (1 << claimedBitIndex);
  }
}
