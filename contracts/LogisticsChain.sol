// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "./Structure.sol";

contract LogisticsChain {

    event ConsigneeAdded(address indexed _account);

    // product
    uint256 public uid;
    uint256 sku;
    address owner;

    mapping(address => Structure.Roles) roles;
    mapping(uint256 => Structure.OrderDetails) orders;
    mapping(uint256 => Structure.LogisticsDetails) logisticsOrders;

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
        sku = 1;
        uid = 1;
    }

    event OrderCreated(uint256 uid);
    event OrderProceeding(uint256 uid);
    event OrderFinished(uint256 uid);
    event DeliveredByConsigner(uint256 uid);
    event CollectedByTransportCompany(uint256 uid);
    event InTransit(uint256 uid);
    event Arrived(uint256 uid);

    modifier verifyAddress(address add) {
        require(msg.sender == add);
        _;
    }

    modifier orderCreated(uint256 _uid) {
        require(orders[_uid].state == Structure.State.OrderCreated);
        _;
    }

    modifier orderProceeding(uint256 _uid) {
        require(orders[_uid].state == Structure.State.OrderProceeding);
        _;
    }

    modifier orderFinished(uint256 _uid) {
        require(orders[_uid].state == Structure.State.OrderFinished);
        _;
    }
        
    modifier deliveredByConsigner(uint256 _uid) {
        require(orders[_uid].state == Structure.State.DeliveredByConsigner);
        _;
    }

    modifier collectedByTransportCompany(uint256 _uid) {
        require(orders[_uid].state == Structure.State.CollectedByTransportCompany);
        _;
    }

    modifier inTransit(uint256 _uid) {
        require(orders[_uid].state == Structure.State.InTransit);
        _;
    }

    modifier arrived(uint256 _uid) {
        require(orders[_uid].state == Structure.State.Arrived);
        _;
    }
}

