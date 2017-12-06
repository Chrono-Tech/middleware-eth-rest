const Promise = require('bluebird'),
  _ = require('lodash'),
  config = require('../config');

module.exports = function (RED) {
  function ExtractCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      let method = redConfig.mode === '1' ? _.get(msg, 'payload.method', '') : redConfig.method;
      let params = redConfig.mode === '1' ? _.get(msg, 'payload.params', []) : redConfig.params;

      try {
        let response = await Promise.promisify(config.nodered.functionGlobalContext.web3.currentProvider.sendAsync)
          .bind(config.nodered.functionGlobalContext.web3.currentProvider)({
            jsonrpc: '2.0',
            method: method,
            params: params, // 60 seconds, may need to be hex, I forget
            id: new Date().getTime() // Id of the request; anything works, really
          }).timeout(10000);

        msg.payload = _.get(response, 'result', {});

        node.send(msg);
      } catch (err) {
        this.error(JSON.stringify(err), msg);
      }
    });
  }

  RED.nodes.registerType('web3', ExtractCall);
};
