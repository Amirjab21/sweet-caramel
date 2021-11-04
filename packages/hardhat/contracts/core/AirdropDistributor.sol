// SPDX-License-Identifier: GPL-3.0
// author: Popcorn (https://popcorn.network)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

import "./interfaces/IACLRegistry.sol";
import "./interfaces/IContractRegistry.sol";

/**
 * @title Popcorn AirdropDistributor
 * @notice This contract enables the distribution of ERC20 tokens to approved
 *  addresses included in a Merkle tree representing valid claims by address.
 *
 *  Authorized callers may create a new token distribution by calling the
 *  `addAirdrop` function with an ERC20 token address and the root hash of a
 *  Merkle tree representing valid claims. You must transfer a sufficient
 *  balance of the distributed token to this contract before creating a new
 *  distribution, or claims may fail.
 *
 *  Addresses included in the Merkle tree may call `claim` to receive their
 *  token allocation.
 *
 * @dev This contract is adapted from Uniswap's MerkleDistributor contract
 *  (https://github.com/Uniswap/merkle-distributor/) to support multiple airdrop
 *  distributions.
 */
contract AirdropDistributor {
  /**
   * @notice Configuration parameters for a single token distribution.
   * @param token Address of the ERC20 token to be distributed.
   * @param merkleRoot Root hash of the Merkle tree for this distribution.
   * @param claims Bitmap representing claims for this distribution.
   */
  struct Airdrop {
    address token;
    bytes32 merkleRoot;
    mapping(uint256 => uint256) claims;
  }

  /**
   * @notice Mapping of airdrops by incrementing integer ID.
   */
  mapping(uint256 => Airdrop) public airdrops;

  IContractRegistry public contractRegistry;
  IACLRegistry public immutable aclRegistry;

  uint256 private id;

  /**
   * @notice Emitted when a caller claims a token allocation.
   * @param airdropID ID of the token distribution.
   * @param index Index of the claim in the Merkle tree.
   * @param account Address of the account associated with this claim.
   * @param amount Amount of tokens claimed.
   */
  event Claim(
    uint256 airdropId,
    uint256 index,
    address account,
    uint256 amount
  );

  /**
   * @param _contractRegistry Address of the Popcorn contract registry.
   */
  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
    aclRegistry = IACLRegistry(
      contractRegistry.getContract(keccak256("ACLRegistry"))
    );
  }

  /**
   * @notice Claim a token allocation included in a given distribution.
   * @param airdropID ID of the token distribution.
   * @param index Index of the claim in the Merkle tree.
   * @param account Address of the account associated with this claim.
   * @param amount Amount of tokens claimed.
   * @dev Claimed tokens will be sent to the address included in the Merkle tree,
   *  not `msg.sender`. Callers may claim on behalf of another address, but must
   *  provide a valid Merkle proof.
   */
  function claim(
    uint256 airdropId,
    uint256 index,
    address account,
    uint256 amount,
    bytes32[] calldata merkleProof
  ) external {
    require(!isClaimed(airdropId, index), "Already claimed.");

    bytes32 node = keccak256(abi.encodePacked(index, account, amount));
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

  /**
   * @notice Create a new token distribution. Caller must have the "DAO" role in
   *  the Popcorn ACL Registry.
   * @param token Address of the ERC20 token to be distributed.
   * @param merkleRoot Root hash of the Merkle tree for this distribution.
   */
  function addAirdrop(address token, bytes32 merkleRoot) external {
    aclRegistry.requireRole(keccak256("DAO"), msg.sender);
    id++;
    airdrops[id].token = token;
    airdrops[id].merkleRoot = merkleRoot;
  }

  /**
   * @notice Check whether a token allocation has been claimed.
   * @param airdropId ID of the distribution
   * @param index Index of the claim in the Merkle tree.
   */
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

  function _setClaimed(uint256 airdropId, uint256 index) private {
    uint256 claimedWordIndex = index / 256;
    uint256 claimedBitIndex = index % 256;
    airdrops[airdropId].claims[claimedWordIndex] =
      airdrops[airdropId].claims[claimedWordIndex] |
      (1 << claimedBitIndex);
  }
}
