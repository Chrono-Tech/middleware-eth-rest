const contractsFactory = require('./smartContractsFactory'),
  _ = require('lodash'),
  requireAll = require('require-all'),
  fs = require('fs');


module.exports = scPath => {

  const contracts = contractsFactory(scPath);
  let contractsRaw = {};

  if (fs.existsSync(scPath))
    contractsRaw = requireAll({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
      dirname: scPath,
      filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/
    });

  let truffleContractEvents = _.chain(contracts)
    .toPairs()
    .map(pair => pair[1].events)
    .transform((result, ev) => _.merge(result, ev), {})
    .toPairs()
    .map(pair => {
      let event = pair[1];
      event.signature = pair[0];
      return event;
    })
    .value();


  let rawContractEvents = _.chain(contractsRaw)
    .map(contract =>
      _.chain(contract.networks)
        .values()
        .map(network => network.events)
        .flattenDeep()
        .values()
        .transform((result, item) => _.merge(result, item), {})
        .toPairs()
        .map(pair => {
          pair[1].signature = pair[0];
          return pair[1];
        })
        .value()
    )
    .flattenDeep()
    .value();


  return _.chain(truffleContractEvents)
    .union(rawContractEvents)
    .uniqBy('signature')
    .value();
};
