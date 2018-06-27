const contracts = require('./smartContractsFactory'),
  _ = require('lodash');

module.exports = _.chain(contracts)
  .toPairs()
  .map(pair => _.chain(pair[1].networks).toPairs().get('0.1.events').value())
  .flattenDeep()
  .compact()
  .transform((result, ev) => _.merge(result, ev), {})
  .toPairs()
  .map(pair => {
    pair[1].signature = pair[0];
    return pair[1];
  })
  .value();