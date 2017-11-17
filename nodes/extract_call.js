const net = require('net'),
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

      let args = _.get(msg, 'payload.args') || redConfig.args || [];

      let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
      const web3 = new Web3();
      web3.setProvider(provider);

      let contractDefinition = smartContracts[redConfig.contract];

      if (!contractDefinition) {
        msg.payload = {};
        return node.send(msg);
      }

      let callContract = contract(contractDefinition);
      callContract.setProvider(provider);
      try {
        let callContractInstance = await callContract.deployed();
        let data = web3.eth.contract(smartContracts[redConfig.contract].abi).at(callContractInstance.address)[redConfig.contractFunction].getData(...args);
        web3.currentProvider.connection.end();

        msg.payload = {
          hash: data
        };

        node.send(msg);
      } catch (e) {
        msg.payload = {};
        node.send(msg);
      }

    });
  }

  RED.nodes.registerType('sc-extract-call', ExtractCall);
};
