const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  smEvents = require('../../factories/sc/smartContractsEventsFactory');

const topicToArg = (topic, topicIndex) => {
  const bn = BigNumber(topic, 16);
  return {
    [`args.${topicIndex}.e`]: bn.e,
    [`args.${topicIndex}.c`]: bn.c
  }
};

function deepMap(obj, cb, keyPath) {

  let out = _.isArray(obj) ? [] : {};

  Object.keys(obj).forEach(k => {
    let val;

    if (obj[k] !== null && typeof obj[k] === 'object') {

      if (!keyPath) {
        val = deepMap(obj[k], cb, [k]);
      } else {
        keyPath.push(k);
        val = deepMap(obj[k], cb, keyPath);
        //console.log(keyPath);
        //console.log(val)
      }
    } else {
      let fullPath = [];
      fullPath.push(k);
      if (keyPath)
        fullPath.push(...keyPath);
      val = cb(obj[k], fullPath);
    }


    if (!_.isArray(obj) && _.isObject(val) && val.converted)
      return _.merge(out, val.arg);


    if (val.converted)
      val = val.arg;


    _.isArray(obj) ? out.push(val) :
      out[k] = val;
  });

  return out;
}

const converter = (eventName, query) => {

  eventName = eventName.toLowerCase();

  const event = _.find(smEvents, ev => ev.name.toLowerCase() === eventName);

  if (!event)
    return;

  let criteria = deepMap(query, (val, keyPath) => {

    let eventParamIndex = _.chain(keyPath)
      .reverse()
      .find(name => _.find(event.inputs, {name: name}))
      .thru(name => _.findIndex(event.inputs, {name: name}))
      .value();

    if (eventParamIndex === -1)
      return val;

    return {arg: topicToArg(val, eventParamIndex), converted: true};
  });

  criteria.signature = event.signature;

  return criteria;

};


module.exports = converter;