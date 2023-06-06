pragma solidity >=0.4.16 <0.9.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'consignerRole' to manage this role - add, remove, check
contract consignerRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event consignerAdded(address indexed account);
  event consignerRemoved(address indexed account);

  // Define a struct 'consigners' by inheriting from 'Roles' library, struct Role
  Roles.Role private consigners;

  // In the constructor make the address that deploys this contract the 1st consigner
  constructor() public {
    _addConsigner(msg.sender);
  }

  // check to see if msg.sender has the appropriate role
  modifier onlyConsigner() {
    require(isConsigner(msg.sender));
    _;
  }

  // check the role
  function isConsigner(address account) public view returns (bool) {
    return consigners.has(account);
  }

  // add the role
  function addConsigner(address account) public onlyConsigner {
    _addConsigner(account);
  }

  // renounce this role
  function renounceConsigner() public {
    _removeConsigner(msg.sender);
  }

  function _addConsigner(address account) internal {
    consigners.add(account);
    emit consignerAdded(account);
  }

  function _removeConsigner(address account) internal {
    consigners.remove(account);
    emit consignerRemoved(account);
  }
}