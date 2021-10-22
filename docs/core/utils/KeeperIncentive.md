# KeeperIncentive
***
## Functions:
- [`constructor()`](#constructor)
- [`handleKeeperIncentive()`](#handlekeeperincentive)
- [`createIncentive()`](#createincentive)
- [`updateIncentive()`](#updateincentive)
- [`toggleApproval()`](#toggleapproval)
- [`toggleIncentive()`](#toggleincentive)
- [`fundIncentive()`](#fundincentive)
- [`addControllerContract()`](#addcontrollercontract)
- [`updateBurnRate()`](#updateburnrate)
- [`updateRequiredKeeperStake()`](#updaterequiredkeeperstake)
## Events:
- [`IncentiveCreated`](#incentivecreated)
- [`IncentiveChanged`](#incentivechanged)
- [`IncentiveFunded`](#incentivefunded)
- [`ApprovalToggled`](#approvaltoggled)
- [`IncentiveToggled`](#incentivetoggled)
- [`ControllerContractAdded`](#controllercontractadded)
- [`Burned`](#burned)
- [`BurnRateChanged`](#burnratechanged)
- [`RequiredKeeperStakeChanged`](#requiredkeeperstakechanged)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry _contractRegistry, uint256 _burnRate, uint256 _requiredKeeperStake) public 
```
###  handleKeeperIncentive()
```
handleKeeperIncentive(bytes32 contractName_, uint8 i, address keeper) external 
```
###  createIncentive()
```
createIncentive(bytes32 contractName_, uint256 _reward, bool _enabled, bool _openToEveryone) public 
```
This function is only for creating unique incentives for future contracts
Multiple functions can use the same incentive which can than be updated with one governance vote

| Parameter Name | Type | Description |
|------------|-----| -------|
| `contractName_`| bytes32| Name of contract that uses ParticipationRewards in bytes32|
| `_reward`| uint256| The amount in POP the Keeper receives for calling the function|
| `_enabled`| bool| Is this Incentive currently enabled?|
| `_openToEveryone`| bool| Can anyone call the function for rewards or only keeper?|

###  updateIncentive()
```
updateIncentive(bytes32 contractName_, uint8 i, uint256 _reward, bool _enabled, bool _openToEveryone) external 
```
###  toggleApproval()
```
toggleApproval(bytes32 contractName_, uint8 i) external 
```
###  toggleIncentive()
```
toggleIncentive(bytes32 contractName_, uint8 i) external 
```
###  fundIncentive()
```
fundIncentive(uint256 _amount) external 
```
###  addControllerContract()
```
addControllerContract(bytes32 contractName_, address contract_) external 
```
all critical functions to init/open vaults and add shares to them can only be called by controller contracts

| Parameter Name | Type | Description |
|------------|-----| -------|
| `contractName_`| bytes32| the name of the controller contract in bytes32|
| `contract_`| address| the address of the controller contract|

###  updateBurnRate()
```
updateBurnRate(uint256 _burnRate) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `_burnRate`| uint256| Percentage in Mantissa. (1e14 = 1 Basis Point)|

###  updateRequiredKeeperStake()
```
updateRequiredKeeperStake(uint256 _amount) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `_amount`| uint256| Amount of POP a keeper needs to stake|

## Events
### IncentiveCreated
```
IncentiveCreated(bytes32 contractName, uint256 reward, bool openToEveryone)
```
### IncentiveChanged
```
IncentiveChanged(bytes32 contractName, uint256 oldReward, uint256 newReward, bool oldOpenToEveryone, bool newOpenToEveryone)
```
### IncentiveFunded
```
IncentiveFunded(uint256 amount)
```
### ApprovalToggled
```
ApprovalToggled(bytes32 contractName, bool openToEveryone)
```
### IncentiveToggled
```
IncentiveToggled(bytes32 contractName, bool enabled)
```
### ControllerContractAdded
```
ControllerContractAdded(bytes32 contractName, address contractAddress)
```
### Burned
```
Burned(uint256 amount)
```
### BurnRateChanged
```
BurnRateChanged(uint256 oldRate, uint256 newRate)
```
### RequiredKeeperStakeChanged
```
RequiredKeeperStakeChanged(uint256 oldRequirement, uint256 newRequirement)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/KeeperIncentive_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/KeeperIncentive_inheritance_graph.png)
