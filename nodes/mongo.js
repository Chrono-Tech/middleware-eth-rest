const mongoose = require('mongoose'),
  vm = require('vm');

module.exports = function (RED) {

  async function query (type, modelName, query) {

    if (type === '0')
      return await mongoose.models[modelName].find(query);
    if (type === '1')
      return await new mongoose.models[modelName](query).save();
    if (type === '2')
      return await mongoose.models[modelName].update(...query);
    if (type === '3')
      return await mongoose.models[modelName].remove(query);
    if (type === '4')
      return await mongoose.models[modelName].aggregate(query);

    return [];
  }

  function MongoCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      let models = mongoose.modelNames();
      let modelName = redConfig.mode === '1' ? msg.payload.model : redConfig.model;

      if (!models.includes(modelName)) {
        msg.payload = [];
        return node.send(msg);
      }

      if (redConfig.mode === '0') {
        const script = new vm.Script(`(()=>(${redConfig.request}))()`);
        const context = vm.createContext({});
        msg.payload = script.runInContext(context);
      }

      msg.payload = await query(redConfig.requestType, modelName, msg.payload.request);
      node.send(msg);
    });
  }

  RED.nodes.registerType('mongo', MongoCall);
};