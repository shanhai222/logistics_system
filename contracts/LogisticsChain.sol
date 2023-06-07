// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "./Structure.sol";
import "./roleControl/ConsigneeRole.sol";
import "./roleControl/ConsignerRole.sol";
import "./roleControl/TransferStationRole.sol";
import "./roleControl/TransportCompanyRole.sol";

contract LogisticsChain is ConsigneeRole,ConsignerRole,TransferStationRole,TransportCompanyRole{

    uint256 public oid;  // orderId
    uint256 public lid;  // logisticsId
    Structure.OrderDetails public orderDetail;
    Structure.LogisticsDetails public logisticsDetail;
    address owner;

    mapping(address => Structure.Roles) roles;
    mapping(uint256 => Structure.OrderDetails) orders;  // oid->orderdetails
    mapping(uint256 => Structure.LogisticsDetails) logistics; // lid->logisticsdetails
    //mapping(address => Structure.OrderDetails[]) consigneeOrders;  // the orders from the consignee
    //mapping(address => Structure.OrderDetails[]) consignerOrders;  // the orders to the consigner

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

    // initialize some orders from the consignee
    function initOrdersForConsignee(Structure.OrderDetails memory order) public onlyConsignee{
      //consigneeOrders[_uid].push(order);
      oid = order.OrderId;
      orders[oid] = order;

      emit OrderCreated(oid);
    }

    // initialize some orders to the consigner
    /*
    function initOrdersForConsigner(Structure.OrderDetails memory order, address _uid) public onlyConsigner{
      consignerOrders[_uid].push(order);
    }
    */

    // checks to see if msg.sender == owner of the contract
    modifier verifyAddress(address add) {
        require(msg.sender == add);
        _;
    }

    // Define a modifer that verifies the Caller
    modifier verifyCaller (address _address) {
        require(msg.sender == _address);
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

    /*
    1st step in logisticschain
    Allows consigners to convert orders into logisics
    */
    function convertOrdersIntoLogisicsByConsigners(uint256 _oid, address _TransportCompany) public 
    onlyConsigner() 
    orderCreated(_oid) 
    verifyCaller(orders[_oid].Consigner) 
    {   
        orders[_oid].state = Structure.State.OrderProceeding;  // change the state of the order
        emit OrderProceeding(_oid);

        orderDetail = orders[_oid];
        Structure.LogisticsDetails memory one_logistics;
        one_logistics.Consigner = orderDetail.Consigner;
        one_logistics.Consignee = orderDetail.Consignee;
        one_logistics.TransportCompany = _TransportCompany;
        one_logistics.ProductDetails = orderDetail.ProductDetails;
        one_logistics.TransferStations = new address[](0);
        one_logistics.state = Structure.State.DeliveredByConsigner;
        one_logistics.CurrentTransferStations = 0;
        one_logistics.LogisticsId = orderDetail.OrderId;
        lid = _oid;
        logistics[lid] = one_logistics;

        emit DeliveredByConsigner(lid);
    }

    /*
    2nd step in logisticschain
    Allows transport company to collect
    */
    function collectProductByTransportCompany(uint _lid) public 
    onlyTransportCompany()
    deliveredByConsigner(_lid)
    verifyCaller(logistics[_lid].TransportCompany)
    {
        logistics[_lid].state = Structure.State.CollectedByTransportCompany;  // change the state of the logistics

        emit CollectedByTransportCompany(_lid);
    }


}

