var Consigner = artifacts.require("./ConsignerRole.sol");
var Consignee = artifacts.require("./ConsigneeRole.sol");
var TransferStation = artifacts.require("./TransferStationRole.sol");
var TransportCompany = artifacts.require("./TransportCompanyRole.sol");
var LogisticsChain = artifacts.require("./LogisticsChain.sol");

module.exports = function(deployer) {
  deployer.deploy(Consigner);
  deployer.deploy(Consignee);
  deployer.deploy(TransferStation);
  deployer.deploy(TransportCompany);
  deployer.deploy(LogisticsChain);
};
