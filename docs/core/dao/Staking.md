# Staking
***
## Functions:
- [`constructor()`](#constructor)
- [`getVoiceCredits()`](#getvoicecredits)
- [`getWithdrawableBalance()`](#getwithdrawablebalance)
- [`balanceOf()`](#balanceof)
- [`lastTimeRewardApplicable()`](#lasttimerewardapplicable)
- [`rewardPerToken()`](#rewardpertoken)
- [`earned()`](#earned)
- [`getRewardForDuration()`](#getrewardforduration)
- [`stake()`](#stake)
- [`increaseLock()`](#increaselock)
- [`increaseStake()`](#increasestake)
- [`withdraw()`](#withdraw)
- [`getReward()`](#getreward)
- [`exit()`](#exit)
- [`recalculateVoiceCredits()`](#recalculatevoicecredits)
- [`notifyRewardAmount()`](#notifyrewardamount)
- [`updatePeriodFinish()`](#updateperiodfinish)
## Events:
- [`StakingDeposited`](#stakingdeposited)
- [`StakingWithdrawn`](#stakingwithdrawn)
- [`RewardPaid`](#rewardpaid)
- [`RewardAdded`](#rewardadded)
## Modifiers:
- [`updateReward()`](#updatereward)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry _contractRegistry) public 
```
###  getVoiceCredits()
```
getVoiceCredits(address _address) public  returns (uint256)
```
todo - check if multiplier is needed for calculating square root of smaller balances

| Parameter Name | Type | Description |
|------------|-----| -------|
| `_address`| address| address to get voice credits for|

###  getWithdrawableBalance()
```
getWithdrawableBalance(address _address) public  returns (uint256)
```
###  balanceOf()
```
balanceOf(address _address) external  returns (uint256)
```
###  lastTimeRewardApplicable()
```
lastTimeRewardApplicable() public  returns (uint256)
```
###  rewardPerToken()
```
rewardPerToken() public  returns (uint256)
```
###  earned()
```
earned(address account) public  returns (uint256)
```
###  getRewardForDuration()
```
getRewardForDuration() external  returns (uint256)
```
###  stake()
```
stake(uint256 amount, uint256 lengthOfTime) external 
```
###  increaseLock()
```
increaseLock(uint256 lengthOfTime) external 
```
###  increaseStake()
```
increaseStake(uint256 amount) external 
```
###  withdraw()
```
withdraw(uint256 amount) public 
```
###  getReward()
```
getReward() public 
```
###  exit()
```
exit() external 
```
###  recalculateVoiceCredits()
```
recalculateVoiceCredits(address _address) public 
```
###  notifyRewardAmount()
```
notifyRewardAmount(uint256 reward) external 
```
###  updatePeriodFinish()
```
updatePeriodFinish(uint256 timestamp) external 
```
## Events
### StakingDeposited
```
StakingDeposited(address _address, uint256 amount)
```
### StakingWithdrawn
```
StakingWithdrawn(address _address, uint256 amount)
```
### RewardPaid
```
RewardPaid(address _address, uint256 reward)
```
### RewardAdded
```
RewardAdded(uint256 reward)
```
## Modifiers
### `updateReward()`
```
updateReward(address account)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/Staking_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/Staking_inheritance_graph.png)
