# ContractRegistry
***
This Contract holds reference to all our contracts. Every contract A that needs to interact with another contract B calls this contract
to ask for the address of B.
This allows us to update addresses in one central point and reduces constructing and management overhead.
## Functions:
- [`constructor()`](#constructor)
- [`getContractNames()`](#getcontractnames)
- [`getContract()`](#getcontract)
- [`addContract()`](#addcontract)
- [`updateContract()`](#updatecontract)
- [`deleteContract()`](#deletecontract)
## Events:
- [`ContractAdded`](#contractadded)
- [`ContractUpdated`](#contractupdated)
- [`ContractDeleted`](#contractdeleted)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IACLRegistry _aclRegistry) public 
```
###  getContractNames()
```
getContractNames() external  returns (bytes32[])
```
###  getContract()
```
getContract(bytes32 _name) external  returns (address)
```
###  addContract()
```
addContract(bytes32 _name, address _address, bytes32 _version) external 
```
###  updateContract()
```
updateContract(bytes32 _name, address _newAddress, bytes32 _version) external 
```
###  deleteContract()
```
deleteContract(bytes32 _name, uint256 _contractIndex) external 
```
## Events
### ContractAdded
```
ContractAdded(bytes32 _name, address _address, bytes32 _version)
```
### ContractUpdated
```
ContractUpdated(bytes32 _name, address _address, bytes32 _version)
```
### ContractDeleted
```
ContractDeleted(bytes32 _name)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/ContractRegistry_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/ContractRegistry_inheritance_graph.png)
