pragma solidity >=0.4.16 <0.9.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'transfer_stationRole' to manage this role - add, remove, check
contract transfer_stationRole{
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event transfer_stationAdded(address indexed account);
  event transfer_stationRemoved(address indexed account);

  // Define a struct 'transfer_stations' by inheriting from 'Roles' library, struct Role
  Roles.Role private transfer_stations;

  // In the constructor make the address that deploys this contract the 1st transfer_station
  constructor() public {
    _addTransfer_station(msg.sender);
  }

  // check to see if msg.sender has the appropriate role
  modifier onlyTransfer_station() {
    require(isTransfer_station(msg.sender));
    _;
  }

  // check the role
  function isTransfer_station(address account) public view returns (bool) {
    return transfer_stations.has(account);
  }

  // add the role
  function addTransfer_station(address account) public onlyTransfer_station {
    _addTransfer_station(account);
  }

  // renounce this role
  function renounceTransfer_station() public {
    _removeTransfer_station(msg.sender);
  }

  function _addTransfer_station(address account) internal {
    transfer_stations.add(account);
    emit transfer_stationAdded(account);
  }

  function _removeTransfer_station(address account) internal {
    transfer_stations.remove(account);
    emit transfer_stationRemoved(account);
  }
}