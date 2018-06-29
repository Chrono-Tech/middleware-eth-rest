const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  smEvents = require('../../factories/sc/smartContractsEventsFactory');

const getTopic = arg => {
  let bn = BigNumber();
  bn.s = 1;
  bn.c = arg.c;
  bn.e = arg.e;
  let topic = bn.toString(16);
  while (topic.length < 64)
    topic = '0' + topic;
  return '0x' + topic;
};


module.exports = (eventName, queryResults) => {

  const event = _.find(smEvents, ev => ev.name.toLowerCase() === eventName.toLowerCase());

  if (!event)
    return;

  return queryResults.map(item =>
    _.chain(item.args)
      .map((arg, index) => {

        const definition = event.inputs[index];

        if (!definition)
          return {};

        let value = getTopic(arg);

        if (new RegExp(/uint/).test(definition.type))
          value = BigNumber(value, 16).toString();

        return {[definition.name]: value};

      })
      .transform((result, value) => _.merge(result, value), {})
      .merge({
        event: event.name

      })
      .value()
  )

};
