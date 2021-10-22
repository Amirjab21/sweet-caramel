# RewardsEscrow
***
## Functions:
- [`constructor()`](#constructor)
- [`isClaimable()`](#isclaimable)
- [`getEscrowsByUser()`](#getescrowsbyuser)
- [`lock()`](#lock)
- [`claimReward()`](#claimreward)
- [`claimRewards()`](#claimrewards)
- [`updateEscrowDuration()`](#updateescrowduration)
- [`updateCliff()`](#updatecliff)
## Events:
- [`Locked`](#locked)
- [`RewardsClaimed`](#rewardsclaimed)
- [`EscrowDurationChanged`](#escrowdurationchanged)
- [`VestingCliffChanged`](#vestingcliffchanged)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry contractRegistry_) public 
```
###  isClaimable()
```
isClaimable(bytes32 escrowId_) external  returns (bool)
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `escrowId_`| bytes32| Bytes32|

###  getEscrowsByUser()
```
getEscrowsByUser(address account) external  returns (bytes32[])
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `account`| address| address|

###  lock()
```
lock(address account_, uint256 amount_) external 
```
This creates a seperate escrow structure which can later be iterated upon to unlock the escrowed funds
###  claimReward()
```
claimReward(bytes32 escrowId_) external 
```
Uses the escrowId at the specified index of escrowIds.
This function is used when a user only wants to claim a specific escrowVault or if they decide the gas cost of claimRewards are to high for now.
(lower cost but also lower reward)
###  claimRewards()
```
claimRewards(bytes32[] escrowIds_) external 
```
Uses the vaultIds at the specified indices of escrowIds.
This function is used when a user only wants to claim multiple escrowVaults at once (probably most of the time)
The array of indices is limited to 20 as we want to prevent gas overflow of looping through too many vaults
TODO the upper bound of indices that can be used should be calculated with a simulation
###  updateEscrowDuration()
```
updateEscrowDuration(uint256 _escrowDuration) external 
```
###  updateCliff()
```
updateCliff(uint256 _vestingCliff) external 
```
## Events
### Locked
```
Locked(address account, uint256 amount)
```
### RewardsClaimed
```
RewardsClaimed(address account_, uint256 amount)
```
### EscrowDurationChanged
```
EscrowDurationChanged(uint256 _escrowDuration)
```
### VestingCliffChanged
```
VestingCliffChanged(uint256 _vestingCliff)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/RewardsEscrow_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/RewardsEscrow_inheritance_graph.png)
