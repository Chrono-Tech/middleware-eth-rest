const mongoose = require('mongoose'),
  _ = require('lodash'),
  vm = require('vm');

module.exports = function (RED) {

  async function query (type, model, query, options) {

    if (type === '0')
      return await model.find(query)
        .sort(_.get(options, 'sort'))
        .skip(_.get(options, 'skip'))
        .limit(_.get(options, 'limit'));
    if (type === '1')
      return await new model(query).save();
    if (type === '2')
      return await model.update(...query);
    if (type === '3')
      return await model.remove(query);
    if (type === '4')
      return await model.aggregate(query);

    return [];
  }

  function MongoCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;

    const connection = _.get(node.context().global,`connections.${redConfig.dbAlias}`) || mongoose;

    this.on('input', async function (msg) {

      let models = (connection).modelNames();
      let modelName = redConfig.mode === '1' ? msg.payload.model : redConfig.model;
      let origName = _.find(models, m => m.toLowerCase() === modelName.toLowerCase());

      if (!origName) {
        msg.payload = [];
        return node.send(msg);
      }

      try {
        if (redConfig.mode === '0') {
          const scriptRequest = new vm.Script(`(()=>(${redConfig.request}))()`);
          const contextRequest = vm.createContext({});
          msg.payload.request = scriptRequest.runInContext(contextRequest);

          const scriptOptions = new vm.Script(`(()=>(${redConfig.options}))()`);
          const contextOptions = vm.createContext({});
          msg.payload.options = scriptOptions.runInContext(contextOptions);
        }

        const result = await query(redConfig.requestType, connection.models[origName], msg.payload.request, msg.payload.options);
        msg.payload = JSON.parse(JSON.stringify(result));

        node.send(msg);
      } catch (err) {
        this.error(JSON.stringify(err.toString()), msg);
      }

    });
  }

  RED.nodes.registerType('mongo', MongoCall);
};
