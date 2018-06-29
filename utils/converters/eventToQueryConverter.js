const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  smEvents = require('../../factories/sc/smartContractsEventsFactory');

module.exports = (eventName, query) => {

  eventName = eventName.toLowerCase();

  console.log(eventName);
  const event = _.find(smEvents, ev => ev.name.toLowerCase() === eventName);

  console.log(event);
  if (!event)
    return;

  return _.chain(query)
    .toPairs()
    .map(pair => {
      let eventParamIndex = _.findIndex(event.inputs, {name: pair[0]});
      if (eventParamIndex === -1)
        return;

      const bn = BigNumber(pair[1], 16);
      return {
        [`args.${eventParamIndex}.e`]: bn.e,
        [`args.${eventParamIndex}.c`]: bn.c
      }
    })
    .transform((result, criteria) => _.merge(result, criteria), {})
    .thru(criteria => {
      criteria.signature = event.signature;
      return criteria;
    })
    .value();


};
