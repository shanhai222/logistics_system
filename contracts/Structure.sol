// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

library Structure {
    struct Roles {
        bool Consignee;
        bool Consigner;
        bool TransferStation;
        bool TransportCompany;
    }
    enum State {
        OrderCreated,
        OrderProceeding,
        OrderFinished,
        DeliveredByConsigner,
        CollectedByTransportCompany,
        InTransit,
        Arrived
    }
    struct OrderDetails {
        address Consigner;
        address Consignee;
        string ProductDetails;
        State state;
        uint256 OrderId;
        uint256 CreatedDate;
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
        string ProductDetails;
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