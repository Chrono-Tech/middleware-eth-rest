/**
 * Expose an express web server
 * @module middleware-eth-rest
 */

const config = require('./config'),
  express = require('express'),
  cors = require('cors'),
  path = require('path'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  RED = require('node-red'),
  http = require('http'),
  NodeRedStorageModel = require('./models/nodeRedStorageModel'),
  NodeRedUserModel = require('./models/nodeRedUserModel'),
  MigrationModel = require('./models/migrationModel'),
  bodyParser = require('body-parser');

require('require-all')({
  dirname: path.join(__dirname, '/models'),
  filter: /(.+Model)\.js$/
});

require('./utils/generateSMEvents')();

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});
mongoose.red = mongoose.createConnection(config.nodered.mongo.uri);

mongoose.red.model(NodeRedStorageModel.collection.collectionName, NodeRedStorageModel.schema);
mongoose.red.model(NodeRedUserModel.collection.collectionName, NodeRedUserModel.schema);
mongoose.red.model(MigrationModel.collection.collectionName, MigrationModel.schema);

mongoose.connection.on('disconnected', function () {
  log.error('mongo disconnected!');
  process.exit(0);
});


const init = async () => {

  if (config.nodered.autoSyncMigrations)
    await require('./migrate');

  let app = express();
  let httpServer = http.createServer(app);
  app.use(cors());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  RED.init(httpServer, config.nodered);
  app.use(config.nodered.httpAdminRoot, RED.httpAdmin);
  app.use(config.nodered.httpNodeRoot, RED.httpNode);

  httpServer.listen(config.rest.port);
  RED.start();
};

module.exports = init();
