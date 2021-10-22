# GrantElections
***
## Functions:
- [`constructor()`](#constructor)
- [`getElectionMetadata()`](#getelectionmetadata)
- [`electionEnabled()`](#electionenabled)
- [`getElectionMerkleRoot()`](#getelectionmerkleroot)
- [`getRegisteredBeneficiaries()`](#getregisteredbeneficiaries)
- [`_isEligibleBeneficiary()`](#_iseligiblebeneficiary)
- [`initialize()`](#initialize)
- [`registerForElection()`](#registerforelection)
- [`refreshElectionState()`](#refreshelectionstate)
- [`vote()`](#vote)
- [`fundKeeperIncentive()`](#fundkeeperincentive)
- [`getRandomNumber()`](#getrandomnumber)
- [`proposeFinalization()`](#proposefinalization)
- [`approveFinalization()`](#approvefinalization)
- [`toggleRegistrationBondRequirement()`](#toggleregistrationbondrequirement)
- [`setConfiguration()`](#setconfiguration)
## Events:
- [`BeneficiaryRegistered`](#beneficiaryregistered)
- [`UserVoted`](#uservoted)
- [`ElectionInitialized`](#electioninitialized)
- [`FinalizationProposed`](#finalizationproposed)
- [`ElectionFinalized`](#electionfinalized)
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
###  getElectionMetadata()
```
getElectionMetadata(uint256 _electionId) public  returns (struct GrantElections.Vote[] votes_, enum GrantElections.ElectionTerm term_, address[] registeredBeneficiaries_, enum GrantElections.ElectionState state_, uint8[2] awardeesRanking_, bool useChainLinkVRF_, uint256[3] periods_, uint256 startTime_, struct GrantElections.BondRequirements bondRequirements_, enum GrantElections.ShareType shareType_, uint256 randomNumber_)
```
###  electionEnabled()
```
electionEnabled(uint256 _electionId) public  returns (bool)
```
###  getElectionMerkleRoot()
```
getElectionMerkleRoot(uint256 _electionId) public  returns (bytes32 merkleRoot)
```
###  getRegisteredBeneficiaries()
```
getRegisteredBeneficiaries(uint256 _electionId) public  returns (address[] beneficiaries)
```
###  _isEligibleBeneficiary()
```
_isEligibleBeneficiary(address _beneficiary, uint256 _electionId) public  returns (bool)
```
###  initialize()
```
initialize(enum GrantElections.ElectionTerm _grantTerm, bytes32 _region) public 
```
###  registerForElection()
```
registerForElection(address _beneficiary, uint256 _electionId) public 
```
###  refreshElectionState()
```
refreshElectionState(uint256 _electionId) public 
```
###  vote()
```
vote(address[] _beneficiaries, uint256[] _voiceCredits, uint256 _electionId) public 
```
###  fundKeeperIncentive()
```
fundKeeperIncentive(uint256 _amount) public 
```
###  getRandomNumber()
```
getRandomNumber(uint256 _electionId) public 
```
###  proposeFinalization()
```
proposeFinalization(uint256 _electionId, bytes32 _merkleRoot) external 
```
###  approveFinalization()
```
approveFinalization(uint256 _electionId, bytes32 _merkleRoot) external 
```
###  toggleRegistrationBondRequirement()
```
toggleRegistrationBondRequirement(enum GrantElections.ElectionTerm _term) external 
```
###  setConfiguration()
```
setConfiguration(enum GrantElections.ElectionTerm _term, uint8 _ranking, uint8 _awardees, bool _useChainLinkVRF, uint256 _registrationPeriod, uint256 _votingPeriod, uint256 _cooldownPeriod, uint256 _bondAmount, bool _bondRequired, uint256 _finalizationIncentive, bool _enabled, enum GrantElections.ShareType _shareType) public 
```
## Events
### BeneficiaryRegistered
```
BeneficiaryRegistered(address _beneficiary, uint256 _electionId)
```
### UserVoted
```
UserVoted(address _user, enum GrantElections.ElectionTerm _term)
```
### ElectionInitialized
```
ElectionInitialized(enum GrantElections.ElectionTerm _term, bytes32 _region, uint256 _startTime)
```
### FinalizationProposed
```
FinalizationProposed(uint256 _electionId, bytes32 _merkleRoot)
```
### ElectionFinalized
```
ElectionFinalized(uint256 _electionId, bytes32 _merkleRoot)
```
## Modifiers
### `validAddress()`
```
validAddress(address _address)
```
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/GrantElections_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/GrantElections_inheritance_graph.png)
