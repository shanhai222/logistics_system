pragma solidity >=0.4.16 <0.9.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'TransferStationRole' to manage this role - add, remove, check
contract TransferStationRole{
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event TransferStationAdded(address indexed account);
  event TransferStationRemoved(address indexed account);

  // Define a struct 'transfer_stations' by inheriting from 'Roles' library, struct Role
  Roles.Role private TransferStations;

  // In the constructor make the address that deploys this contract the 1st transfer_station
  constructor() public {
    _addTransferStation(msg.sender);
  }

  // check to see if msg.sender has the appropriate role
  modifier onlyTransferStation() {
    require(isTransferStation(msg.sender));
    _;
  }

  // check the role
  function isTransferStation(address account) public view returns (bool) {
    return TransferStations.has(account);
  }

  // add the role
  function addTransferStation(address account) public onlyTransferStation {
    _addTransferStation(account);
  }

  // renounce this role
  function renounceTransferStation() public {
    _removeTransferStation(msg.sender);
  }

  function _addTransferStation(address account) internal {
    TransferStations.add(account);
    emit TransferStationAdded(account);
  }

  function _removeTransferStation(address account) internal {
    TransferStations.remove(account);
    emit TransferStationRemoved(account);
  }
}