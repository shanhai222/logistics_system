// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "./Structure.sol";

contract LogisticsChain {

    event ConsigneeAdded(address indexed _account);

    uint256 public oid;  // orderId
    address owner;

    mapping(address => Structure.Roles) roles;
    mapping(uint256 => Structure.OrderDetails) orders;  // oid->orderdetails
    mapping(uint256 => Structure.LogisticsDetails) logistics; // lid->logisticsdetails

    function hasConsigneeRole(address _account) public view returns (bool) {
        require(_account != address(0));
        return roles[_account].Consignee;
    }

    function addConsigneeRole(address _account) public {
        require(_account != address(0));
        require(!hasConsigneeRole(_account));

        roles[_account].Consignee = true;
    }
    
    function hasConsignerRole(address _account) public view returns (bool) {
        require(_account != address(0));
        return roles[_account].Consigner;
    }

    function addConsignerRole(address _account) public {
        require(_account != address(0));
        require(!hasConsignerRole(_account));

        roles[_account].Consigner = true;
    }

    function hasTransferStationRole(address _account) public view returns (bool) {
        require(_account != address(0));
        return roles[_account].TransferStation;
    }

    function addTransferStationRole(address _account) public {
        require(_account != address(0));
        require(!hasTransferStationRole(_account));

        roles[_account].TransferStation = true;
    }

    function hasTransportCompanyRole(address _account) public view returns (bool) {
        require(_account != address(0));
        return roles[_account].TransportCompany;
    }

    function addTransportCompanyRole(address _account) public {
        require(_account != address(0));
        require(!hasTransportCompanyRole(_account));

        roles[_account].TransportCompany = true;
    }

    constructor() public payable {
        owner = msg.sender;
        oid = 1;
    }

    //order
    event OrderCreated(uint256 oid);
    event OrderProceeding(uint256 oid);
    event OrderFinished(uint256 oid);
    //deliver
    event DeliveredByConsigner(uint256 lid);
    event CollectedByTransportCompany(uint256 lid);
    event InTransit(uint256 lid);
    event Arrived(uint256 lid);

    modifier verifyAddress(address add) {
        require(msg.sender == add);
        _;
    }

    modifier orderCreated(uint256 _oid) {
        require(orders[_oid].state == Structure.State.OrderCreated);
        _;
    }

    modifier orderProceeding(uint256 _oid) {
        require(orders[_oid].state == Structure.State.OrderProceeding);
        _;
    }

    modifier orderFinished(uint256 _oid) {
        require(orders[_oid].state == Structure.State.OrderFinished);
        _;
    }
        
    modifier deliveredByConsigner(uint256 _lid) {
        require(logistics[_lid].state == Structure.State.DeliveredByConsigner);
        _;
    }

    modifier collectedByTransportCompany(uint256 _lid) {
        require(logistics[_lid].state == Structure.State.CollectedByTransportCompany);
        _;
    }

    modifier inTransit(uint256 _lid) {
        require(logistics[_lid].state == Structure.State.InTransit);
        _;
    }

    modifier arrived(uint256 _lid) {
        require(logistics[_lid].state == Structure.State.Arrived);
        _;
    }

    
}

