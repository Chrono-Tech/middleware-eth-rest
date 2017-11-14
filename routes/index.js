/**
 * Chronobank/eth-rest route bootstrap
 * @module routes
 * @returns {undefined}
 */

const messages = require('../factories/messages/genericMessageFactory'),
  express = require('express'),
  _ = require('lodash'),
  generateSMEvents = require('../utils/generateSMEvents'),
  auth = require('../utils/authenticate'),
  services = require('../services');

module.exports = (app) => {

  // Define express.js Routers
  let routerAddr = express.Router();
  let routerTx = express.Router();
  let routerEvents = express.Router();

  // Get models for all smart contract events
  let eventModels = generateSMEvents();

  app.get('/', (req, res) => {
    res.send(messages.success);
  });

  // Address routes
  routerAddr.post('/', services.address.registerAddrService);
  routerAddr.delete('/', auth.check, services.address.deregisterAddrService);
  routerAddr.post('/:addr/token', services.address.registerAddrTokenService);
  routerAddr.delete('/:addr/token', services.address.deregisterAddrTokenService);
  routerAddr.get('/:addr/balance', services.address.getAddrBalanceService);
  routerAddr.post('/:addr/secret', services.address.getAddrSecretService);

  // Transaction router
  routerTx.get('/:addr/history/:startBlock/:endBlock', services.tx.getTXHistoryService);
  routerTx.post('/', services.tx.sendTXService);
  routerTx.get('/:hash', services.tx.getTXByHashService);


  //Register each event in express by its name
  _.forEach(eventModels, (model, name) => {
    routerEvents.get(`/${name}`, (req, res) =>
      services.events.getEventService(req, res, model)
    );
  });
  // All possible events
  routerEvents.get('/', (req, res) => {
    res.send(Object.keys(eventModels));
  });

  app.use('/addr', routerAddr);
  app.use('/tx', routerTx);
  app.use('/events', routerEvents);

};
