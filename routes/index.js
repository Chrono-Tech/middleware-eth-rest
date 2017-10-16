const messages = require('../factories/messages/genericMessageFactory'),
  express = require('express'),
  _ = require('lodash'),
  queryToMongo = require('query-to-mongo'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.balanceProcessor'}),
  generateSMEvents = require('../utils/generateSMEvents'),
  services = require('../services');

module.exports = (app) => {

  let routerAddr = express.Router();
  let routerTx = express.Router();
  let routerEvents = express.Router();

  let eventModels = generateSMEvents();

  app.get('/', (req, res) => {
    res.send(messages.success);
  });

  routerAddr.post('/', services.address.registerAddrService);
  routerAddr.delete('/', services.address.deregisterAddrService);
  routerAddr.post('/:addr/token', services.address.registerAddrTokenService);
  routerAddr.delete('/:addr/token', services.address.deregisterAddrTokenService);
  routerAddr.get('/:addr/balance', services.address.getAddrBalanceService);

  routerTx.get('/:addr/history/:startBlock/:endBlock', services.tx.getTXHistoryService);

  //register each event in express by its name
  _.forEach(eventModels, (model, name) => {
    routerEvents.get(`/${name}`, (req, res) => {
      //convert query request to mongo's
      let q = queryToMongo(req.query);
      //retrieve all records, which satisfy the query
      model.find(q.criteria, q.options.fields)
        .sort(q.options.sort)
        .limit(q.options.limit)
        .then(result => {
          res.send(result);
        })
        .catch(err => {
          log.error(err);
          res.send([]);
        });
    });
  });

  app.use('/addr', routerAddr);
  app.use('/tx', routerTx);
  app.use('/events', routerEvents);

};
