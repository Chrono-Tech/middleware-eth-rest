require('dotenv').config();

const mm = require('mongodb-migrations'),
  bunyan = require('bunyan'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  requireAll = require('require-all'),
  Promise = require('bluebird'),
  migrations = _.values(
    requireAll({
      dirname: path.join(__dirname, 'migrations'),
      recursive: false,
      filter: /(.+)\.js$/
    })
  ),
  pm2Path = path.join(__dirname, '../../ecosystem.config.js'),
  log = bunyan.createLogger({name: 'migrator'});

if (fs.existsSync(pm2Path) && !process.env.NODERED_MONGO_URI && !process.env.MONGO_URI) {
  let config = require('../../ecosystem.config.js');
  let uri = _.chain(config)
    .get('apps')
    .find({script: 'core/middleware-eth-rest'})
    .thru(app =>
      _.get(app, 'env.NODERED_MONGO_URI') || _.get(app, 'env.MONGO_URI')
    )
    .value();

  if (uri)
    process.env.NODERED_MONGO_URI = uri;
}

let migrator = new mm.Migrator({
  url: _.head(process.argv.slice(2)) || process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
  directory: 'migrations'
}, (level, message) => log.info(level, message));

const init = async () => {

  migrator.bulkAdd(migrations);
  await Promise.promisifyAll(migrator).migrateAsync();
  migrator.dispose();
};

module.exports = init();
