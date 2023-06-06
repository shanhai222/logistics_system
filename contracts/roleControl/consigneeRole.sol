pragma solidity >=0.4.16 <0.9.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'consigneeRole' to manage this role - add, remove, check
contract consigneeRole{
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event consigneeAdded(address indexed account);
  event consigneeRemoved(address indexed account);

  // Define a struct 'consignees' by inheriting from 'Roles' library, struct Role
  Roles.Role private consignees;

  // In the constructor make the address that deploys this contract the 1st consignee
  constructor() public {
    _addConsignee(msg.sender);
  }

  // check to see if msg.sender has the appropriate role
  modifier onlyConsignee() {
    require(isConsignee(msg.sender));
    _;
  }

  // check the role
  function isConsignee(address account) public view returns (bool) {
    return consignees.has(account);
  }

  // add the role
  function addConsignee(address account) public onlyConsignee {
    _addConsignee(account);
  }

  // renounce this role
  function renounceConsignee() public {
    _removeConsignee(msg.sender);
  }

  function _addConsignee(address account) internal {
    consignees.add(account);
    emit consigneeAdded(account);
  }

  function _removeConsignee(address account) internal {
    consignees.remove(account);
    emit consigneeRemoved(account);
  }
}