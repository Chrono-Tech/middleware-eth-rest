const config = require('./config'),
  express = require('express'),
  routes = require('./routes'),
  cors = require('cors'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser');

/**
 * @module entry point
 * @description expose an express web server for txs
 * and accounts manipulation
 */
mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});

let app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

routes(app);

app.listen(config.rest.port || 8081);
