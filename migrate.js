const mm = require('mongodb-migrations'),
  bunyan = require('bunyan'),
  config = require('./config'),
  path = require('path'),
  _ = require('lodash'),
  requireAll = require('require-all'),
  Promise = require('bluebird'),
  migrations = _.values(
    requireAll({
      dirname: path.join(__dirname, 'migrations')
    })
  ),
  log = bunyan.createLogger({name: 'migrator'});

let migrator = new mm.Migrator({
  url: config.nodered.mongo.uri,
  directory: 'migrations'
}, (level, message)=>log.info(level, message));

const init = async () => {

  migrator.bulkAdd(migrations);
  await Promise.promisifyAll(migrator).migrateAsync();
  migrator.dispose();
  process.exit(0);
};

module.exports = init();
