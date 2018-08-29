/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const config = require('../config'),
  spawn = require('child_process').spawn,
  Promise = require('bluebird'),
  request = require('request-promise'),
  models = require('../../models'),
  killProcess = require('../helpers/killProcess'),
  expect = require('chai').expect,
  url = config.dev.url,

  authTests = require('./auth'),
  addressTests = require('./address');



const generateAddress  = (name) => name.concat('a'.repeat(40-name.length)).toLowerCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }

module.exports = (ctx) => {

  before (async () => {
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    ctx.amqp.channel.prefetch(1);
    
    await models.txModel.remove();
    await models.blockModel.remove();

    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });

  after ('kill environment', async () => {
    await ctx.amqp.channel.close();
    await killProcess(ctx.restPid);
  });

   describe('auth', () => authTests(ctx));
   describe('address', () => addressTests(ctx));

  it('kill rest server and up already - work GET /tx/:hash', async () => {
    await killProcess(ctx.restPid);
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);

    const hash = 'TESTHASH2';
    const address = generateAddress('ffff');
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      from: address,
      to: generateAddress('fffaa'),
      blockNumber: 5
    }, {upsert: true, new: true});
    await models.blockModel.findOneAndUpdate({'_id': 'sdfsdfsdf'}, {
      number: 5,
      timestamp: 5
    }, {upsert: true, new: true});
  
    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);

    expect(response).to.deep.equal({
      "__v": 0,
      'from': address,
      'to': generateAddress('fffaa'),
      'blockNumber': 5,
      "logs": [],
      'hash': hash,
      'timestamp': 5
    });
  });


};
