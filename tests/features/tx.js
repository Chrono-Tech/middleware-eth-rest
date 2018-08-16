/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  url = 'http://localhost:8081';


const generateAddress  = (name) => name.concat('z'.repeat(40-name.length)).toLowerCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }

module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.blockModel.remove({});
    await models.txLogModel.remove({});
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  it('GET /tx/:hash when no tx in db - get null', async () => {
    const response = await request(`${url}/tx/TXHASH`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal(null);
  });

  it('GET /tx/:hash with non exist hash - get null', async () => {
    const hash = 'TESTHASH';
    const address = generateAddress('ffff');
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      from: address,
      to: generateAddress('ffff1'),
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${url}/tx/BART`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal(null);
  });

  it('GET /tx/:hash with exist hash (in db two txs) - get right tx', async () => {
    const hash = 'TESTHASH2';
    const address = generateAddress('ffff');
    const tx = await models.txModel.findOneAndUpdate({'_id': hash}, {
      from: address,
      to: generateAddress('ffff1'),
      blockNumber: 5
    }, {upsert: true, new: true});
    await models.blockModel.findOneAndUpdate({'_id': 'dsfsdfsdf'}, {
      number: 5,
      timestamp: 11
    }, {upsert: true, new: true});
  
    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      to: address,
      from: generateAddress('ffff1'),
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true, new: true});

    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);

    expect(response).to.deep.equal({
      "__v": 0,
      'from':address,
      'to': generateAddress('ffff1'),
      'blockNumber': 5,
      'hash': hash,
      "logs": [],
      'timestamp': 11
    });
  });



  it('GET /tx/:addr/history when no tx in db - get []', async () => {
    const address = generateAddress('ffff');
    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with non exist address - get []', async () => {
    const address = generateAddress('ffff');
    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      recipient: generateAddress('ffff2'),
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with exist address (in db two him txs and not him) - get right txs', async () => {
    const address = generateAddress('ffff');
    const txs = [];
    txs[0] = await models.txModel.findOneAndUpdate({'_id': 'TEST1'}, {
      from: generateAddress('ffff1'),
      to: address,
      timestamp: 1,
      blockNumber: 2
    }, {upsert: true, new: true});

    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      to: generateAddress('ffff2'),
      from: generateAddress('ffff2'),
      timestamp: 1,
      blockNumber: 2
    }, {upsert: true});

    txs[1] = await models.txModel.findOneAndUpdate({'_id': 'TEST2'}, {
      from: address,
      to: generateAddress('ffff1'),
      timestamp: 2,
      blockNumber: 3
    }, {upsert: true, new: true});

    await models.blockModel.findOneAndUpdate({'_id': 'dsfsdfsdf'}, {
      number: 3,
      timestamp: 31
    }, {upsert: true, new: true});
    await models.blockModel.findOneAndUpdate({'_id': '21312312'}, {
      number: 2,
      timestamp: 21
    }, {upsert: true, new: true});



    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response.length).to.equal(2);
  
    expect(response).to.deep.equal([
      {
        blockNumber: 3,
        from: address,
        to:  generateAddress('ffff1'),
        confirmations: 1,
        hash: 'TEST2',
        logs: [],
        timestamp: 31000
      }, {
        to: address,
        from: generateAddress('ffff1'),
        blockNumber: 2,
        confirmations: 2,
        hash: 'TEST1',
        logs: [],
        timestamp: 21000
      }
    ])
  });

};
