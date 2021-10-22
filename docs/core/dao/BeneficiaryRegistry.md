# BeneficiaryRegistry
***
## Functions:
- [`constructor()`](#constructor)
- [`beneficiaryExists()`](#beneficiaryexists)
- [`getBeneficiary()`](#getbeneficiary)
- [`getBeneficiaryList()`](#getbeneficiarylist)
- [`addBeneficiary()`](#addbeneficiary)
- [`revokeBeneficiary()`](#revokebeneficiary)
## Events:
- [`BeneficiaryAdded`](#beneficiaryadded)
- [`BeneficiaryRevoked`](#beneficiaryrevoked)
## Modifiers:
- [`validAddress()`](#validaddress)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry _contractRegistry) public 
```
###  beneficiaryExists()
```
beneficiaryExists(address _address) public  returns (bool)
```
###  getBeneficiary()
```
getBeneficiary(address _address) public  returns (bytes)
```
###  getBeneficiaryList()
```
getBeneficiaryList() public  returns (address[])
```
###  addBeneficiary()
```
addBeneficiary(address account, bytes32 region, bytes applicationCid) external 
```
###  revokeBeneficiary()
```
revokeBeneficiary(address _address) external 
```
## Events
### BeneficiaryAdded
```
BeneficiaryAdded(address _address, bytes _applicationCid)
```
### BeneficiaryRevoked
```
BeneficiaryRevoked(address _address)
```
## Modifiers
### `validAddress()`
```
validAddress(address _address)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/BeneficiaryRegistry_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/BeneficiaryRegistry_inheritance_graph.png)
