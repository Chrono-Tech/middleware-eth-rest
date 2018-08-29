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
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    ctx.amqp.channel.prefetch(1);

    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });

  describe('tx', () => txTests(ctx));
  describe('address', () => addressTests(ctx));

  after('kill environment', async () => {
    await ctx.amqp.channel.close();
    ctx.restPid.kill();
  });
};
