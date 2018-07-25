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
  _ = require('lodash');

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
  authRequest = require('./helpers/authRequest'),
  net = require('net'),
  moment = require('moment'),
  amqp = require('amqplib'),
  createTestEvents = require('./helpers/createTestEvents'),
  smEvents = require('../factories/sc/smartContractsEventsFactory'),
  getEventFromSmEvents = require('./helpers/getEventFromSmEvents'),
  ctx = {
    accounts: [],
    amqp: {},
    eventModel: null
  };

describe('core/rest', function () {

  before(async () => {
    ctx.amqp.instance = await amqp.connect(config.nodered.functionGlobalContext.settings.rabbit.url);
    await clearQueues(ctx.amqp.instance);

    let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
    web3.setProvider(provider);

    ctx.accounts = await Promise.promisify(web3.eth.getAccounts)();
    await clearMongoAccounts();
    await saveAccountForAddress(ctx.accounts[0]);

  });

  after(async () => {
    await clearMongoAccounts();

    web3.currentProvider.connection.end();
    return mongoose.disconnect();
  });

  afterEach(async () => {
    await clearQueues(ctx.amqp.instance);
  });

  it('address/create from rabbitmq (not waves address) and check that all right', async () => {

    const newAddress = ctx.accounts[1];
    const channel = await ctx.amqp.instance.createChannel();
    const info = {'nem-address': newAddress, user: 1};
    await channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(info)));

    await Promise.delay(2000);
    const acc = await accountModel.findOne({address: newAddress});
    expect(acc).to.be.equal(null);
  });


  it('address/create from rabbitmq and check send event user.created in internal', async () => {

    const newAddress = ctx.accounts[1];
    await new Promise.all([
      (async () => {
        const channel = await ctx.amqp.instance.createChannel();
        const info = {'eth-address': newAddress, user: 1};
        await channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(info)));
      })(),
      (async () => {
        const channel = await ctx.amqp.instance.createChannel();
        await channel.assertExchange('internal', 'topic', {durable: false});
        await channel.assertQueue(`${config.nodered.functionGlobalContext.settings.rabbit.serviceName}_test.user`);
        await channel.bindQueue(`${config.nodered.functionGlobalContext.settings.rabbit.serviceName}_test.user`, 'internal', `${config.nodered.functionGlobalContext.settings.rabbit.serviceName}_user.created`);
        channel.consume(`${config.nodered.functionGlobalContext.settings.rabbit.serviceName}_test.user`, async (message) => {
          const content = JSON.parse(message.content);
          expect(content.address).to.be.equal(newAddress);
        }, {noAck: true});
    
        const acc = await accountModel.findOne({address: newAddress});
        expect(acc.address).to.be.equal(newAddress);
      })()
    ]);

  });

  it('address/delete from rabbitmq and check send event user.created in internal', async () => {

    const newAddress = ctx.accounts[1];
    const channel = await ctx.amqp.instance.createChannel();
    const info = {'eth-address': newAddress, user: 1};
    await channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(info)));

    await Promise.delay(2000);

    const acc = await accountModel.findOne({address: newAddress});
    expect(acc.isActive).to.be.equal(false);
  });


  it('validate all event routes', async () => {
    await Promise.all(
      _.map(smEvents, (model, name) =>
        new Promise((res, rej) => {
          authRequest(`http://localhost:${config.rest.port}/events/${name}`, (err, resp) => {
            err || resp.statusCode !== 200 ? rej(err || resp) : res()
          })
        })
      )
    );
  });

  it('address/balance by rest', async () => {
    const address = ctx.accounts[0];

    await new Promise((res, rej) => {
      authRequest({
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

  it('GET tx/:addr/history for some query params and one right transaction [0 => 1]', async () => {
    const address = ctx.accounts[0];

    ctx.txHash = await Promise.promisify(web3.eth.sendTransaction)({
      from: ctx.accounts[0],
      to: ctx.accounts[1],
      value: 10
    });

    await Promise.delay(30000);

    await new Promise((res, rej) => {
      authRequest({
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
          expect(respTx.to).to.equal(ctx.accounts[1]);
          expect(respTx.from).to.equal(ctx.accounts[0]);
          expect(respTx).to.contain.all.keys(['hash', 'blockNumber']);
          res();
        } catch (e) {
          rej(e || resp);
        }
      });
    });
  });

  it('GET tx/:addr/history for non exist', async () => {
    const address = ctx.accounts[3];

    await new Promise((res, rej) => {
      authRequest({
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
      authRequest({
        url: `http://localhost:${config.rest.port}/tx/${ctx.txHash}`,
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
          authRequest(`http://localhost:${config.rest.port}/events/${name}`, (err, resp) =>
            err || resp.statusCode !== 200 ? rej(err || resp) : res()
          );
        })
      )
    )
  );

  it('GET events - check all events', async () => {
    await new Promise((res, rej) => {
      authRequest({
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
      authRequest({
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

/*
  it('GET events/:name - check query language - get some  results', async () => {
    const query = `created>${moment().add(-1, 'hours').toISOString()}&` +
      `limit=2&sort=_id&offset=1`;

    return await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events/${ctx.eventModel.modelName}?${query}`,
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
        expect(eventOne).has.contain.keys(['created', 'controlIndexHash']);

        const eventTwo = body[1];
        expect(eventTwo.controlIndexHash).to.equal('648');
        expect(eventTwo).has.contain.keys(['created', 'controlIndexHash']);

        res();
      });
    });
  });

  it('GET events/:name - check query language - get one result', async () => {

    const query = `controlIndexHash=647`;

    return await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events/${ctx.eventModel.modelName}?${query}`,
        method: 'GET'
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) {
          return rej(err || resp)
        }
        const body = JSON.parse(resp.body);
        expect(body).to.be.an('array');
        expect(body.length).to.equal(1);
        const event = body[0];
        expect(event).has.contain.keys(['created', 'controlIndexHash']);
        expect(event.controlIndexHash).to.equal('647');

        res();
      });
    });
  });
*/



});

