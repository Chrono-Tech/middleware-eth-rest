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
  spawn = require('child_process').spawn,
  url = config.dev.url;


const generateAddress  = (name) => name.concat('a'.repeat(40-name.length)).toLowerCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }
const TIMEOUT = 1000;

module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});

    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    ctx.amqp.channel.prefetch(1);

    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  afterEach(async () => {
    if (ctx.amqp.queue) {
      await ctx.amqp.channel.deleteQueue(ctx.amqp.queue.queue);
      await Promise.delay(1000);
    }
  });

  after ('kill environment', async () => {
    await ctx.amqp.channel.close();
    ctx.restPid.kill();
  });

  it('GET /tx/:hash  - less than 1s', async () => {
    const hash = 'TESTHASH2';
    const address = generateAddress('ffff');
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      to: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true, new: true});

    const start = Date.now();
    await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    });

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });


  it('GET /tx/:addr/history  - less than 1s', async () => {
    const address = generateAddress('ffff');
    await models.txModel.findOneAndUpdate({'_id': 'TEST1'}, {
      to: address,
      blockNumber: 5
    }, {upsert: true});
    await models.txModel.findOneAndUpdate({'_id': 'TEST2'}, {
      to: address,
      blockNumber: 7
    }, {upsert: true});

    const start  = Date.now();
    await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    });

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('GET /addr/:addr/balance -  less than 1s', async () => {
    const address = generateAddress('ffff7');
    await models.accountModel.findOneAndUpdate({address}, {
      balance: 100,
      erc20token: {
        abba: 300,
        bart: 500
      }
    });

    const start = Date.now();
    await request(`${url}/addr/${address}/balance`, {
      method: 'GET',
      headers: getAuthHeaders(),
      json: true
    });
    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('POST /addr - less than 1s', async () => {
    const address = generateAddress('ffff');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.create`);


    const start = Date.now();

    await Promise.all([
      (async () => {
        await request(url + '/addr', {
          method: 'POST',
          json: {address}
        });
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
      })()
    ]);

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('send message address.created from laborx - get events message account.created less than 1s', async () => {
    const address = generateAddress('ffff4');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr4', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr4', 'events', `${config.rabbit.serviceName}.account.created`);

    const start = Date.now();
    await Promise.all([
      (async () => {
        const data = {'eth-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr4',  msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
      })()
    ]);

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });

  it('send message address.deleted from laborx - get events message account.deleted less than 1s', async () => {
    const address = generateAddress('ffff4');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
    
    const start = Date.now();
    await Promise.all([
      (async () => {
        const data = {'eth-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
      })()
    ]);

    expect(Date.now() - start).to.be.below(TIMEOUT);
  });




 


};
