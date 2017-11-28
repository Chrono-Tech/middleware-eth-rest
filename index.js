/**
 * Expose an express web server
 * @module middleware-eth-rest
 */

const config = require('./config'),
  express = require('express'),
  //authMiddleware = require('./utils/authMiddleware'),
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
  bodyParser = require('body-parser');

require('require-all')({
  dirname: path.join(__dirname, '/models'),
  filter: /(.+Model)\.js$/
});

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});
mongoose.red = mongoose.createConnection(config.nodered.mongo.uri);

mongoose.red.model(NodeRedStorageModel.collection.collectionName, NodeRedStorageModel.schema);
mongoose.red.model(NodeRedUserModel.collection.collectionName, NodeRedUserModel.schema);

mongoose.connection.on('disconnected', function () {
  log.error('mongo disconnected!');
  process.exit(0);
});

let app = express();
let httpServer = http.createServer(app);
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(authMiddleware);

RED.init(httpServer, config.nodered);
app.use(config.nodered.httpAdminRoot, RED.httpAdmin);
app.use(config.nodered.httpNodeRoot, RED.httpNode);

httpServer.listen(config.rest.port);
RED.start();
