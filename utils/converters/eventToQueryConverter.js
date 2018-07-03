const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  smEvents = require('../../factories/sc/smartContractsEventsFactory');

const topicToArg = (topic, topicIndex) => {
  const bn = BigNumber(topic, 16);
  return {
    e: bn.e,
    c: bn.c,
    index: topicIndex
  }
};

function deepMap(obj, cb, keyPath) {

  let out = _.isArray(obj) ? [] : {};
  let argNotFound = false;

  Object.keys(obj).forEach(k => {

    if (argNotFound)
      return;

    let val;

    if (obj[k] !== null && typeof obj[k] === 'object') {

      if (!keyPath) {
        val = deepMap(obj[k], cb, [k]);
      } else {
        keyPath.push(k);
        val = deepMap(obj[k], cb, keyPath);
      }
    } else {
      let fullPath = [];
      fullPath.push(k);
      if (keyPath)
        fullPath.push(...keyPath);
      val = cb(obj[k], fullPath);

      if (_.find(fullPath, key => key.indexOf('$') === 0) && val.converted) {
        val = {args: {$elemMatch: val.arg}};
      }
    }


    if (!keyPath && _.find(Object.keys(obj[k]), key => key.indexOf('$') === 0)) { //todo
      let data = cb('', [k]);
      if (!data.arg) {
        argNotFound = true;
        return;
      }
    }


    if (!_.isArray(obj) && _.isObject(val) && val.converted) {
      if (!out.$and)
        out.$and = [];
      out.$and.push({args: {$elemMatch: val.arg}});
      return;
    }

    _.isArray(obj) ? out.push(val) :
      out[k] = val;
  });

  return argNotFound ? null : out;
}

function replace(criteria) {

  let paths = _.chain(criteria).keys()
    .filter(key =>
      key.indexOf('$') === 0 || _.chain(criteria[key]).keys().find(nestedKey => nestedKey.indexOf('$') === 0).value()
    )
    .value();

  return _.transform(paths, (result, path) => {

    if (criteria[path].$in) {

      if (!result.$or)
        result.$or = [];

      result.$or.push(...result[path].$in);
      delete result[path];
      return;
    }


    if (criteria[path].$nin || criteria[path].$ne) {

      if (!result.$and)
        result.$and = [];

      let subQuery = _.chain(criteria[path].$nin || [criteria[path].$ne])
        .map(item => {

          if (!item.args)
            return item;

          item.args.$elemMatch.e = {$ne: item.args.$elemMatch.e};
          item.args.$elemMatch.c = {$ne: item.args.$elemMatch.c};
          item.args.$elemMatch.index = {$ne: item.args.$elemMatch.index};

          return item;
        })
        .value();

      result.$and.push(...subQuery);
      delete result[path];
      return;
    }

    if (path === '$or') {

      criteria.$or = _.chain(criteria.$or)
        .map(item => {
          let pair = _.toPairs(item)[0];

          if (!pair[1].args) {
            return _.fromPairs([pair]);
          }


          return pair[1];
        })
        .value()

    }


  }, criteria);
}


const converter = (eventName, query) => {

  eventName = eventName.toLowerCase();

  const eventDefinitions = _.filter(smEvents, ev => ev.name.toLowerCase() === eventName);

  if (!eventDefinitions.length)
    return;


  let finalQuery = _.chain(eventDefinitions)
    .map(event => {
      let criteria = deepMap(query, (val, keyPath) => {

        let eventParamIndex = _.chain(keyPath)
          .reverse()
          .find(name => _.find(event.inputs, {name: name}))
          .thru(name => _.findIndex(event.inputs, {name: name}))
          .value();

        if (eventParamIndex === -1)
          return val;

        let input = event.inputs[eventParamIndex];

        if (input.indexed) {
          let shiftedIndex = _.chain(event.inputs)
            .take(eventParamIndex)
            .filter({indexed: false})
            .size()
            .value();


          eventParamIndex = eventParamIndex - shiftedIndex;

        } else {
          let shiftedIndex = _.chain(event.inputs)
            .filter({indexed: true})
            .size()
            .value();

          let origIndex = _.chain(event.inputs)
            .filter({indexed: false})
            .findIndex({name: input.name})
            .value();

          eventParamIndex = shiftedIndex + origIndex
        }


        return {arg: topicToArg(val, eventParamIndex), converted: true};
      });

      if (criteria)
        criteria.signature = event.signature;

      return criteria;
    })
    .filter(criteria => criteria)
    .map(criteria => replace(criteria))
    .value();

  return finalQuery.length > 1 ? {$or: finalQuery} : finalQuery[0];

};


module.exports = converter;