require('dotenv/config');

process.env.USE_MONGO_DATA = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('../config'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  expect = require('chai').expect,
  _ = require('lodash'),
  require_all = require('require-all'),
  contract = require('truffle-contract'),
  contracts = require_all({
    dirname: _.nth(require.resolve('chronobank-smart-contracts/build/contracts/MultiEventsHistory').match(/.+(?=MultiEventsHistory)/), 0),
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/,
    resolve: Contract => contract(Contract)
  });


mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);
mongoose.data = mongoose.createConnection(config.mongo.data.uri);

const Web3 = require('web3'),
  web3 = new Web3(),
  accountModel = require('../models/accountModel'),
  request = require('request'),
  net = require('net'),
  moment = require('moment'),
  smEvents = require('../utils/generateSMEvents')(),
  getEventFromSmEvents = require('./helpers/getEventFromSmEvents'),
  createTestEvents = require('./helpers/createTestEvents');


let exampleEventModels = [];


describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  before(async () => {
    let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
    web3.setProvider(provider);

  });

  after(async () => {
    await Promise.map(exampleEventModels, async (event) => {
        return await event.remove();
    }); 
    web3.currentProvider.connection.end();
    return mongoose.disconnect();
  });

  it('GET events/:name - check routes for all events by name event', () =>
    Promise.all(
      _.map(smEvents, (model, name) =>
        new Promise((res, rej) => {
          request(`http://localhost:${config.rest.port}/events/${name}`, (err, resp) => {
            err || resp.statusCode !== 200 ? rej(err || resp) : res()
          })
        })
      )
    )
  );

  it('GET events - check all events', async() => {
    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/events`,
        method: 'GET'
      }, async(err, resp) => {
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
        request({
          url: `http://localhost:${config.rest.port}/events/bla-bla`,
          method: 'GET'
        }, async(err, resp) => {
            if (err || resp.statusCode !== 200) {
              return rej(err || resp)
            }
            const body = JSON.parse(resp.body);
            expect(body).to.be.empty;
            res();
        });
      });
  });

  // it('GET events/:name - check query language - get some  results', async () => {
  //   const exampleEventModel = createTestEvents(mongoose);
  //   exampleEventModels.push(exampleEventModel);


  //   const query = `created>${moment().add(-20, 'minutes').toISOString()}&limit=2`

  //   return await new Promise((res, rej) => {
  //       request({
  //         url: `http://localhost:${config.rest.port}/events/${exampleEventModel.modelName}?${query}`,
  //         method: 'GET'
  //       }, async(err, resp) => {
  //           if (err || resp.statusCode !== 200) {
  //             return rej(err || resp)
  //           }
  //           const body = JSON.parse(resp.body);
  //           expect(body).to.be.an('array');
  //           expect(body).has.length.to.equal(2);

  //           const eventOne = body[0];
  //           expect(eventOne).has.contain.keys([
  //             'created', 'network', 'controlIndexHash','code'
  //           ]);
  //           expect(eventOne).oneOf([446,447,448]);

  //           const eventTwo = body[1];
  //           expect(eventTwo).has.contain.keys([
  //             'created', 'network', 'controlIndexHash','code'
  //           ]);
  //           expect(eventTwo).oneOf([446,447,448]);
            
  //           res();
  //       });
  //     });
  // });

  // it('GET events/:name - check query language - get one result', async () => {

  //   const query = `code=448&created>${moment().add(-20, 'minutes').toISOString()}`

  //   return await new Promise((res, rej) => {
  //       request({
  //         url: `http://localhost:${config.rest.port}/events/${exampleEventModel.modelName}?${query}`,
  //         method: 'GET'
  //       }, async(err, resp) => {
  //           if (err || resp.statusCode !== 200) {
  //             return rej(err || resp)
  //           }
  //           const body = JSON.parse(resp.body);
  //           expect(body).to.be.an('array');
  //           expect(body).has.length.to.equal(1);
  //           const event = body[0];
  //           expect(event).has.contain.keys([
  //             'created', 'network', 'controlIndexHash','code'
  //           ]);
  //           expect(event.code).to.equal(448);

  //           res();
  //       });
  //     });
  // });


});
