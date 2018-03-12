/**
 * Load all events for smartContracts, output models
 * @module utils/generateSMEvents
 * @requires truffle-contract
 */

const _ = require('lodash'),
  requireAll = require('require-all'),
  config = require('../config'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  contract = require('truffle-contract');

let contracts = {};
if (fs.existsSync(config.smartContracts.path))
  contracts = requireAll({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
    dirname: config.smartContracts.path,
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/,
    resolve: Contract => contract(Contract)
  });

module.exports = () => {

  return _.chain(contracts)
    .toPairs()
    .map(pair => pair[1].events)
    .transform((result, ev) => _.merge(result, ev))
    .toPairs()
    .map(pair => ({
      address: pair[0],
      inputs: pair[1].inputs,
      name: pair[1].name
    }))
    .groupBy('name')
    .map(ev => ({
        name: ev[0].name,
        inputs: _.chain(ev)
          .map(ev => ev.inputs)
          .flattenDeep()
          .uniqBy('name')
          .value()
      })
    )
    .transform((result, ev) => { //build mongo model, based on event definition from abi
      result[ev.name] = mongoose.data.model(ev.name, new mongoose.Schema(
        _.chain(ev.inputs)
          .transform((result, obj) => {
            result[obj.name] = {
              type: new RegExp(/uint/).test(obj.type) ?
                Number : mongoose.Schema.Types.Mixed
            };
          }, {})
          .merge({
            controlIndexHash: {type: String, unique: true, required: true},
            network: {type: String},
            created: {type: Date, required: true, default: Date.now}
          })
          .value()
      ));
    }, {})
    .value();
};
