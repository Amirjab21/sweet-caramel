# HysiBatchZapper
***
## Functions:
- [`constructor()`](#constructor)
- [`zapIntoBatch()`](#zapintobatch)
- [`zapOutOfBatch()`](#zapoutofbatch)
- [`claimAndSwapToStable()`](#claimandswaptostable)
## Events:
- [`ZappedIntoBatch`](#zappedintobatch)
- [`ZappedOutOfBatch`](#zappedoutofbatch)
- [`ClaimedIntoStable`](#claimedintostable)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry contractRegistry_, contract Curve3Pool curve3Pool_, contract IERC20 threeCrv_) public 
```
###  zapIntoBatch()
```
zapIntoBatch(uint256[3] amounts_, uint256 min_mint_amounts_) external 
```
The amounts in amounts_ must align with their index in the curve three-pool

| Parameter Name | Type | Description |
|------------|-----| -------|
| `amounts_`| uint256[3]| An array of amounts in stablecoins the user wants to deposit|
| `min_mint_amounts_`| uint256| The min amount of 3CRV which should be minted by the curve three-pool (slippage control)|

###  zapOutOfBatch()
```
zapOutOfBatch(bytes32 batchId_, uint256 amountToWithdraw_, uint8 stableCoinIndex_, uint256 min_amount_) external 
```
The stableCoinIndex_ must align with the index in the curve three-pool

| Parameter Name | Type | Description |
|------------|-----| -------|
| `batchId_`| bytes32| Defines which batch gets withdrawn from|
| `amountToWithdraw_`| uint256| 3CRV amount that shall be withdrawn|
| `stableCoinIndex_`| uint8| Defines which stablecoin the user wants to receive|
| `min_amount_`| uint256| The min amount of stables which should be returned by the curve three-pool (slippage control)|

###  claimAndSwapToStable()
```
claimAndSwapToStable(bytes32 batchId_, uint8 stableCoinIndex_, uint256 min_amount_) external 
```
The stableCoinIndex_ must align with the index in the curve three-pool

| Parameter Name | Type | Description |
|------------|-----| -------|
| `batchId_`| bytes32| Defines which batch gets withdrawn from|
| `stableCoinIndex_`| uint8| Defines which stablecoin the user wants to receive|
| `min_amount_`| uint256| The min amount of stables which should be returned by the curve three-pool (slippage control)|

## Events
### ZappedIntoBatch
```
ZappedIntoBatch(uint256 threeCurveAmount, address account)
```
### ZappedOutOfBatch
```
ZappedOutOfBatch(bytes32 batchId, uint8 stableCoinIndex, uint256 threeCurveAmount, uint256 stableCoinAmount, address account)
```
### ClaimedIntoStable
```
ClaimedIntoStable(bytes32 batchId, uint8 stableCoinIndex, uint256 threeCurveAmount, uint256 stableCoinAmount, address account)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/HysiBatchZapper_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/HysiBatchZapper_inheritance_graph.png)
