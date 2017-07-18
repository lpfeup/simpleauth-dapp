var StringUtils = artifacts.require("./stringUtils.sol");
var UserStore = artifacts.require("./UserStore.sol");

module.exports = function(deployer) {
  deployer.deploy(StringUtils);
  deployer.link(StringUtils, UserStore);
  deployer.deploy(UserStore);
};
