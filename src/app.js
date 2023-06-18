App = {
    web3Provider: null,
    contracts: {},
    orderID: 1,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    consigner: "0x0000000000000000000000000000000000000000",
    consignee: "0x0000000000000000000000000000000000000000",
    caller: "0x0000000000000000000000000000000000000000",
    productName: null,
    productCode: 0,
    productQuantity: 0,
    productPrice: 0,
    transportCompany: "0x0000000000000000000000000000000000000000",
    transferStation: "0x0000000000000000000000000000000000000000",
    transferStations: [],


    init: async function () {
        /// Setup access to blockchain
        return await App.initWeb3();
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
            document.getElementById("divType").innerText = "Using MetaMask Address"
            App.consignee = document.getElementById("consignee").value;
            App.consigner = document.getElementById("consigner").value;
            App.transportCompany = document.getElementById("transportCompany").value;
            App.transferStation = document.getElementById("transferStation").value;
          }
        )
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

    getCurrentMetaMaskID: function () {
        web3 = new Web3(App.web3Provider);
    
        return new Promise((resolve, reject) => {
            web3.eth.getAccounts(function(err, res) {
                if (err) {
                    console.log('Error:',err);
                    reject(err);
                }
                else {
                    App.caller = res[0];
                    resolve(res[0]);
                }
            })
        });
    },

    // a function to Convert state format
    convertState: function(state) {
        var state_str = '';
        switch(state) {
            case 0:
                state_str = 'OrderCreated';
                return state_str;
            case 1:
                state_str = 'OrderProceeding'
                return state_str;
            case 2:
                state_str = 'OrderFinished';
                return state_str;
            case 3:
                state_str = 'DeliveredByConsigner';
                return state_str;
            case 4:
                state_str = 'CollectedByTransportCompany';
                return state_str;
            case 5:
                state_str = 'InTransit';
                return state_str;
            case 6:
                state_str = 'Arrived';
                return state_str;
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
        var displayTo = document.getElementById("searchResult0");
        var consigner1 = document.getElementById("consigner1").value;
        var consignee1 = document.getElementById("consignee1").value;
        var productName = document.getElementById("productName").value;
        var productCode = parseInt(document.getElementById("productCode").value);
        var productPrice = parseInt(document.getElementById("productPrice").value);
        var productQuantity = parseInt(document.getElementById("productQuantity").value);
        //var orderID = parseInt(document.getElementById("orderID").value);
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            var orderDate = new Date();
            var Timestamp = Math.floor(orderDate.getTime() / 1000);
            return instance.initOrdersForConsignee(
                consigner1,
                consignee1,
                productName,
                productCode,
                productPrice,
                productQuantity,
                //orderID,
                Timestamp,
                {from: App.caller, gas:3000000}
            );
        }).then(function(result) {
            console.log(result);
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
            
            return App.contracts.LogisticsChain.deployed().then(function(instance) {
                return instance.getOid({ from: App.caller, gas:3000000});
            });
        }).then(function(result) {

            while (displayTo.firstChild) {
                displayTo.removeChild(displayTo.firstChild);
            }
  
            let html = "Order ID: "+result;
            displayTo.innerHTML = html;

            return App.contracts.LogisticsChain.deployed().then(function(instance) {
                return instance.setOid({ from: App.caller, gas:3000000});
            });
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
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForOrdersOfCaller(App.caller);
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }

          let html = "Order ID: ";
            for (var i = 0; i < result.length; i++){
                html += result[i] + " ";
            }
            displayTo.innerHTML = html;
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //7
    searchForOrderDetails: function () {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var displayTo = document.getElementById("searchResult2");
        var orderID = parseInt(document.getElementById("orderID1").value);
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForOrderDetails(orderID, { from: App.caller });
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }

          var orderDate = new Date(result[8]*1000);
          var state = App.convertState(parseInt(result[6]));
          displayTo.innerHTML = (

          "Consigner: "+result[0]+"<br>"+
          "Consignee: "+result[1]+"<br>"+
          "Product Name: "+result[2]+"<br>"+
          "Product Code: "+result[3]+"<br>"+
          "Product Price: "+result[4]+"<br>"+
          "Product Quantity: "+result[5]+"<br>"+
          "Order State: "+state+"<br>"+
          "Order ID: "+result[7]+"<br>"+
          "Order Created Date: "+orderDate);

        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //8
    convertOrdersIntoLogisicsByConsigners: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("coil");
        var orderID = parseInt(document.getElementById("orderID2").value);
        var transportCompany = document.getElementById("tp").value;
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.convertOrdersIntoLogisicsByConsigners(
                orderID,
                transportCompany,
                {from: App.caller, gas:3000000}
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
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForLogisticsOfCaller(App.caller);
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }

          let html = "Logistics ID: ";
            for (var i = 0; i < result.length; i++){
                html += result[i] + " ";
            }
            displayTo.innerHTML = html;

        }).catch(function(err) {
          console.log(err.message);
        });
    },

    //10
    searchForLogisticsDetails: function () {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var displayTo = document.getElementById("searchResult4");
        var lid = parseInt(document.getElementById("logisticsID1").value);
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
          return instance.searchForLogisticsDetails(lid, { from: App.caller });
        }).then(function(result) {
          while (displayTo.firstChild) {
              displayTo.removeChild(displayTo.firstChild);
          }
          
          var state = App.convertState(parseInt(result[8]));
          let station = "<br>";
            for (var i = 0; i < result[7].length; i++){
                station += result[7][i] + "<br>";
            }
          displayTo.innerHTML = (

          "Consigner: "+result[0]+"<br>"+
          "Consignee: "+result[1]+"<br>"+
          "Transport Company: "+result[2]+"<br>"+
          "Product Name: "+result[3]+"<br>"+
          "Product Code: "+result[4]+"<br>"+
          "Product Price: "+result[5]+"<br>"+
          "Product Quantity: "+result[6]+"<br>"+
          "Transfer Stations: "+station+"<br>"+
          "Logistics State: "+state+"<br>"+
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
        var lid = parseInt(document.getElementById("logisticsID2").value);
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.collectProductByTransportCompany(
                lid,
                {from: App.caller, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },

    //12
    transferProductByTransportCompany: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("update_route");
        var lid = parseInt(document.getElementById("logisticsID2").value);
        var stations = $('#transferStations').val();
        App.transferStations = stations.split('\n');
        console.log(App.transferStations);
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.transferProductByTransportCompany(
                lid,
                App.transferStations,
                {from: App.transportCompany, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "  Tx Hash: "+result.tx + "\n" + "Transfer Route: " + "\n" + stations;
        }).catch(function(err) {
          resultTag.className = " font";
          resultTag.innerText = "  Error: "+err.message;
        });
    },


    //13
    updateCurrentTransferStationByTransferStation: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        var resultTag = document.getElementById("update_station");
        var lid = $('#logisticsID2').val();
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.updateCurrentTransferStationByTransferStation(
                lid,
                {from: App.caller, gas:3000000}
            );
        }).then(function(result) {
            resultTag.className = " font";
            resultTag.innerText = "Arrived on Station: " + App.caller;
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
        var lid = parseInt(document.getElementById("logisticsID2").value);
        App.getCurrentMetaMaskID()
        .then(caller => console.log("Current caller:", caller))
        .catch(err => console.error("Error:", err));
        App.contracts.LogisticsChain.deployed().then(function(instance) {
            resultTag.className = " loader";
            return instance.arrivedProductByFinalTransferStation(
                lid,
                {from: App.caller, gas:3000000}
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
        var oid = parseInt(document.getElementById("orderID").value);
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