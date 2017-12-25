require('dotenv/config');

process.env.USE_MONGO_DATA = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('../config'),
  mongoose = require('mongoose'),
  expect = require('chai').expect,
  _ = require('lodash'),
  require_all = require('require-all'),
  contract = require('truffle-contract'),
  contracts = require_all({
    dirname: _.nth(require.resolve('chronobank-smart-contracts/build/contracts/MultiEventsHistory').match(/.+(?=MultiEventsHistory)/), 0),
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/,
    resolve: Contract => contract(Contract)
  }),
  Web3 = require('web3'),
  web3 = new Web3(),
  accountModel = require('../models/accountModel'),
  Promise = require('bluebird'),
  request = require('request'),
  moment = require('moment'),
  smEvents = require('../utils/generateSMEvents')(),
  ctx = {};

describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  after(() => {
    return mongoose.disconnect();
  });

  it('validate all event routes', () =>
    Promise.all(
      _.map(smEvents, (model, name) =>
        new Promise((res, rej) => {
          request(`http://localhost:${config.rest.port}/events/${name}`, (err, resp) => {
            err || resp.statusCode !== 200 ? rej(err) : res()
          })
        })
      )
    )
  );

  it('add account', async () => {
    ctx.address = `0x${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/`,
        method: 'POST',
        json: {
          address: ctx.address
        }
      }, (err, resp) => {
        err || resp.statusCode !== 200 ? rej(err) : res()
      })
    });

  });

  it('validate account', async () => {
    let account = await accountModel.findOne({address: ctx.address});
    expect(account).to.include({'address': ctx.address});
  });

  /*
   it('validate query language', async () => {
   await Promise.delay(10000);

   let data = await Promise.all(
   [
   `hash=${ctx.tx.hash}`,
   `hash!=${ctx.tx.hash}`,
   `to=${ctx.address}`,
   `created>${moment().add(-30, 'minutes').toISOString()}`
   ].map((query) =>
   new Promise((res, rej) =>
   request(`http://localhost:${config.rest.port}/transactions?${query}`, (err, resp, body) => {
   err || resp.statusCode !== 200 ? rej(err) : res(JSON.parse(body))
   })
   )
   )
   );

   expect(data[0][0]).to.include({'hash': ctx.tx.hash});
   expect(data[1]).to.not.have.members([{'hash': ctx.tx.hash}]);
   expect(data[2][0]).to.include({'to': ctx.tx.to});
   expect(data[3]).to.have.lengthOf.above(0);

   });
   */

});
