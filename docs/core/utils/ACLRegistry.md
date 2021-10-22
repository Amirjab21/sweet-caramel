# ACLRegistry
***
Contract module that allows children to implement role-based access
control mechanisms. This is a lightweight version that doesn't allow enumerating role
members except through off-chain means by accessing the contract event logs. Some
applications may benefit from on-chain enumerability, for those cases see
{AccessControlEnumerable}.
Roles are referred to by their `bytes32` identifier. These should be exposed
in the external API and be unique. The best way to achieve this is by
using `public constant` hash digests:
```
bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
```
Roles can be used to represent a set of permissions. To restrict access to a
function call, use {hasRole}:
```
function foo() public {
    require(hasRole(MY_ROLE, msg.sender));
    ...
}
```
Roles can be granted and revoked dynamically via the {grantRole} and
{revokeRole} functions. Each role has an associated admin role, and only
accounts that have a role's admin role can call {grantRole} and {revokeRole}.
By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
that only accounts with this role will be able to grant or revoke other
roles. More complex role relationships can be created by using
{_setRoleAdmin}.
WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
grant and revoke this role. Extra precautions should be taken to secure
accounts that have been granted it.
## Functions:
- [`hasRole()`](#hasrole)
- [`hasPermission()`](#haspermission)
- [`getRoleAdmin()`](#getroleadmin)
- [`requireRole()`](#requirerole)
- [`requirePermission()`](#requirepermission)
- [`isRoleAdmin()`](#isroleadmin)
- [`requireApprovedContractOrEOA()`](#requireapprovedcontractoreoa)
- [`grantRole()`](#grantrole)
- [`revokeRole()`](#revokerole)
- [`renounceRole()`](#renouncerole)
- [`setRoleAdmin()`](#setroleadmin)
- [`grantPermission()`](#grantpermission)
- [`revokePermission()`](#revokepermission)
## Modifiers:
- [`onlyRole()`](#onlyrole)
## Graphs:
- [Dependency Graph](#dependency-graph)
- [Inheritance Graph](#inheritance-graph)
***
## Function Definitions:
###  hasRole()
```
hasRole(bytes32 role, address account) public  returns (bool)
```
Returns `true` if `account` has been granted `role`.
###  hasPermission()
```
hasPermission(bytes32 permission, address account) public  returns (bool)
```
Returns `true` if `account` has been granted `permission`.
###  getRoleAdmin()
```
getRoleAdmin(bytes32 role) public  returns (bytes32)
```
Returns the admin role that controls `role`. See {grantRole} and
{revokeRole}.
To change a role's admin, use {_setRoleAdmin}.
###  requireRole()
```
requireRole(bytes32 role, address account) public 
```
###  requirePermission()
```
requirePermission(bytes32 permission, address account) public 
```
###  isRoleAdmin()
```
isRoleAdmin(bytes32 role, address account) public 
```
###  requireApprovedContractOrEOA()
```
requireApprovedContractOrEOA(address account) public 
```
###  grantRole()
```
grantRole(bytes32 role, address account) public 
```
Grants `role` to `account`.
If `account` had not been already granted `role`, emits a {RoleGranted}
event.
Requirements:
- the caller must have ``role``'s admin role.
###  revokeRole()
```
revokeRole(bytes32 role, address account) public 
```
Revokes `role` from `account`.
If `account` had been granted `role`, emits a {RoleRevoked} event.
Requirements:
- the caller must have ``role``'s admin role.
###  renounceRole()
```
renounceRole(bytes32 role, address account) public 
```
Revokes `role` from the calling account.
Roles are often managed via {grantRole} and {revokeRole}: this function's
purpose is to provide a mechanism for accounts to lose their privileges
if they are compromised (such as when a trusted device is misplaced).
If the calling account had been granted `role`, emits a {RoleRevoked}
event.
Requirements:
- the caller must be `account`.
###  setRoleAdmin()
```
setRoleAdmin(bytes32 role, bytes32 adminRole) public 
```
###  grantPermission()
```
grantPermission(bytes32 permission, address account) public 
```
###  revokePermission()
```
revokePermission(bytes32 permission) public 
```
## Events
## Modifiers
### `onlyRole()`
```
onlyRole(bytes32 role)
```
Modifier that checks that an account has a specific role. Reverts
with a standardized message including the required role.
The format of the revert reason is given by the following regular expression:
 /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
_Available since v4.1._
## Graphs
### Dependency Graph
![Dependency Graph](/docs/images/ACLRegistry_dependency_graph.png)
### Inheritance Graph
![Inheritance Graph](/docs/images/ACLRegistry_inheritance_graph.png)
