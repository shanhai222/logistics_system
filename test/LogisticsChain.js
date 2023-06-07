var LogisticsChain = artifacts.require('LogisticsChain')

contract('SupplyChain', function(accounts) {
    var logisticsChain

    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var ownerID = accounts[0]
    const consigner = accounts[1]
    const consignee = accounts[2]
    const transportCompany = accounts[3]
    const tranferStaion1 = accounts[4]
    const tranferStaion2 = accounts[5]
    const tranferStaion3 = accounts[6]

    // declare a order
    const productName = "bread"
    const productCode = 101
    const productPrice = 5
    const productQuantity = 2
    const orderID = 1
    var state = 0
    const orderCreatedDate = "2023-6-2"

    console.log("<----------------ACCOUNTS----------------> ")
    console.log("Contract Owner: ", ownerID)
    console.log("Consigners: ", consigner)
    console.log("Consignees: ", consignee)
    console.log("Transport Companys: ", transportCompany)
    console.log("Transfer Stations: ", tranferStaion1, tranferStaion2, tranferStaion3)


    console.log("<-------TESTING CONTRACT FUNCTIONS------->")
    // Deploy SupplyChain and Register Actors
    it("0. Deploy LogisticsChain and Register Actors", async () => {
        logisticsChain = await LogisticsChain.deployed();

        // Declare and Initialize a variable for event
        var eventEmitted = false

        var event = logisticsChain.ConsignerAdded()
        await event.watch((err, res) => {
            eventEmitted = true
            console.log(err,res);
        })

        var event = logisticsChain.ConsigneeAdded()
        await event.watch((err, res) => {
            eventEmitted = true
            //console.log(res);
        })

        var event = logisticsChain.TransferStationAdded()
        await event.watch((err, res) => {
            eventEmitted = true
            //console.log(res);
        })

        var event = logisticsChain.TranportCompanyAdded()
        await event.watch((err, res) => {
            eventEmitted = true
            //console.log(res);
        })

        await logisticsChain.addConsigner(consigner, { from: ownerID })
        await logisticsChain.addConsignee(consignee, { from: ownerID })

        //TODO: register company and station

    })

    // Create some orders and search for detail
    it("1. Create Orders And Search For Details", async () => {
        var eventEmitted = false

        var event = logisticsChain.OrderCreated()
        await event.watch((err, res) => {
            eventEmitted = true
            console.log(err,res);
        })

        await logisticsChain.initOrdersForConsignee(consigner,consignee,productName,productCode,productPrice,productQuantity,state,orderID,orderCreatedDate,{ from: consignee })

        // Retrieve the just now saved item from blockchain by calling function
        const ordersOfConsignee = await logisticsChain.searchForOrdersOfConsignee.call(consignee)
        const ordersOfConsigner = await logisticsChain.searchForOrdersOfConsigner.call(consigner)
        
        const consigneeOrderDetail = await logisticsChain.searchForOrderDetails.call(orderID, { from: consignee })
        const consignerOrderDetail = await logisticsChain.searchForOrderDetails.call(orderID, { from: consigner })

        assert.equal(ordersOfConsignee, orderID, 'Error: Invalid OrderId Colllection Of Consigee')
        assert.equal(ordersOfConsigner, orderID, 'Error: Invalid OrderId Colllection Of Consigner')
        assert.equal(consigneeOrderDetail[0], consigner, 'Error: Missing or Invalid Consigner Message')
        assert.equal(consigneeOrderDetail[1], consignee, 'Error: Missing or Invalid Consignee Message')
        assert.equal(consigneeOrderDetail[2], productName, 'Error: Missing or Invalid Product Name')
        assert.equal(consigneeOrderDetail[3], productCode, 'Error: Missing or Invalid')
        assert.equal(consigneeOrderDetail[4], productPrice, '')
        assert.equal(consigneeOrderDetail[5], productQuantity, '')
        assert.equal(consigneeOrderDetail[6], state, '')
        assert.equal(consigneeOrderDetail[7], orderID, '')
        assert.equal(consigneeOrderDetail[8], orderCreatedDate, '')
    })
    
});