# HysiBatchInteraction
***
## Functions:
- [`constructor()`](#constructor)
- [`getAccountBatches()`](#getaccountbatches)
- [`depositForMint()`](#depositformint)
- [`depositForRedeem()`](#depositforredeem)
- [`withdrawFromBatch()`](#withdrawfrombatch)
- [`claim()`](#claim)
- [`moveUnclaimedDepositsIntoCurrentBatch()`](#moveunclaimeddepositsintocurrentbatch)
- [`batchMint()`](#batchmint)
- [`batchRedeem()`](#batchredeem)
- [`setCurvePoolTokenPairs()`](#setcurvepooltokenpairs)
- [`setBatchCooldown()`](#setbatchcooldown)
- [`setMintThreshold()`](#setmintthreshold)
- [`setRedeemThreshold()`](#setredeemthreshold)
## Events:
- [`Deposit`](#deposit)
- [`Withdrawal`](#withdrawal)
- [`BatchMinted`](#batchminted)
- [`BatchRedeemed`](#batchredeemed)
- [`Claimed`](#claimed)
- [`TokenSetAdded`](#tokensetadded)
- [`WithdrawnFromBatch`](#withdrawnfrombatch)
- [`MovedUnclaimedDepositsIntoCurrentBatch`](#movedunclaimeddepositsintocurrentbatch)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry contractRegistry_, contract ISetToken setToken_, contract IERC20 threeCrv_, contract BasicIssuanceModule basicIssuanceModule_, address[] yTokenAddresses_, struct HysiBatchInteraction.CurvePoolTokenPair[] curvePoolTokenPairs_, uint256 batchCooldown_, uint256 mintThreshold_, uint256 redeemThreshold_) public 
```
###  getAccountBatches()
```
getAccountBatches(address account) external  returns (bytes32[])
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `account`| address| The address for whom we want to retrieve batches|

###  depositForMint()
```
depositForMint(uint256 amount_, address depositFor_) external 
```
Should this be secured we nonReentrant?

| Parameter Name | Type | Description |
|------------|-----| -------|
| `amount_`| uint256| Amount of 3cr3CRV to use for minting|
| `depositFor_`| address| User that gets the shares attributed to (for use in zapper contract)|

###  depositForRedeem()
```
depositForRedeem(uint256 amount_) external 
```
Should this be secured we nonReentrant?

| Parameter Name | Type | Description |
|------------|-----| -------|
| `amount_`| uint256| amount of HYSI to be redeemed|

###  withdrawFromBatch()
```
withdrawFromBatch(bytes32 batchId_, uint256 amountToWithdraw_, address withdrawFor_) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `batchId_`| bytes32| From which batch should funds be withdrawn from|
| `amountToWithdraw_`| uint256| Amount of HYSI or 3CRV to be withdrawn from the queue (depending on mintBatch / redeemBatch)|
| `withdrawFor_`| address| User that gets the shares attributed to (for use in zapper contract)|

###  claim()
```
claim(bytes32 batchId_, address claimFor_) external  returns (uint256)
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `batchId_`| bytes32| Id of batch to claim from|
| `claimFor_`| address| User that gets the shares attributed to (for use in zapper contract)|

###  moveUnclaimedDepositsIntoCurrentBatch()
```
moveUnclaimedDepositsIntoCurrentBatch(bytes32[] batchIds, uint256[] shares, enum HysiBatchInteraction.BatchType batchType) external 
```
the indices of batchIds must match the amountsInHysi to work properly (This will be done by the frontend)

| Parameter Name | Type | Description |
|------------|-----| -------|
| `batchIds`| bytes32[]| the ids of each batch where hysi should be moved from|
| `shares`| uint256[]| how many shares should redeemed in each of the batches|
| `batchType`| enum HysiBatchInteraction.BatchType| the batchType where funds should be taken from (Mint -> Take Hysi and redeem then, Redeem -> Take 3Crv and Mint HYSI)|

###  batchMint()
```
batchMint(uint256 minAmountToMint_) external 
```
This function deposits 3CRV in the underlying Metapool and deposits these LP token to get yToken which in turn are used to mint HYSI
This process leaves some leftovers which are partially used in the next mint batches.
In order to get 3CRV we can implement a zap to move stables into the curve tri-pool
handleKeeperIncentive checks if the msg.sender is a permissioned keeper and pays them a reward for calling this function (see KeeperIncentive.sol)

| Parameter Name | Type | Description |
|------------|-----| -------|
| `minAmountToMint_`| uint256| The expected min amount of hysi to mint. If hysiAmount is lower than minAmountToMint_ the transaction will revert.|

###  batchRedeem()
```
batchRedeem(uint256 min3crvToReceive_) external 
```
This function reedeems HYSI for the underlying yToken and deposits these yToken in curve Metapools for 3CRV
In order to get stablecoins from 3CRV we can use a zap to redeem 3CRV for stables in the curve tri-pool
handleKeeperIncentive checks if the msg.sender is a permissioned keeper and pays them a reward for calling this function (see KeeperIncentive.sol)

| Parameter Name | Type | Description |
|------------|-----| -------|
| `min3crvToReceive_`| uint256| sets minimum amount of 3crv to redeem HYSI for, otherwise the transaction will revert|

###  setCurvePoolTokenPairs()
```
setCurvePoolTokenPairs(address[] yTokenAddresses_, struct HysiBatchInteraction.CurvePoolTokenPair[] curvePoolTokenPairs_) public 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `yTokenAddresses_`| address[]| An array of addresses for the yToken needed to mint HYSI|
| `curvePoolTokenPairs_`| struct HysiBatchInteraction.CurvePoolTokenPair[]| An array structs describing underlying yToken, crvToken and curve metapool|

###  setBatchCooldown()
```
setBatchCooldown(uint256 cooldown_) external 
```
The cooldown is the same for redeem and mint batches

| Parameter Name | Type | Description |
|------------|-----| -------|
| `cooldown_`| uint256| Cooldown in seconds|

###  setMintThreshold()
```
setMintThreshold(uint256 threshold_) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `threshold_`| uint256| Amount of 3CRV necessary to mint immediately|

###  setRedeemThreshold()
```
setRedeemThreshold(uint256 threshold_) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `threshold_`| uint256| Amount of HYSI necessary to mint immediately|

## Events
### Deposit
```
Deposit(address from, uint256 deposit)
```
### Withdrawal
```
Withdrawal(address to, uint256 amount)
```
### BatchMinted
```
BatchMinted(bytes32 batchId, uint256 suppliedTokenAmount, uint256 hysiAmount)
```
### BatchRedeemed
```
BatchRedeemed(bytes32 batchId, uint256 suppliedTokenAmount, uint256 threeCrvAmount)
```
### Claimed
```
Claimed(address account, enum HysiBatchInteraction.BatchType batchType, uint256 shares, uint256 claimedToken)
```
### TokenSetAdded
```
TokenSetAdded(contract ISetToken setToken)
```
### WithdrawnFromBatch
```
WithdrawnFromBatch(bytes32 batchId, uint256 amount, address to)
```
### MovedUnclaimedDepositsIntoCurrentBatch
```
MovedUnclaimedDepositsIntoCurrentBatch(uint256 amount, enum HysiBatchInteraction.BatchType batchType, address account)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/HysiBatchInteraction_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/HysiBatchInteraction_inheritance_graph.png)
