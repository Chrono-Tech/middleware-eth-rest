_ = require('lodash');
require('dotenv').config();
config = require('../../../config');

const ownConfig = {
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  }
};

module.exports = _.assign(config, ownConfig);