/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const addressTests = require('./address'),
  txTests = require('./tx'),
  Promise = require('bluebird'),
  spawn = require('child_process').spawn;

module.exports = (ctx) => {
  before(async () => {
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(15000);
  });

  describe('tx endpoints', () => txTests(ctx));

  describe('address endpoints', () => addressTests(ctx));

  after('kill environment', async () => {
    ctx.restPid.kill();
    delete ctx.restPid;
  });
};
