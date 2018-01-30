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
  RED = require('node-red'),
  http = require('http'),
  migrator = require('./migrate'),
  bodyParser = require('body-parser'),
  factories = require('require-all')({
    dirname: path.join(__dirname, '/factories'),
    filter: /(.+Factory)\.js$/
  });

mongoose.Promise = Promise;

module.exports = {
  config: config,
  factories: factories,
  migrator: migrator,
  init: config => {

    mongoose.connect(config.nodered.mongo.uri, {useMongoClient: true});

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

  }
};

