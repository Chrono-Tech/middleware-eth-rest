const q2m = require('query-to-mongo');

module.exports = function (RED) {
  function Q2mCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      msg.payload = q2m(redConfig.request_type === '0' ? msg.req.query : msg.payload);
      node.send(msg);
    });
  }

  RED.nodes.registerType('query-to-mongo', Q2mCall);
};
