const Promise = require('bluebird'),
  net = require('net'),
  contract = require('truffle-contract'),
  Web3 = require('web3'),
  _ = require('lodash'),
  config = require('../config'),
  smartContracts = require('../factories/sc/smartContractsFactory');

module.exports = function (RED) {
  function ExtractCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {
      console.log(redConfig.contract);
      console.log(redConfig.contractFunction);
      console.log(redConfig.args);

      let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
      const web3 = new Web3();
      web3.setProvider(provider);

      let contractDefinition = smartContracts[redConfig.contract];

      if (!contractDefinition)
        return {};

      let callContract = contract(contractDefinition);
      callContract.setProvider(provider);
      let callContractInstance = await callContract.deployed();
      let data = web3.eth.contract(smartContracts[redConfig.contract].abi).at(callContractInstance.address)[redConfig.contractFunction].getData(...redConfig.args);
      web3.currentProvider.connection.end();

      msg.payload = {
        hash: data
      };

      node.send(msg);
    });
  }

  RED.nodes.registerType('sc-extract-call', ExtractCall);
};
