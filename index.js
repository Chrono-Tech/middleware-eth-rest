/**
 * Expose an express web server
 * @module middleware-eth-rest
 */

const config = require('./config'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  path = require('path'),
  bunyan = require('bunyan'),
  migrator = require('../middleware-service-sdk').migrator,
  _ = require('lodash'),
  log = bunyan.createLogger({name: 'core.rest'}),
  redInitter = require('../middleware-service-sdk').init;

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);

if (config.mongo.data.useData)
  mongoose.data = mongoose.createConnection(config.mongo.data.uri);

_.chain([mongoose.accounts, mongoose.data])
  .compact().forEach(connection =>
  connection.on('disconnected', function () {
    log.error('mongo disconnected!');
    process.exit(0);
  })
).value();

const init = async () => {

  require('require-all')({
    dirname: path.join(__dirname, '/models'),
    filter: /(.+Model)\.js$/
  });

  if (config.mongo.data.useData)
    require('./utils/generateSMEvents')();


  if (config.nodered.autoSyncMigrations)
    await migrator.run(config.nodered.mongo.uri, path.join(__dirname, 'migrations'));


  redInitter(config);
};

module.exports = init();
