const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  smEventsFactory = require('../../factories/sc/smartContractsEventsFactory');

let schemaFields = ['blockNumber', 'txIndex', 'index', 'signature'];

const topicToArg = (topic, topicIndex) => {
  const bn = BigNumber(topic, 16);
  return {
    c: bn.c,
    index: topicIndex
  };
};

function deepMap(obj, cb, keyPath) {

  let out = _.isArray(obj) ? [] : {};
  let argNotFound = false;

  Object.keys(obj).forEach(k => {

    if (argNotFound)
      return;

    let val;

    if (obj[k] !== null && typeof obj[k] === 'object')

      if (!keyPath) {
        val = deepMap(obj[k], cb, [k]);
      } else if (parseInt(k) >= 0) {

        let childPath = [k];
        keyPath.push(childPath);
        val = deepMap(obj[k], cb, keyPath);

      } else if (_.isArray(_.last(keyPath))) {

        const childPath = _.last(keyPath);
        childPath.push(k);
        val = deepMap(obj[k], cb, childPath);

      } else {
        keyPath.push(k);
        val = deepMap(obj[k], cb, keyPath);
      } else {
      let fullPath = [];
      fullPath.push(k);
      if (keyPath)
        fullPath.push(...keyPath);
      val = cb(obj[k], fullPath);

      if (_.isObject(val) && _.find(fullPath, key => key.indexOf('$') === 0) && val.converted)
        val = {args: {$elemMatch: val.arg}};

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

    if (path === '$and')
      return criteria[path].map(item => replace(item));


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

          item.args.$elemMatch.c = {$ne: item.args.$elemMatch.c};

          return item;
        })
        .value();

      result.$and.push(...subQuery);
      delete result[path];
      return;
    }

    if (path === '$or')
      criteria.$or = _.chain(criteria.$or)
        .map(item => {
          return _.chain(item).toPairs()
            .map(pair => {

              if (!pair[1].args) {

                if(!schemaFields.includes(pair[0]))
                  return replace(_.fromPairs([pair]));

                return _.fromPairs([pair]);
              }

              return pair[1];
            })
            .transform((result, data) => {
              _.merge(result, data)
            }, {})
            .value()
        })
        .value();


  }, criteria);
}


const converter = (smEvents, eventName, query, useSchemaFields = true) => {

  eventName = eventName.toLowerCase();

  const eventDefinitions = _.filter(smEvents, ev => ev.name.toLowerCase() === eventName);

  if (!eventDefinitions.length)
    return;


  let finalQuery = _.chain(eventDefinitions)
    .map(event => {
      let criteria = deepMap(query, (val, keyPath) => {

        let reverseKeyPath = _.reverse(keyPath);

        let isSchemaField = _.chain(reverseKeyPath)
          .find(key => schemaFields.includes(key))
          .thru(key => !!key)
          .value();

        if (isSchemaField)
          return val;

        let eventParamIndex = _.chain(reverseKeyPath)
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

          eventParamIndex = shiftedIndex + origIndex;
        }


        return {arg: topicToArg(val, eventParamIndex), converted: true};
      });

      if (criteria) {
        criteria.signature = event.signature;
      }
      return criteria;
    })
    .filter(criteria => criteria)
    .map(criteria => replace(criteria))
    .value();

  return finalQuery.length > 1 ? {$or: finalQuery} : finalQuery[0];

};


module.exports = (smPath)=>{
  const smEvents = smEventsFactory(smPath);
  return converter.bind(this, smEvents);
};
