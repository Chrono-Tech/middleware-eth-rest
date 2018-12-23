/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  Promise = require('bluebird'),
  generateAddress = require('../utils/address/generateAddress'),
  spawn = require('child_process').spawn;

const TIMEOUT = 1000;

module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});

    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  it('GET /tx/:hash  - less than 1s', async () => {
    const hash = 'TESTHASH2';
    const address = generateAddress();
    await models.txModel.update({'_id': hash}, {
      to: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const start = Date.now();
    await request(`http://localhost:${config.rest.port}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });


  it('GET /tx/:addr/history  - less than 1s', async () => {
    const address = generateAddress();
    await models.txModel.update({'_id': 'TEST1'}, {
      to: address,
      blockNumber: 5
    }, {upsert: true});

    await models.txModel.update({'_id': 'TEST2'}, {
      to: address,
      blockNumber: 7
    }, {upsert: true});

    const start  = Date.now();
    await request(`http://localhost:${config.rest.port}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('GET /addr/:addr/balance -  less than 1s', async () => {
    const address = generateAddress();
    await models.accountModel.update({address}, {
      balance: 100,
      erc20token: {
        abba: 300,
        bart: 500
      }
    });

    const start = Date.now();
    await request(`http://localhost:${config.rest.port}/addr/${address}/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      },
      json: true
    });
    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('POST /addr - less than 1s', async () => {
    const address = generateAddress();
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.create`);

    const start = Date.now();
    await Promise.all([
      (async () => {
        await request(`http://localhost:${config.rest.port}/addr`, {
          method: 'POST',
          json: {address}
        });
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          await ctx.amqp.channel.deleteQueue('test_addr');
          res();
        }));
      })()
    ]);

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('send message address.created from laborx - get events message account.created less than 1s', async () => {
    const address = generateAddress();
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.created`);

    const start = Date.now();
    await Promise.all([
      (async () => {
        const data = {'eth-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address == address) { 
            await ctx.amqp.channel.deleteQueue('test_addr');
            res();
          }
        }));
      })()
    ]);

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('send message address.deleted from laborx - get events message account.deleted less than 1s', async () => {
    const address = generateAddress();
    await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
    
    const start = Date.now();
    await Promise.all([
      (async () => {
        const data = {'eth-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          await ctx.amqp.channel.deleteQueue('test_addr');
          res();
        }));
      })()
    ]);

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  after ('kill environment', async () => {
    ctx.restPid.kill();
  });

};
