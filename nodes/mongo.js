const _ = require('lodash'),
  mongoose = require('mongoose'),
  vm = require('vm');

module.exports = function (RED) {
  function MongoCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      let models = mongoose.modelNames();

      if (!models.includes(redConfig.model)) {
        msg.payload = [];
        return node.send(msg);
      }

      try {
        if (!msg.payload.request) {
          const script = new vm.Script(`(()=>(${redConfig.request}))()`);
          const context = vm.createContext({});
          let request = script.runInContext(context);
          msg.payload = await mongoose.models[redConfig.model].find(request);
        } else {
//          console.log(msg.payload.request);

          let keys = Object.keys(mongoose.models[redConfig.model].schema.paths);

          msg.payload = await mongoose.models[redConfig.model].find(_.pick(msg.payload.request, keys));
        }

        node.send(msg);
      } catch (e) {
        msg.payload = [];
        node.send(msg);
      }
    });
  }

  RED.nodes.registerType('mongo', MongoCall);
};
