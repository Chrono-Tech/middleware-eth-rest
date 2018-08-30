/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const expect = require('chai').expect,
  converterGen = require('../../../../utils/converters/queryResultToEventArgsConverter'),
  config = require('../../../config'),
  _ = require('lodash');

let converter, events;

const getEventName = (signature) => {
  return _.chain(events)
    .filter(e => e.signature === signature)
    .value()[0]
    .name;
};

module.exports = (ctx) => {

  before(() => {
    converter = config.nodered.functionGlobalContext.libs.utils.converters.queryResultToEventArgsConverter;
    events = config.nodered.functionGlobalContext.factories.smEvents;
  });

   it('converterGen/call result without args -  get []', async () => {
     const query = converterGen('../../../factories/sc');
     expect(query).instanceof(Function);
     expect(query()).deep.equal([]);
   });
  
   it('converterGen/call result with empty arg - get []', async () => {
     const query = converterGen('../../../factories/sc');
     expect(query('', {'abba': 1})).deep.equal([]);
   });
  
   it('conveterGen/call converter on empty folder and call function with unknown arg - get []', async () => {
     const query = converterGen('../../../factories/sc');
     expect(query('sdfsdf', {})).deep.equal([]);
   });
  
 
   it('call converter on need folder and call function with unknown arg - get []', async () => {
     expect(converter('sdfsdf', {})).deep.equal([]);
   });
  
   it('call converter with eventName[three inputs] for queryResults with one event - get query with single event', async () => {
     const results = [{
        "_id": "528e29c548c70d8664912c3a6859848a",
        "blockNumber": 52029,
        "args": [
        {
          "c": [
            3504236,
            38008414681332,
            57102714686289,
            26409051406575,
            97163811036575,
            37481018966016
          ],
          "e": 76
        }
      ],
        "txIndex": 0,
        "index": 0,
        "signature": "0x360225f74eacd06eefedf821b89c21c7c975b645503e5198c6a60a62f84e302b",
        "address": "0x5564886ca2c518d1964e5fcea4f423b41db9f561"
    }];

    const eventName = getEventName(results[0].signature);

    const response = converter(eventName, results);
    expect(response.length).to.equal(1);
    expect(response[0]).deep.equal({
      isAdded: "0x4d794669727374436f696e000000000000000000000000000000000000000000",
      event: {
        name: "SharesWhiteListChanged",
        signature: '0x360225f74eacd06eefedf821b89c21c7c975b645503e5198c6a60a62f84e302b'
      },
      includedIn: { blockNumber: 52029, txIndex: 0, logIndex: 0 }
    });
  });

  it('call converter with eventName[one inputs] for queryResults with two different events - get query with single event', async () => {
    const results = [{
      "_id": "528e29c548c70d8664912c3a6859848a",
      "blockNumber": 52029,
      "args": [{
        "c": [
          3504236,
          38008414681332,
          57102714686289,
          26409051406575,
          97163811036575,
          37481018966016
        ],
        "e": 76
      }],
      "txIndex": 0,
      "index": 0,
      "signature": "0xf4b5d7970f8d26d7e8c6b74e8ffad0e1b0f67bc7f92238bd7efd485731eceafa",
      "address": "0x5564886ca2c518d1964e5fcea4f423b41db9f561"
  }, {
      "_id": "93e506e1ce03874f41c7f22379da11aa",
      "blockNumber": 52043,
      "args": [{
        "c": [
          3504236,
          38008414681332,
          57102714686289,
          26409051406575,
          97163811036575,
          37481018966016
        ],
        "e": 76
      }, {
        "c": [
          348413,
          67610897191255,
          91749081009724,
          6029277031469
        ],
        "e": 47
      }],
      "txIndex": 0,
      "index": 0,
      "signature": "0xf63780e752c6a54a94fc52715dbc5518a3b4c3c2833d301a204226548a2a8545",
      "address": "0x5564886ca2c518d1964e5fcea4f423b41db9f561"
    }];

    const eventName = getEventName(results[0].signature);

    const response = converter(eventName, results);
    expect(response.length).to.equal(1);
    expect(response[0]).deep.equal({
        listener: "0x4d794669727374436f696e000000000000000000000000000000000000000000",
        event: {
          name: 'ListenerAdded',
          signature: '0xf4b5d7970f8d26d7e8c6b74e8ffad0e1b0f67bc7f92238bd7efd485731eceafa'
        },
        includedIn: { blockNumber: 52029, txIndex: 0, logIndex: 0 }
    });
  });
};
