pragma solidity >=0.4.16 <0.9.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'transport_companyRole' to manage this role - add, remove, check
contract TransportCompanyRole{
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event TransportCompanyAdded(address indexed account);
  event TransportCompanyRemoved(address indexed account);

  // Define a struct 'transport_companies' by inheriting from 'Roles' library, struct Role
  Roles.Role private TransportCompanies;

  // In the constructor make the address that deploys this contract the 1st transportCompany
  constructor() public {
    _addTransportCompany(msg.sender);
  }

  // check to see if msg.sender has the appropriate role
  modifier onlyTransportCompany() {
    require(isTransportCompany(msg.sender));
    _;
  }

  // check the role
  function isTransportCompany(address account) public view returns (bool) {
    return TransportCompanies.has(account);
  }

  // add the role
  function addTransportCompany(address account) public onlyTransportCompany {
    _addTransportCompany(account);
  }

  // renounce this role
  function renounceTransportCompany() public {
    _removeTransportCompany(msg.sender);
  }

  function _addTransportCompany(address account) internal {
    TransportCompanies.add(account);
    emit TransportCompanyAdded(account);
  }

  function _removeTransportCompany(address account) internal {
    TransportCompanies.remove(account);
    emit TransportCompanyRemoved(account);
  }
}