require('dotenv').config();

const mm = require('mongodb-migrations'),
  config = require('./config'),
  bunyan = require('bunyan'),
  path = require('path'),
  _ = require('lodash'),
  requireAll = require('require-all'),
  Promise = require('bluebird'),
  log = bunyan.createLogger({name: 'migrator'});

module.exports.run = async (uri = config.nodered.mongo.uri, folder = path.join(__dirname, 'migrations')) => {

  const migrations = _.values(
    requireAll({
      dirname: folder,
      recursive: false,
      filter: /(.+)\.js$/
    })
  );

  let migrator = new mm.Migrator({
    url: uri,
    directory: 'migrations'
  }, (level, message) => log.info(level, message));

  const filteredMigrations = _.sortBy(migrations, item => parseInt(item.id.split('.')[0]));

  migrator.bulkAdd(filteredMigrations);
  await Promise.promisifyAll(migrator).migrateAsync();
  migrator.dispose();
};
