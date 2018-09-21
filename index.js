/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Expose an express web server
 * @module middleware-eth-rest
 */

const config = require('./config'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  path = require('path'),
  bunyan = require('bunyan'),

  AmqpService = require('middleware_common_infrastructure/AmqpService'),
  InfrastructureInfo = require('middleware_common_infrastructure/InfrastructureInfo'),
  InfrastructureService = require('middleware_common_infrastructure/InfrastructureService'),

  migrator = require('middleware_service.sdk').migrator,
  _ = require('lodash'),
  log = bunyan.createLogger({name: 'core.rest', level: config.nodered.logging.console.level}),
  models = require('./models'),
  redInitter = require('middleware_service.sdk').init;


mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri, {useMongoClient: true});
mongoose.profile = mongoose.createConnection(config.mongo.profile.uri, {useMongoClient: true});
mongoose.data = mongoose.createConnection(config.mongo.data.uri, {useMongoClient: true});

const runSystem = async function () {
  const rabbit = new AmqpService(
    config.systemRabbit.url, 
    config.systemRabbit.exchange,
    config.systemRabbit.serviceName
  );
  const info = new InfrastructureInfo(require('./package.json'));
  const system = new InfrastructureService(info, rabbit, {checkInterval: 10000});
  await system.start();
  system.on(system.REQUIREMENT_ERROR, ({requirement, version}) => {
    log.error(`Not found requirement with name ${requirement.name} version=${requirement.version}.` +
        ` Last version of this middleware=${version}`);
    process.exit(1);
  });
  await system.checkRequirements();
  system.periodicallyCheck();
};


const init = async () => {
  if (config.checkSystem)
    await runSystem();

  _.chain([mongoose.accounts, mongoose.data, mongoose.profile])
    .compact().forEach(connection =>
      connection.on('disconnected', function () {
        throw new Error('mongo disconnected!');
      })
    ).value();

  models.init();

  if (config.nodered.autoSyncMigrations)
    await migrator.run(
      config,
      path.join(__dirname, 'migrations')
    );

  redInitter(config);
};

module.exports = init().catch((e) => {
  log.error(e);
  process.exit(1);
});
