/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  generateAddress = require('../utils/address/generateAddress'),
  expect = require('chai').expect;

module.exports = (ctx) => {

  before(async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.blockModel.remove({});
    await models.txLogModel.remove({});
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  it('GET /tx/:hash when no tx in db - get null', async () => {

    const response = await request(`http://localhost:${config.rest.port}/tx/TXHASH`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response).to.equal(null);
  });

  it('GET /tx/:hash with non exist hash - get null', async () => {
    const hash = 'TESTHASH';
    const address = generateAddress();
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      from: address,
      to: generateAddress(),
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`http://localhost:${config.rest.port}/tx/BART`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response).to.equal(null);
  });

  it('GET /tx/:hash with exist hash (in db two txs) - get right tx', async () => {
    const hash = 'TESTHASH2';
    const fromAddress = generateAddress();
    const toAddress = generateAddress();

    await models.txModel.update({'_id': hash}, {
      from: fromAddress,
      to: toAddress,
      blockNumber: 5
    }, {upsert: true});

    await models.blockModel.update({'_id': 'dsfsdfsdf'}, {
      number: 5,
      timestamp: 11
    }, {upsert: true});


    await models.txModel.update({'_id': 'HASHES'}, {
      to: toAddress,
      from: fromAddress,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`http://localhost:${config.rest.port}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response).to.deep.equal({
      __v: 0,
      from: fromAddress,
      to: toAddress,
      blockNumber: 5,
      hash: hash,
      logs: [],
      timestamp: 11
    });
  });

  it('GET /tx/:addr/history when no tx in db - get []', async () => {
    const address = generateAddress();

    const response = await request(`http://localhost:${config.rest.port}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with non exist address - get []', async () => {
    const address = generateAddress();

    await models.txModel.update({'_id': 'HASHES'}, {
      recipient: generateAddress(),
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`http://localhost:${config.rest.port}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with exist address (in db two him txs and not him) - get right txs', async () => {
    const toAddress1 = generateAddress();
    const fromAddress1 = generateAddress();

    const toAddress2 = generateAddress();
    const fromAddress2 = generateAddress();

    const txs = [];
    txs[0] = await models.txModel.findOneAndUpdate({'_id': 'TEST1'}, {
      from: fromAddress1,
      to: toAddress1,
      timestamp: 1,
      blockNumber: 2
    }, {upsert: true, new: true});

    await models.txModel.update({'_id': 'HASHES'}, {
      to: toAddress2,
      from: fromAddress2,
      timestamp: 1,
      blockNumber: 2
    }, {upsert: true});

    txs[1] = await models.txModel.findOneAndUpdate({'_id': 'TEST2'}, {
      from: toAddress1,
      to: toAddress2,
      timestamp: 2,
      blockNumber: 3
    }, {upsert: true, new: true});

    await models.blockModel.update({'_id': 'dsfsdfsdf'}, {
      number: 3,
      timestamp: 31
    }, {upsert: true});

    await models.blockModel.update({'_id': '21312312'}, {
      number: 2,
      timestamp: 21
    }, {upsert: true});


    const response = await request(`http://localhost:${config.rest.port}/tx/${toAddress1}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response.length).to.equal(2);

    expect(response).to.deep.equal([
      {
        blockNumber: 3,
        from: toAddress1,
        to: toAddress2,
        confirmations: 1,
        hash: 'TEST2',
        logs: [],
        timestamp: 31000
      }, {
        to: toAddress1,
        from: fromAddress1,
        blockNumber: 2,
        confirmations: 2,
        hash: 'TEST1',
        logs: [],
        timestamp: 21000
      }
    ])
  });

};
