const net = require('net'),
  Promise = require('bluebird'),
  Web3 = require('web3'),
  _ = require('lodash'),
  config = require('../config');

module.exports = function (RED) {
  function ExtractCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      let method = redConfig.mode === '1' ? _.get(msg, 'payload.method', '') : redConfig.method;
      let params = redConfig.mode === '1' ? _.get(msg, 'payload.params', []) : redConfig.params;

      let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
      const web3 = new Web3();
      web3.setProvider(provider);

      web3.currentProvider.connection.on('error', () => {
        //log.error('ipc process has finished!');
        process.exit(0);
      });
      try {
        let response = await Promise.promisify(web3.currentProvider.sendAsync).bind(web3.currentProvider)({
          jsonrpc: '2.0',
          method: method,
          params: params, // 60 seconds, may need to be hex, I forget
          id: new Date().getTime() // Id of the request; anything works, really
        }).timeout(10000);

        msg.payload = _.get(response, 'result', {});

        /*        msg.payload = await new Promise((res, rej) =>
         web3.currentProvider.sendAsync({
         jsonrpc: '2.0',
         method: method,
         params: params,
         id: new Date().getTime()
         }, (err, result) => {
         console.log(err, result);
         res();
         }));*/

        web3.currentProvider.connection.end();

        node.send(msg);
      } catch (e) {
        console.log(e);
        msg.payload = {};
        node.send(msg);
      }

    });
  }

  RED.nodes.registerType('web3', ExtractCall);
};
