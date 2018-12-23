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
  generateAddress = require('../utils/address/generateAddress'),
  killProcess = require('../helpers/killProcess'),
  expect = require('chai').expect,
  authTests = require('./auth'),
  addressTests = require('./address');

module.exports = (ctx) => {

  before (async () => {
    await models.txModel.remove();
    await models.blockModel.remove();

    const env = process.env;
    env['LABORX_USE_AUTH'] = 1;
    ctx.restPid = spawn('node', ['index.js'], {env: env, stdio: 'ignore'});
    await Promise.delay(20000);
  });

   describe('auth', () => authTests(ctx));

   describe('address', () => addressTests(ctx));

  it('kill rest server and up already - work GET /tx/:hash', async () => {
    await killProcess(ctx.restPid);
    const env = process.env;
    env['LABORX_USE_AUTH'] = 1;
    ctx.restPid = spawn('node', ['index.js'], {env: env, stdio: 'ignore'});
    await Promise.delay(10000);

    const hash = 'TESTHASH2';
    const fromAddress = generateAddress();
    const toAddress = generateAddress();

    await models.txModel.update({'_id': hash}, {
      from: fromAddress,
      to: toAddress,
      blockNumber: 5
    }, {upsert: true});

    await models.blockModel.update({'_id': 'sdfsdfsdf'}, {
      number: 5,
      timestamp: 5
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
      logs: [],
      hash: hash,
      timestamp: 5
    });
  });

  after ('kill environment', async () => {
    await ctx.restPid.kill();
  });

};
