# AffiliateToken
***
## Functions:
- [`constructor()`](#constructor)
- [`setAffiliate()`](#setaffiliate)
- [`acceptAffiliate()`](#acceptaffiliate)
- [`pricePerShare()`](#pricepershare)
- [`deposit()`](#deposit)
- [`withdraw()`](#withdraw)
- [`migrate()`](#migrate)
- [`migrate()`](#migrate)
- [`migrate()`](#migrate)
- [`permit()`](#permit)
## Modifiers:
- [`onlyAffiliate()`](#onlyaffiliate)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(address _token, address _registry, string name, string symbol) public 
```
###  setAffiliate()
```
setAffiliate(address _affiliate) external 
```
###  acceptAffiliate()
```
acceptAffiliate() external 
```
###  pricePerShare()
```
pricePerShare() external  returns (uint256)
```
###  deposit()
```
deposit(uint256 amount) public  returns (uint256 deposited)
```
###  withdraw()
```
withdraw(uint256 shares) public  returns (uint256 withdrawn)
```
###  migrate()
```
migrate() external  returns (uint256)
```
###  migrate()
```
migrate(uint256 amount) external  returns (uint256)
```
###  migrate()
```
migrate(uint256 amount, uint256 maxMigrationLoss) external  returns (uint256)
```
###  permit()
```
permit(address owner, address spender, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `owner`| address| The address to approve from|
| `spender`| address| The address to be approved|
| `amount`| uint256| The number of tokens that are approved (2^256-1 means infinite)|
| `deadline`| uint256| The time at which to expire the signature|
| `v`| uint8| The recovery byte of the signature|
| `r`| bytes32| Half of the ECDSA signature pair|
| `s`| bytes32| Half of the ECDSA signature pair|

## Events
## Modifiers
### `onlyAffiliate()`
```
onlyAffiliate()
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/AffiliateToken_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/AffiliateToken_inheritance_graph.png)
