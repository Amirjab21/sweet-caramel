# BeneficiaryGovernance
This contract is for submitting beneficiary nomination proposals and beneficiary takedown proposals
***
## Functions:
- [`constructor()`](#constructor)
- [`getNumberOfProposals()`](#getnumberofproposals)
- [`getNumberOfVoters()`](#getnumberofvoters)
- [`getStatus()`](#getstatus)
- [`hasVoted()`](#hasvoted)
- [`createProposal()`](#createproposal)
- [`refreshState()`](#refreshstate)
- [`vote()`](#vote)
- [`finalize()`](#finalize)
- [`claimBond()`](#claimbond)
- [`setConfiguration()`](#setconfiguration)
## Events:
- [`ProposalCreated`](#proposalcreated)
- [`Vote`](#vote)
- [`Finalize`](#finalize)
- [`BondWithdrawn`](#bondwithdrawn)
## Modifiers:
- [`validAddress()`](#validaddress)
- [`enoughBond()`](#enoughbond)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  constructor()
```
constructor(contract IContractRegistry _contractRegistry) public 
```
###  getNumberOfProposals()
```
getNumberOfProposals(enum BeneficiaryGovernance.ProposalType _type) external  returns (uint256)
```
###  getNumberOfVoters()
```
getNumberOfVoters(uint256 proposalId) external  returns (uint256)
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal|

#### Return Values:

| Return Name | Type | Description |
|-------------|-------|------------|
|number| uint256|of votes to a proposal|

###  getStatus()
```
getStatus(uint256 proposalId) external  returns (enum BeneficiaryGovernance.ProposalStatus)
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal|

#### Return Values:

| Return Name | Type | Description |
|-------------|-------|------------|
|status| uint256|of proposal|

###  hasVoted()
```
hasVoted(uint256 proposalId, address voter) external  returns (bool)
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal|
| `voter`| address| address opf voter|

###  createProposal()
```
createProposal(address _beneficiary, bytes32 _region, bytes _applicationCid, enum BeneficiaryGovernance.ProposalType _type) external  returns (uint256)
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `_beneficiary`| address| address of the beneficiary|
| `_applicationCid`| bytes32| IPFS content hash|
| `_type`| bytes| the proposal type (nomination / takedown)|

###  refreshState()
```
refreshState(uint256 proposalId) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal|

###  vote()
```
vote(uint256 proposalId, enum BeneficiaryGovernance.VoteOption _vote) external 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal which you are going to vote|

###  finalize()
```
finalize(uint256 proposalId) public 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal|

###  claimBond()
```
claimBond(uint256 proposalId) public 
```

| Parameter Name | Type | Description |
|------------|-----| -------|
| `proposalId`| uint256| id of the proposal|

###  setConfiguration()
```
setConfiguration(uint256 _votingPeriod, uint256 _vetoPeriod, uint256 _proposalBond) public 
```
## Events
### ProposalCreated
```
ProposalCreated(uint256 proposalId, address proposer, address beneficiary, bytes applicationCid)
```
### Vote
```
Vote(uint256 proposalId, address voter, uint256 weight)
```
### Finalize
```
Finalize(uint256 proposalId)
```
### BondWithdrawn
```
BondWithdrawn(address _address, uint256 amount)
```
## Modifiers
### `validAddress()`
```
validAddress(address _address)
```
### `enoughBond()`
```
enoughBond(address _address)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/BeneficiaryGovernance_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/BeneficiaryGovernance_inheritance_graph.png)
