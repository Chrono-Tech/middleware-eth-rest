const mongoose = require('mongoose'),
  _ = require('lodash'),
  vm = require('vm');

module.exports = function (RED) {

  async function query (type, modelName, query, options, dbAlias) {

    let connection = mongoose[dbAlias] || mongoose.accounts;

    if (type === '0')
      return await connection.models[modelName].find(query)
        .sort(_.get(options, 'sort'))
        .skip(_.get(options, 'skip'))
        .limit(_.get(options, 'limit'));
    if (type === '1')
      return await new connection.models[modelName](query).save();
    if (type === '2')
      return await connection.models[modelName].update(...query);
    if (type === '3')
      return await connection.models[modelName].remove(query);
    if (type === '4')
      return await connection.models[modelName].aggregate(query);

    return [];
  }

  function MongoCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      let models = (mongoose[redConfig.dbAlias] || mongoose.accounts).modelNames();
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

        msg.payload = JSON.parse(JSON.stringify(await query(redConfig.requestType, origName, msg.payload.request, msg.payload.options, redConfig.dbAlias)));

        node.send(msg);
      } catch (err) {
        this.error(JSON.stringify(err), msg);
      }

    });
  }

  RED.nodes.registerType('mongo', MongoCall);
};
