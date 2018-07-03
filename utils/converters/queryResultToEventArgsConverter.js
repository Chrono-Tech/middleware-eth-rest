const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  smEvents = require('../../factories/sc/smartContractsEventsFactory');

const getTopic = arg => {
  let bn = BigNumber();
  bn.s = 1;
  bn.c = arg.c;
  bn.e = arg.e;
  let topic = bn.toString(16);
  while (topic.length < 40)
    topic = '0' + topic;
  return '0x' + topic;
};


module.exports = (eventName, queryResults) => {

  const signatures = _.chain(queryResults)
    .map(result => result.signature)
    .uniq()
    .value();

  const eventDefinitions = _.filter(smEvents, event => signatures.indexOf(event.signature) !== -1);

  if (!eventDefinitions.length)
    return;

  let eventsMap = _.transform(eventDefinitions, (result, event) => {
    result[event.signature] = event;
  }, {});

  let indexedInputs = _.transform(eventDefinitions, (result, event) => {
    result[event.signature] = _.filter(event.inputs, {indexed: true});
  }, {});

  let indexedMap = _.transform(eventDefinitions, (result, event) => {

    result[event.signature] = _.chain(event.inputs)
      .transform((result, item, index) => {

        if (item.indexed) {
          let origIndex = _.findIndex(indexedInputs[event.signature], item);
          result[origIndex] = index
        } else {
          let origIndex = _.chain(event.inputs)
            .filter({indexed: false})
            .findIndex(item)
            .value() + indexedInputs[event.signature].length;

          result[origIndex] = index;
        }

      }, {})
      .value();
  }, {});

  console.log(indexedMap)

  return queryResults.map(item =>
    _.chain(item.args)
      .map((arg, index) => {

        let topicIndex = indexedMap[item.signature][index];


        const definition = eventsMap[item.signature].inputs[topicIndex];

        if (!definition)
          return {};

        let value = getTopic(arg);

        if (new RegExp(/uint/).test(definition.type))
          value = BigNumber(value, 16);

        return {[definition.name]: value};

      })
      .transform((result, value) => _.merge(result, value), {})
      .merge({
        event: eventsMap[item.signature].name,
        includedIn: {
          blockNumber: item.blockNumber,
          txIndex: item.txIndex,
          logIndex: item.index
        }
      })
      .value()
  )

};
