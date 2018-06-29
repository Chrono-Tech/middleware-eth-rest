const contracts = require('./smartContractsFactory'),
  _ = require('lodash');

module.exports =  _.chain(contracts)
  .toPairs()
  .map(pair=>pair[1].events)
  .transform((result, ev)=>_.merge(result, ev), {})
  .toPairs()
  .map(pair=>{
    let event = pair[1];
    event.signature = pair[0];
    return event;
  })
  .value();