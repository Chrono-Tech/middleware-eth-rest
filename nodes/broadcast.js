const net = require('net'),
  Promise = require('bluebird'),
  Web3 = require('web3'),
  config = require('../config');

module.exports = function (RED) {
  function ExtractCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {
      console.log(msg.payload);

      let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
      const web3 = new Web3();
      web3.setProvider(provider);

      try {
        let response = await Promise.promisify(web3.eth.sendRawTransaction)(msg.payload.tx);
        web3.currentProvider.connection.end();

        msg.payload = {
          response: response
        };

        node.send(msg);
      } catch (e) {
        msg.payload = {};
        node.send(msg);
      }

    });
  }

  RED.nodes.registerType('sc-broadcast', ExtractCall);
};
