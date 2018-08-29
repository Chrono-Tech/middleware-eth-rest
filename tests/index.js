/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11gmail.com>
 */

require('dotenv/config');
process.env.LOG_LEVEL = 'error';

const config = require('../config'),
  models = require('../models'),
  spawn = require('child_process').spawn,
  _ = require('lodash'),
  blocksTests = require('./blocks'),
  fuzzTests = require('./fuzz'),
  performanceTests = require('./performance'),
  featuresTests = require('./features'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  amqp = require('amqplib'),
  ctx = {};

mongoose.Promise = Promise;
mongoose.data = mongoose.createConnection(config.mongo.data.uri, {useMongoClient: true});
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri, {useMongoClient: true});
mongoose.profile = mongoose.createConnection(config.mongo.profile.uri, {useMongoClient: true});

describe('core/ethRest', function () {

  before (async () => {
    models.init();
    ctx.amqp = {};
    ctx.amqp.instance = await amqp.connect(config.rabbit.url);
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    await ctx.amqp.channel.assertExchange('events', 'topic', {durable: false});
    await ctx.amqp.channel.assertExchange('profiles', 'fanout', {durable: true});
    await ctx.amqp.channel.close();

     ctx.laborxPid = spawn('node', ['tests/utils/laborxProxy.js'], {
       env: process.env, stdio: 'ignore'
     });
     await Promise.delay(10000);
  });

  after (async () => {
    mongoose.disconnect();
    await ctx.amqp.instance.close();
     await ctx.laborxPid.kill();
  });

  describe('blocks', () => blocksTests(ctx));
  describe('features', () => featuresTests(ctx));
  describe('fuzz', () => fuzzTests(ctx));
  describe('performance', () => performanceTests(ctx));
});
