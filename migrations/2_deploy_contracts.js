var ConsignerRole = artifacts.require("./ConsignerRole.sol");
var ConsigneeRole = artifacts.require("./ConsigneeRole.sol");
var TransferStation = artifacts.require("./TransferStationRole.sol");
var TransportCompany = artifacts.require("./TranportCompanyRole.sol");
var LogisticsChain = artifacts.require("./LogisticsChain.sol");

module.exports = function(deployer) {
  deployer.deploy(ConsignerRole);
  deployer.deploy(ConsigneeRole);
  deployer.deploy(TransferStation);
  deployer.deploy(TransportCompany);
  deployer.deploy(LogisticsChain);
};
