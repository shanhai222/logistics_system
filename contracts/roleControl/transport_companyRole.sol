pragma solidity >=0.4.16 <0.9.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'transfer_companyRole' to manage this role - add, remove, check
contract TransferCompanyRole{
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event TransferCompanyAdded(address indexed account);
  event TransferCompanyRemoved(address indexed account);

  // Define a struct 'transfer_companies' by inheriting from 'Roles' library, struct Role
  Roles.Role private TransferCompanies;

  // In the constructor make the address that deploys this contract the 1st transfer_company
  constructor() public {
    _addTransferCompany(msg.sender);
  }

  // check to see if msg.sender has the appropriate role
  modifier onlyTransferCompany() {
    require(isTransferCompany(msg.sender));
    _;
  }

  // check the role
  function isTransferCompany(address account) public view returns (bool) {
    return TransferCompanies.has(account);
  }

  // add the role
  function addTransferCompany(address account) public onlyTransferCompany {
    _addTransferCompany(account);
  }

  // renounce this role
  function renounceTransferCompany() public {
    _removeTransferCompany(msg.sender);
  }

  function _addTransferCompany(address account) internal {
    TransferCompanies.add(account);
    emit TransferCompanyAdded(account);
  }

  function _removeTransferCompany(address account) internal {
    TransferCompanies.remove(account);
    emit TransferCompanyRemoved(account);
  }
}