App = {
    web3Provider: null,
    contracts: {},
    orderID: 1,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    consigner: "0x0000000000000000000000000000000000000000",
    consignee: "0x0000000000000000000000000000000000000000",
    productName: null,
    productCode: 0,
    productQuantity: 0,
    productPrice: 0,
    transportCompany: "0x0000000000000000000000000000000000000000",
    // transferStation1: "0x0000000000000000000000000000000000000000",
    // transferStation2: "0x0000000000000000000000000000000000000000",
    // transferStation3: "0x0000000000000000000000000000000000000000",
    transferStation: "0x0000000000000000000000000000000000000000",
    transferStations: [],


    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.orderID = $("#orderID").val();
        App.consigner = $("#consigner").val();
        App.consignee = $("#consignee").val();
        App.productName = $("#productName").val();
        App.productCode = $("#productCode").val();
        App.productQuantity = $("#productQuantity").val();
        App.productPrice = $("#productPrice").val();

        console.log(
            App.orderID,
            App.consigner, 
            App.consignee, 
            App.productName, 
            App.productCode, 
            App.productQuantity, 
            App.productPrice, 
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            console.log(App.web3Provider);
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }

        // App.getMetaskAccountID();

        return App.initLogisticsChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }

            App.metamaskAccountID = res[0];
            if (res.length > 1){
            document.getElementById("divType").innerText = "Ganache Address"
            console.log("Using Ganache");
            App.consignee = res[1];
            document.getElementById("consignee").value = App.consignee;
            App.consigner = res[2];
            document.getElementById("consigner").value = App.consigner;
            App.transportCompany = res[3];
            document.getElementById("transportCompany").value = App.transportCompany;
            App.transferStation1 = res[4];
            document.getElementById("transferStation1").value = App.transferStation1;
            App.transferStation2 = res[5];
            document.getElementById("transferStation2").value = App.transferStation2;
            App.transferStation3 = res[6];
            document.getElementById("transferStation3").value = App.transferStation3;
          }else{
            document.getElementById("divType").innerText = "Using MetaMask Address"
            App.consignee = document.getElementById("consignee").value;
            App.consigner = document.getElementById("consigner").value;
            App.transportCompany = document.getElementById("transportCompany").value;
            App.transferStation = document.getElementById("transferStation").value;
          }
        })
    },

    initLogisticsChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonLogisticsChain='../../build/contracts/LogisticsChain.json';
        //var json
        /// JSONfy the smart contracts
        $.getJSON(jsonLogisticsChain, function(data) {
            console.log('data',data);
            var LogisticsChainArtifact = data;
            App.contracts.LogisticsChain = TruffleContract(LogisticsChainArtifact);
            App.contracts.LogisticsChain.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();
        App.getMetaskAccountID();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.addConsigner(event);
                break;
            case 2:
                return await App.addConsignee(event);
                break;
            case 3:
                return await App.addTransportCompany(event);
                break;
            case 4:
                return await App.addTransferStation(event);
                break;

            case 5:
                return await App.initOrdersForConsignee(event);
                break;

            case 6:
                return await App.searchForOrdersOfCaller(event);
                break;

            case 7:
                return await App.searchForOrderDetails(event);
                break;

            case 8:
                return await App.convertOrdersIntoLogisicsByConsigners(event);
                break;

            case 9:
                return await App.searchForLogisticsOfCaller(event);
                break;

            case 10:
                return await App.searchForLogisticsDetails(event);
                break;

            case 11:
                return await App.collectProductByTransportCompany(event);
                break;

            case 12:
                return await App.transferProductByTransportCompany(event);
                break;

            case 13:
                return await App.updateCurrentTransferStationByTransferStation(event);
                break;

            case 14:
                return await App.arrivedProductByFinalTransferStation(event);
                break;

            case 15:
                return await App.orderFinishedByConsignee(event);
                break;

            }
    },

    //1
    addConsigner: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("isConsigner");
        App.consigner = document.getElementById("consigner").value;
        App.contracts.LogisticsChain.deployed().then( async function(instance) {
            resultTag.className = " loader";
            var checkRole = await instance.isConsigner(App.consigner);
            if (checkRole == false){
              await instance.addConsigner(
                   App.consigner,
                  {from: App.metamaskAccountID, gas:3000000}
              );
            }
            sleep(800);
            checkRole = await instance.isConsigner(App.consigner);
            return checkRole;
        }).then(function(result) {
            resultTag.className = " inputFeilds";
            resultTag.innerText = result;
            if (result == true){
                resultTag.style.color = "green"
            }else{
                resultTag.style.color = "red"

            }
        }).catch(function(err) {
          resultTag.className = " inputFeilds";
          resultTag.innerText = "  Error: "+err.message;

        });
    },

    //2
    addConsignee: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("isConsignee");
        App.consignee = document.getElementById("consignee").value;
        App.contracts.LogisticsChain.deployed().then( async function(instance) {
            resultTag.className = " loader";
            var checkRole = await instance.isConsignee(App.consignee);
            if (checkRole == false){
              await instance.addConsignee(
                   App.consignee,
                  {from: App.metamaskAccountID, gas:3000000}
              );
            }
            sleep(800);
            checkRole = await instance.isConsignee(App.consignee);
            return checkRole;
        }).then(function(result) {
            resultTag.className = " inputFeilds";
            resultTag.innerText = result;
            if (result == true){
                resultTag.style.color = "green"
            }else{
                resultTag.style.color = "red"

            }
        }).catch(function(err) {
          resultTag.className = " inputFeilds";
          resultTag.innerText = "  Error: "+err.message;

        });
    },
    
    //3
    addTransportCompany: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("isTransportCompany");
        App.transportCompany = document.getElementById("transportCompany").value;
        App.contracts.LogisticsChain.deployed().then( async function(instance) {
            resultTag.className = " loader";
            var checkRole = await instance.isTransportCompany(App.transportCompany);
            if (checkRole == false){
              await instance.addTransportCompany(
                   App.transportCompany,
                  {from: App.metamaskAccountID, gas:3000000}
              );
            }
            sleep(800);
            checkRole = await instance.isTransportCompany(App.transportCompany);
            return checkRole;
        }).then(function(result) {
            resultTag.className = " inputFeilds";
            resultTag.innerText = result;
            if (result == true){
                resultTag.style.color = "green"
            }else{
                resultTag.style.color = "red"

            }
        }).catch(function(err) {
          resultTag.className = " inputFeilds";
          resultTag.innerText = "  Error: "+err.message;

        });
    },
    // 4 
    addTransferStation: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("isTransferStation");
        App.transferStation = document.getElementById("transferStation").value;
        App.contracts.LogisticsChain.deployed().then( async function(instance) {
            resultTag.className = " loader";
            var checkRole = await instance.isTransferStation(App.transferStation);
            if (checkRole == false){
              await instance.addTransferStation(
                   App.transferStation,
                  {from: App.metamaskAccountID, gas:3000000}
              );
            }
            sleep(800);
            checkRole = await instance.isTransferStation(App.transferStation);
            return checkRole;
        }).then(function(result) {
            resultTag.className = " inputFeilds";
            resultTag.innerText = result;
            if (result == true){
                resultTag.style.color = "green";
                // // empty input text
                // resultTag.value = "";
                // App.transferStation = "0x0000000000000000000000000000000000000000";
            }else{
                resultTag.style.color = "red"

            }
        }).catch(function(err) {
          resultTag.className = " inputFeilds";
          resultTag.innerText = "  Error: "+err.message;

        });
    },

    //5
    initOrdersForConsignee: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("initOrder");
        App.readForm();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            var orderDate = new Date();
            var Timestamp = Math.floor(orderDate.getTime() / 1000);
            return instance.initOrdersForConsignee(
                App.consigner,
                App.consignee,
                App.productName,
                App.productCode,
                App.productPrice,
                App.productQuantity,
                App.orderID,
                Timestamp,
                {from: App.consignee, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    //6
    searchForOrdersOfCaller: function () {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var displayTo = document.getElementById("searchResult1");
        var caller = $('#caller0').val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForOrdersOfCaller(caller);
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }

          let html = '';
          displayTo.innerHTML = (
                html += "Order ID: "+result[0]+"<br>"
            );

        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //7
    searchForOrderDetails: function () {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var displayTo = document.getElementById("searchResult2");
        // var orderId = $('#orderID1').val();
        // App.readForm();
        var orderId = parseInt($('#orderID1').val());
        var caller = $('#caller1').val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForOrderDetails(orderId, { from: caller});
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }

          var orderDate = new Date(result[8]*1000);
          displayTo.innerHTML = (

          "Consigner: "+result[0]+"<br>"+
          "Consignee: "+result[1]+"<br>"+
          "Product Name: "+result[2]+"<br>"+
          "Product Code: "+result[3]+"<br>"+
          "Product Price: "+result[4]+"<br>"+
          "Product Quantity: "+result[5]+"<br>"+
          "Order State: "+result[6]+"<br>"+
          "Order ID: "+result[7]+"<br>"+
          "Order Created Date: "+orderDate.toISOString);

        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //8
    convertOrdersIntoLogisicsByConsigners: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("coil");
        var oid = $("#orderID2").val();
        var transportCompany = $("#tp").val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.convertOrdersIntoLogisicsByConsigners(
                oid,
                transportCompany,
                {from: App.consigner, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    //9
    searchForLogisticsOfCaller: function () {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var displayTo = document.getElementById("searchResult3");
        var caller = $('#caller2').val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForLogisticsOfCaller(caller);
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }


          let html = '';
          displayTo.innerHTML = (
                html += "Logistics ID: "+result[0]+"<br>"
            );

        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //10
    searchForLogisticsDetails: function () {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var displayTo = document.getElementById("searchResult4");
        var lid = $('#logisticsID1').val();
        var caller = $('#caller3').val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForLogisticsDetails(lid, { from: caller });
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }

          displayTo.innerHTML = (

          "Consigner: "+result[0]+"<br>"+
          "Consignee: "+result[1]+"<br>"+
          "Transport Company"+result[2]+"<br>"+
          "Product Name: "+result[3]+"<br>"+
          "Product Code: "+result[4]+"<br>"+
          "Product Price: "+result[5]+"<br>"+
          "Product Quantity: "+result[6]+"<br>"+
          "Transfer Stations: "+result[7]+"<br>"+
          "Logistics State: "+result[8]+"<br>"+
          "Current Transfer Station: "+result[9]+"<br>"+
          "Logistics ID: "+result[10]);

        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //11
    collectProductByTransportCompany: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("cp");
        var lid = $('#logisticsID2').val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.collectProductByTransportCompany(
                lid,
                {from: App.transportCompany, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    // you add
    //12
    transferProductByTransportCompany: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("update_route");
        var lid = $('#logisticsID2').val();
        var stations = $('#transferStations').val();
        App.transferStations = stations.split('\n');
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.transferProductByTransportCompany(
                lid,
                App.transferStations,
                {from: App.transportCompany, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx + "\n" + "Transfer Route: " + stations;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    getCurrentMetaMaskID: function () {
        web3 = new Web3(App.web3Provider);
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return
            }
            App.transferStation = res[0];
        })
    },

    //13
    updateCurrentTransferStationByTransferStation: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("update_station");
        var lid = $('#logisticsID2').val();
        App.getCurrentMetaMaskID();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.updateCurrentTransferStationByTransferStation(
                lid,
                {from: App.transferStation, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "Arrived on Station: " + App.transferStation;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    //14
    arrivedProductByFinalTransferStation: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("arrive");
        var lid = $('#logisticsID2').val();
        App.getCurrentMetaMaskID();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.arrivedProductByFinalTransferStation(
                lid,
                {from: App.transferStation, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    //15
    orderFinishedByConsignee: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("finish");
        var oid = $('#orderID').val();
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.orderFinishedByConsignee(
                oid,
                {from: App.consignee, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

},
$(function () {
    $(window).load(function () {
        App.init();
    });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}