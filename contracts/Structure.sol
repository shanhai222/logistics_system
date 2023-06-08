// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

library Structure {
    enum State {
        OrderCreated, // 0
        OrderProceeding, // 1
        OrderFinished, // 2
        DeliveredByConsigner, // 3
        CollectedByTransportCompany, // 4
        InTransit, // 5
        Arrived // 6
    }
    struct OrderDetails {
        address Consigner;
        address Consignee;
        ProductDetails Productdetails;
        State state;
        uint256 OrderId;
        string CreatedDate;
    }
    struct ProductDetails {
        string ProductName;
        uint256 ProductCode;
        uint256 ProductPrice;
        uint256 ProductQuantity;
    }
    struct LogisticsDetails {
        address Consigner;
        address Consignee;
        address TransportCompany;
        ProductDetails Productdetails;
        address[] TransferStations;
        State state;
        uint256 CurrentTransferStations;
        uint256 LogisticsId;
    }
    struct OrderHistory {
        OrderDetails[] history;
    }
    struct LogisticsHistory {
        LogisticsDetails[] history;
    }

}