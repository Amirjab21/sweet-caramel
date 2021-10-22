# Zapper
***
## Functions:
- [`constructor()`](#constructor)
- [`token()`](#token)
- [`curveMetapoolAddress()`](#curvemetapooladdress)
- [`curveBasepoolAddress()`](#curvebasepooladdress)
- [`supportedTokens()`](#supportedtokens)
- [`canZap()`](#canzap)
- [`tokenIndex()`](#tokenindex)
- [`zapIn()`](#zapin)
- [`zapOut()`](#zapout)
## Events:
- [`ZapIn`](#zapin)
- [`ZapOut`](#zapout)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(address curveAddressProvider_) public 
```
###  token()
```
token(address popcornPool) public  returns (address)
```
###  curveMetapoolAddress()
```
curveMetapoolAddress(address popcornPool) public  returns (address)
```
###  curveBasepoolAddress()
```
curveBasepoolAddress(address popcornPool) public  returns (address)
```
###  supportedTokens()
```
supportedTokens(address popcornPool) public  returns (address[8])
```
###  canZap()
```
canZap(address popcornPool, address tokenAddress) public  returns (bool)
```
###  tokenIndex()
```
tokenIndex(address popcornPool, address tokenAddress) public  returns (uint8)
```
###  zapIn()
```
zapIn(address popcornPool, address depositToken, uint256 amount) public  returns (uint256)
```
###  zapOut()
```
zapOut(address popcornPool, address withdrawalToken, uint256 amount) public  returns (uint256)
```
## Events
### ZapIn
```
ZapIn(address account, address depositToken, uint256 depositAmount, uint256 shares)
```
### ZapOut
```
ZapOut(address account, address withdrawalShares, uint256 shares, uint256 withdrawalAmount)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/Zapper_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/Zapper_inheritance_graph.png)
