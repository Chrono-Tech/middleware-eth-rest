/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  expect = require('chai').expect,
  Promise = require('bluebird');


module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.txModel.remove({});
  });


  it('send wrong address.created from laborx - not get message about account', async () => {
    const address = 'badaddress';
    await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.created`);
   

    await Promise.all([
      (async () => {
        const data = {address};
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        const result = await new Promise(res => ctx.amqp.channel.consume('test_addr', async (msg) => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if(content.address !== address)
            return;

          res('CREATED');
        })).timeout(3000).catch(() => 'TIMEOUT');


        await ctx.amqp.channel.deleteQueue('test_addr');
        expect(result).to.equal('TIMEOUT');
      })()
    ]);
  });

  it('send wrong address.deleted from laborx - not get message about account', async () => {
    const address = 'badaddress';
    await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
    
 
    await Promise.all([
      (async () => {
        const data = {address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),
 
      (async () => {
        const result = await new Promise(res => ctx.amqp.channel.consume('test_addr', () => {
          res('DELETED');
        })).timeout(3000).catch(() => 'TIMEOUT');

        await ctx.amqp.channel.deleteQueue('test_addr');
        expect(result).to.equal('TIMEOUT');
      })()
    ]);
  });


};
