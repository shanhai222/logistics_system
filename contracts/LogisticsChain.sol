// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "./Structure.sol";
import "./roleControl/ConsigneeRole.sol";
import "./roleControl/ConsignerRole.sol";
import "./roleControl/TransferStationRole.sol";
import "./roleControl/TransportCompanyRole.sol";

contract LogisticsChain is ConsigneeRole,ConsignerRole,TransferStationRole,TransportCompanyRole{

    uint256 public oID;  // orderId
    uint256 public lid;  // logisticsId
    address owner;

    mapping(uint256 => Structure.OrderDetails) orders;  // oid->orderdetails
    mapping(uint256 => Structure.LogisticsDetails) logistics; // lid->logisticsdetails
    mapping(address => uint256[]) consigneeOrders;  // the ordersID from the consignee
    mapping(address => uint256[]) consignerOrders;  // the ordersID to the consigner
    mapping(address => uint256[]) consigneeLogistics;  // the logisticsID to the consignee
    mapping(address => uint256[]) consignerLogistics;  // the logisticsID from the consigner
    mapping(address => uint256[]) companyLogistics;
    mapping(address => Structure.OrderHistory) orderHistory; // address->finishedorder[]
    mapping(address => Structure.LogisticsHistory) logisticsHistory; // address->finishedlogistics[]
    
    constructor() public payable {
        owner = msg.sender;
        oID = 1;
    }

    //order
    event OrderCreated(uint256 _oid);
    event OrderProceeding(uint256 _oid);
    event OrderFinished(uint256 _oid);
    //deliver
    event DeliveredByConsigner(uint256 lid);
    event CollectedByTransportCompany(uint256 lid);
    event InTransit(uint256 lid);
    event Arrived(uint256 lid);

    // checks to see if msg.sender == owner of the contract
    modifier verifyAddress(address add) {
        require(msg.sender == add);
        _;
    }

    modifier orderBelongsToCaller(uint256 _oid) {
        require(orders[_oid].Consigner == msg.sender || orders[_oid].Consignee == msg.sender);
        _;
    }

    modifier logisticsBelongsToCaller(uint256 _lid) {
        require(logistics[_lid].Consigner == msg.sender || logistics[_lid].Consignee == msg.sender || logistics[_lid].TransportCompany == msg.sender);
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

    // declare a function to search for all the orders of the consigner
    function searchForOrdersOfCaller(address _add) public view returns(uint256[] memory orderId)
    {   
        uint256[] memory ordersOfCaller;
        if (isConsigner(_add)){
            ordersOfCaller = consignerOrders[_add];
        }else if (isConsignee(_add)) {
            ordersOfCaller = consigneeOrders[_add];
        }
        
        return ordersOfCaller;
    }

    // declare a function to search fo all the logistics of the consigner
    function searchForLogisticsOfCaller(address _add) public view returns(uint256[] memory logisticsID) {
        uint256[] memory logisticsOfCaller;
        if (isConsigner(_add)){
            logisticsOfCaller = consignerLogistics[_add];
        }else if (isConsignee(_add)) {
            logisticsOfCaller = consigneeLogistics[_add];
        }else if (isTransportCompany(_add)) {
            logisticsOfCaller = companyLogistics[_add];
        }
        return logisticsOfCaller;
    }

    // declare a function to search for specific order
    function searchForOrderDetails(uint256 _oid) public view orderBelongsToCaller(_oid) returns
    (   
        address Consigner,
        address Consignee,
        string memory ProductName,
        uint256 ProductCode,
        uint256 ProductPrice,
        uint256 ProductQuantity,
        Structure.State state,
        uint256 OrderId,
        uint256 CreatedDate
    )
    {
        Structure.OrderDetails memory orderDetail = orders[_oid];
        return 
        (
            orderDetail.Consigner, 
            orderDetail.Consignee,
            orderDetail.Productdetails.ProductName,
            orderDetail.Productdetails.ProductCode,
            orderDetail.Productdetails.ProductPrice,
            orderDetail.Productdetails.ProductQuantity,
            orderDetail.state,
            orderDetail.OrderId,
            orderDetail.CreatedDate
        );
    }

    // declare a function to search for specific logistics
    function searchForLogisticsDetails(uint256 _lid) public view logisticsBelongsToCaller(_lid) returns
    (
        address Consigner,
        address Consignee,
        address TransportCompany,
        string memory ProductName,
        uint256 ProductCode,
        uint256 ProductPrice,
        uint256 ProductQuantity,
        address[] memory TransferStations,
        Structure.State state,
        uint256 CurrentTransferStations,
        uint256 LogisticsId
    ) 
    {
        Structure.LogisticsDetails memory logisticsDetail = logistics[_lid];
        return
        (
            logisticsDetail.Consigner,
            logisticsDetail.Consignee,
            logisticsDetail.TransportCompany,
            logisticsDetail.Productdetails.ProductName,
            logisticsDetail.Productdetails.ProductCode,
            logisticsDetail.Productdetails.ProductPrice,
            logisticsDetail.Productdetails.ProductQuantity,
            logisticsDetail.TransferStations,
            logisticsDetail.state,
            logisticsDetail.CurrentTransferStations,
            logisticsDetail.LogisticsId
        );
    }

    /*
    1st step in logisticschain
    Allows consignees to create some orders
    */
    function initOrdersForConsignee
    (
        address _Consigner,
        address _Consignee,
        string memory _ProductName,
        uint256 _ProductCode,
        uint256 _ProductPrice,
        uint256 _ProductQuantity,
        uint256 _CreatedDate
    ) public onlyConsignee() {
        Structure.OrderDetails memory order;
        Structure.ProductDetails memory product;
        product.ProductName = _ProductName;
        product.ProductCode = _ProductCode;
        product.ProductPrice = _ProductPrice;
        product.ProductQuantity = _ProductQuantity;
        order.Consigner = _Consigner;
        order.Consignee = _Consignee;
        order.Productdetails = product;
        order.state = Structure.State.OrderCreated;
        order.OrderId = oID;
        order.CreatedDate = _CreatedDate;
        orders[oID] = order;
        consigneeOrders[msg.sender].push(oID);
        //address consigner = order.Consigner;
        consignerOrders[_Consigner].push(oID);

        emit OrderCreated(oID);
    }

    function setOid() public onlyConsignee() {
        oID ++;
    }
    
    /*
    2nd step in logisticschain
    Allows consigners to convert orders into logisics
    */
    function convertOrdersIntoLogisicsByConsigners(uint256 _oid, address _TransportCompany) public 
    onlyConsigner() 
    orderCreated(_oid) 
    orderBelongsToCaller(_oid)
    {   
        orders[_oid].state = Structure.State.OrderProceeding;  // change the state of the order
        emit OrderProceeding(_oid);

        Structure.OrderDetails memory orderDetail = orders[_oid];
        Structure.LogisticsDetails memory one_logistics;
        one_logistics.Consigner = orderDetail.Consigner;
        one_logistics.Consignee = orderDetail.Consignee;
        one_logistics.TransportCompany = _TransportCompany;
        one_logistics.Productdetails = orderDetail.Productdetails;
        one_logistics.TransferStations = new address[](0);
        one_logistics.state = Structure.State.DeliveredByConsigner;
        one_logistics.CurrentTransferStations = 0;
        one_logistics.LogisticsId = orderDetail.OrderId;
        lid = _oid;
        logistics[lid] = one_logistics;
        consignerLogistics[msg.sender].push(lid);
        consigneeLogistics[orderDetail.Consignee].push(lid);
        companyLogistics[_TransportCompany].push(lid);

        emit DeliveredByConsigner(lid);
    }

    /*
    3rd step in logisticschain
    Allows transport company to collect
    */
    function collectProductByTransportCompany(uint256 _lid) public 
    onlyTransportCompany()
    deliveredByConsigner(_lid)
    logisticsBelongsToCaller(_lid)
    {
        logistics[_lid].state = Structure.State.CollectedByTransportCompany;  // change the state of the logistics

        emit CollectedByTransportCompany(_lid);
    }

    /*
    4th step in logisticschain
    update tranferstations and allow company to update logistic status to inTransit 
    */
    function transferProductByTransportCompany(uint256 _lid, address[] memory stations) public 
    onlyTransportCompany()
    collectedByTransportCompany(_lid)
    logisticsBelongsToCaller(_lid)
    {
        bool stationsExist = true;
        for (uint i = 0; i < stations.length; i++) {
            if (!isTransferStation(stations[i])) {
                stationsExist = false;
            }
        }
        if (stationsExist) {
            logistics[_lid].TransferStations = stations; // update TransferStations
            // update state product begins to transfer
            logistics[_lid].state = Structure.State.InTransit;
            emit InTransit(_lid);
        } 

    }

    /*
    5th step in logisticschain 
    transferstation update logistics detail
    */
    function updateCurrentTransferStationByTransferStation(uint256 _lid) public
    onlyTransferStation()
    inTransit(_lid)
    {
        // get current station as index
        uint256 StationIndex = logistics[_lid].CurrentTransferStations;
        address[] memory stations = logistics[_lid].TransferStations;
        require(StationIndex < stations.length);
        // judge authority : next station address == msg.sender
        require(msg.sender == stations[StationIndex]);
        // update current station
        logistics[_lid].CurrentTransferStations = StationIndex + 1;
    }

    /*
    6th step in logisticschain
    Product arrived in final station, transport company update logistics state to arrived
    */
    function arrivedProductByFinalTransferStation(uint256 _lid) public
    onlyTransferStation()
    inTransit(_lid)
    {
        uint256 StationIndex = logistics[_lid].CurrentTransferStations;
        address[] memory stations = logistics[_lid].TransferStations;
        // judge product has arrived final station
        require(StationIndex == stations.length);
        require(msg.sender == stations[StationIndex-1]);
        // update logistics state to arrived
        logistics[_lid].state = Structure.State.Arrived;
        emit Arrived(_lid);
    }

    /*
    7th step in logisticschain
    Product arrived, and consignee can receive the product, add finished order to history
    */
    function orderFinishedByConsignee(uint256 _oid) public
    onlyConsignee() 
    orderProceeding(_oid)
    arrived(_oid)
    orderBelongsToCaller(_oid)
    logisticsBelongsToCaller(_oid)
    {
        orders[_oid].state = Structure.State.OrderFinished;
        address consignee = orders[_oid].Consignee;
        orderHistory[consignee].history.push(orders[_oid]);
        logisticsHistory[consignee].history.push(logistics[_oid]);
        emit OrderFinished(_oid);
    }

}

