# RewardsManager
Manages distribution of POP rewards to Popcorn Treasury, DAO Staking, and Beneficiaries
***
## Functions:
- [`constructor()`](#constructor)
- [`getRewardSplits()`](#getrewardsplits)
- [`receive()`](#receive)
- [`swapTokenForRewards()`](#swaptokenforrewards)
- [`distributeRewards()`](#distributerewards)
- [`setRewardSplits()`](#setrewardsplits)
## Events:
- [`StakingDeposited`](#stakingdeposited)
- [`TreasuryDeposited`](#treasurydeposited)
- [`InsuranceDeposited`](#insurancedeposited)
- [`BeneficiaryVaultsDeposited`](#beneficiaryvaultsdeposited)
- [`RewardsDistributed`](#rewardsdistributed)
- [`RewardSplitsUpdated`](#rewardsplitsupdated)
- [`TokenSwapped`](#tokenswapped)
- [`RegionChanged`](#regionchanged)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry contractRegistry_, contract IUniswapV2Router02 uniswapV2Router_) public 
```
###  getRewardSplits()
```
getRewardSplits() external  returns (uint256[4])
```
###  receive()
```
receive() external 
```
###  swapTokenForRewards()
```
swapTokenForRewards(address[] path_, uint256 minAmountOut_) public  returns (uint256[])
```
Path specification requires at least source token as first in path and POP address as last
Token swap internals implemented as described at https://uniswap.org/docs/v2/smart-contracts/router02/#swapexacttokensfortokens

| Parameter Name | Type | Description |
|------------|-----| -------|
| `path_`| address[]| Uniswap path specification for source token to POP|
| `minAmountOut_`| uint256| Minimum desired amount (>0) of POP tokens to be received from swap|

#### Return Values:

| Return Name | Type | Description |
|-------------|-------|------------|
|swapped| address[]|in/out amounts uint256 tuple|

###  distributeRewards()
```
distributeRewards() public 
```
Contract must have POP balance in order to distribute according to rewardSplits ratio
###  setRewardSplits()
```
setRewardSplits(uint256[4] splits_) public 
```
Values must be within rewardsLimit range, specified in percent to 18 decimal place precision

| Parameter Name | Type | Description |
|------------|-----| -------|
| `splits_`| uint256[4]| Array of RewardTargets enumerated uint256 values within rewardLimits range|

## Events
### StakingDeposited
```
StakingDeposited(address to, uint256 amount)
```
### TreasuryDeposited
```
TreasuryDeposited(address to, uint256 amount)
```
### InsuranceDeposited
```
InsuranceDeposited(address to, uint256 amount)
```
### BeneficiaryVaultsDeposited
```
BeneficiaryVaultsDeposited(uint256 amount)
```
### RewardsDistributed
```
RewardsDistributed(uint256 amount)
```
### RewardSplitsUpdated
```
RewardSplitsUpdated(uint256[4] splits)
```
### TokenSwapped
```
TokenSwapped(address token, uint256 amountIn, uint256 amountOut)
```
### RegionChanged
```
RegionChanged(contract IRegion from, contract IRegion to)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/RewardsManager_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/RewardsManager_inheritance_graph.png)
