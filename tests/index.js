/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv/config');

process.env.USE_MONGO_DATA = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('../config'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  expect = require('chai').expect,
  _ = require('lodash'),
  require_all = require('require-all'),
  contract = require('truffle-contract');

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);
mongoose.data = mongoose.createConnection(config.mongo.data.uri);

const Web3 = require('web3'),
  web3 = new Web3(),
  clearMongoAccounts = require('./helpers/clearMongoAccounts'),
  clearQueues = require('./helpers/clearQueues'),
  saveAccountForAddress = require('./helpers/saveAccountForAddress'),
  getAccountFromMongo = require('./helpers/getAccountFromMongo'),
  request = require('request'),
  net = require('net'),
  moment = require('moment'),
  amqp = require('amqplib'),
  smEvents = require('../utils/generateSMEvents')(),
  createTestEvents = require('./helpers/createTestEvents'),
  getEventFromSmEvents = require('./helpers/getEventFromSmEvents');

let accounts, testEvModel, amqpInstance;

describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  before(async () => {
    amqpInstance = await amqp.connect(config.rabbit.url);
    await clearQueues(amqpInstance);

    let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
    web3.setProvider(provider);

    accounts = await Promise.promisify(web3.eth.getAccounts)();
    await clearMongoAccounts();
    await saveAccountForAddress(accounts[0]);

    testEvModel = getEventFromSmEvents(smEvents, 5);
    await testEvModel.remove();
    await createTestEvents(testEvModel);
  });

  after(async () => {
    await clearMongoAccounts();
    await testEvModel.remove();

    web3.currentProvider.connection.end();
    return mongoose.disconnect();
  });

  afterEach(async () => {
    await clearQueues(amqpInstance);
  });

  it('validate all event routes', async () => {
    await Promise.all(
      _.map(smEvents, (model, name) =>
        new Promise((res, rej) => {
          request(`http://localhost:${config.rest.port}/events/${name}`, (err, resp) => {
            err || resp.statusCode !== 200 ? rej(err || resp) : res()
          })
        })
      )
    );
  });

  it('address/create from post request', async () => {
    const newAddress = `0x${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;
    accounts.push(newAddress);

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/`,
        method: 'POST',
        json: {address: newAddress}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        const account = await getAccountFromMongo(newAddress);
        expect(account).not.to.be.null;
        expect(account.isActive).to.be.true;
        expect(account.balance.toNumber()).to.be.equal(0);
        res();
      });
    });
  });

  it('address/create from rabbit mq', async () => {
    const newAddress = `0x${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;
    accounts.push(newAddress);

    const channel = await amqpInstance.createChannel();
    const info = {address: newAddress};
    await channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify(info)));

    await Promise.delay(3000);

    const account = await getAccountFromMongo(newAddress);
    expect(account).not.to.be.null;
    expect(account.isActive).to.be.true;
    expect(account.balance.toNumber()).to.be.equal(0);
  });

  it('address/update balance address by amqp', async () => {
    const channel = await amqpInstance.createChannel();
    const info = {address: accounts[0]};
    await channel.publish('events', `${config.rabbit.serviceName}.account.balance`, new Buffer(JSON.stringify(info)));

    await Promise.delay(3000);

    const account = await getAccountFromMongo(accounts[0]);
    expect(account).not.to.be.null;
    expect(account.balance.toNumber()).to.be.greaterThan(0);
  });

  it('address/remove by rest', async () => {
    const removeAddress = _.pullAt(accounts, accounts.length - 1)[0];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/`,
        method: 'DELETE',
        json: {address: removeAddress}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) {
          return rej(err || resp);
        }
        const account = await getAccountFromMongo(removeAddress);
        expect(account).not.to.be.null;
        expect(account.isActive).to.be.false;
        res();
      });
    });
  });

  it('address/remove from rabbit mq', async () => {
    const removeAddress = _.pullAt(accounts, accounts.length - 1)[0];

    const channel = await amqpInstance.createChannel();
    const info = {address: removeAddress};
    await channel.publish('events', `${config.rabbit.serviceName}.account.delete`, new Buffer(JSON.stringify(info)));

    await Promise.delay(3000);

    const account = await getAccountFromMongo(removeAddress);
    expect(account).not.to.be.null;
    expect(account.isActive).to.be.false;
  });

  const tokenForErc20 = `0x${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;

  it('address/add erc20 by rest for right', async () => {
    const address = accounts[0];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${address}/token`,
        method: 'POST',
        json: {erc20tokens: [tokenForErc20]}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        const account = await getAccountFromMongo(address);
        expect(account.erc20token[tokenForErc20]).to.be.equal(0);
        res();
      });
    });
  });

  it('address/add erc20 by rest for error', async () => {
    const address = accounts[1];
    const token = `0x${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${address}/token`,
        method: 'POST',
        json: {erc20tokens: token}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        expect(resp.body.code).to.be.equal(0);
        expect(resp.body.message).to.be.equal('fail');
        res();
      });
    });
  });

  it('address/remove erc20 by rest for right', async () => {
    const address = accounts[0];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${address}/token`,
        method: 'DELETE',
        json: {erc20tokens: [tokenForErc20]}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        const account = await getAccountFromMongo(address);
        expect(account.erc20token[tokenForErc20]).to.be.undefined;
        res();
      });
    });
  });

  it('address/remove erc20 by rest for error', async () => {
    const address = accounts[1];
    const token = `0x${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${address}/token`,
        method: 'DELETE',
        json: {erc20tokens: token}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        expect(resp.body.code).to.be.equal(0);
        expect(resp.body.message).to.be.equal('fail');
        res();
      });
    });
  });

  it('address/balance by rest', async () => {
    const address = accounts[0];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${address}/balance`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        const body = JSON.parse(resp.body);
        expect(body.balance).to.be.not.undefined;
        expect(body.erc20token).to.be.empty;
        res();
      });
    });
  });

  let exampleTransactionHash;

  it('GET tx/:addr/history for some query params and one right transaction [0 => 1]', async () => {
    const address = accounts[0];

    exampleTransactionHash = await Promise.promisify(web3.eth.sendTransaction)({
      from: accounts[0],
      to: accounts[1],
      value: 10
    });

    await Promise.delay(30000);

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/tx/${address}/history?limit=1`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        try {
          expect(resp.body).to.not.be.empty;
          const body = JSON.parse(resp.body);
          expect(body).to.be.an('array').not.empty;

          const respTx = body[0];
          expect(respTx.to).to.equal(accounts[1]);
          expect(respTx.from).to.equal(accounts[0]);
          expect(respTx).to.contain.all.keys(['hash', 'blockNumber', 'timestamp']);
          res();
        } catch (e) {
          rej(e || resp);
        }
      });
    });
  });

  it('GET tx/:addr/history for non exist', async () => {
    const address = accounts[3];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/tx/${address}/history`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        const body = resp.body;
        expect(body).to.be.equal('[]');
        res();
      });
    });
  });

  it('GET tx/:hash for transaction [0 => 1]', async () => {
    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/tx/${exampleTransactionHash}`,
        method: 'GET',
      }, (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);

        const respTx = JSON.parse(resp.body);
        expect(respTx).to.contain.all.keys(['to', 'from', 'hash', 'blockNumber']);
        res();
      });
    });
  });

  it('GET events/:name - check routes for all events by name event', () =>
    Promise.all(
      _.map(smEvents, (model, name) =>
        new Promise((res, rej) => {
          request(`http://localhost:${config.rest.port}/events/${name}`, (err, resp) =>
            err || resp.statusCode !== 200 ? rej(err || resp) : res()
          );
        })
      )
    )
  );

  it('GET events - check all events', async () => {
    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events`,
        method: 'GET'
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) {
          return rej(err || resp)
        }
        const body = JSON.parse(resp.body);
        expect(body).to.be.an('array');
        expect(body).to.length.greaterThan(1);
        res();
      });
    });
  });

  it('GET events/:name - check query language - empty results', async () => {

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events/bla-bla`,
        method: 'GET'
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) {
          return rej(err || resp)
        }
        const body = JSON.parse(resp.body);
        expect(body).to.be.empty;
        res();
      });
    });
  });

  it('GET events/:name - check query language - get some  results', async () => {
    const query = `created>${moment().add(-1, 'hours').toISOString()}&` +
      `limit=2&sort=_id&offset=1`

    return await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events/${testEvModel.modelName}?${query}`,
        method: 'GET'
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) {
          return rej(err || resp)
        }
        const body = JSON.parse(resp.body);
        expect(body).to.be.an('array');
        expect(body.length).to.equal(2);

        const eventOne = body[0];
        expect(eventOne.controlIndexHash).to.equal('647');
        expect(eventOne).has.contain.keys([
          'created', 'controlIndexHash'
        ]);

        const eventTwo = body[1];
        expect(eventTwo.controlIndexHash).to.equal('648');
        expect(eventTwo).has.contain.keys([
          'created', 'controlIndexHash'
        ]);

        res();
      });
    });
  });

  it('GET events/:name - check query language - get one result', async () => {

    const query = `controlIndexHash=647`;

    return await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events/${testEvModel.modelName}?${query}`,
        method: 'GET'
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) {
          return rej(err || resp)
        }
        const body = JSON.parse(resp.body);
        expect(body).to.be.an('array');
        expect(body.length).to.equal(1);
        const event = body[0];
        expect(event).has.contain.keys([
          'created', 'controlIndexHash'
        ]);
        expect(event.controlIndexHash).to.equal('647');

        res();
      });
    });
  });

  // it('POST sc/broadcast', async () => {
  //   const address = accounts[0];

  //   await new Promise((res, rej) => {
  //     request({
  //       url: `http://localhost:${config.rest.port}/sc/broadcast`,
  //       form: {'from': address},
  //       method: 'POST',
  //     }, async(err, resp) => {
  //         if (err || resp.statusCode !== 200) {
  //           return rej(err || resp)
  //         }

  //         const body = JSON.parse(resp.body);
  //         expect(body).to.be.an('object');
  //         expect(body.txParams).to.be.an('object').contain.all.keys([
  //           'nonce', 'gasPrice', 'gasLimit', 'to', 'value', 'data'
  //         ]);
  //         expect(body.call).to.be.not.undefined;
  //         res();
  //     });
  //   });
  // });

});
