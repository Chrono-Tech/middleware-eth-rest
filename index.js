/**
 * Expose an express web server
 * @module middleware-eth-rest
 */

const config = require('./config'),
  express = require('express'),
  routes = require('./routes'),
  authMiddleware = require('./utils/authMiddleware'),
  cors = require('cors'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  RED = require('node-red'),
  http = require('http'),
  bodyParser = require('body-parser');

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});

mongoose.connection.on('disconnected', function () {
  log.error('mongo disconnected!');
  process.exit(0);
});

let app = express();
let httpServer = http.createServer(app);
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(authMiddleware);

routes(app);
RED.init(httpServer, config.nodered);
app.use(config.nodered.httpAdminRoot, RED.httpAdmin);
app.use(config.nodered.httpNodeRoot, RED.httpNode);

httpServer.listen(config.rest.port);
RED.start();
