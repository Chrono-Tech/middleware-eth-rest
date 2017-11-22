/**
 * Chronobank/eth-rest configuration
 * @module config
 * @returns {Object} Configuration
 */
require('dotenv').config();
const path = require('path');

const config = {
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/data'
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081,
    auth: process.env.USE_AUTH || false
  },
  web3: {
    network: process.env.NETWORK || 'development',
    uri: `${/^win/.test(process.platform) ? '\\\\.\\pipe\\' : ''}${process.env.WEB3_URI || `/tmp/${(process.env.NETWORK || 'development')}/geth.ipc`}`
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data'
    },
    httpAdminRoot: '/admin',
    httpNodeRoot: '/',
    debugMaxLength: 1000,
    adminAuth: require('../controllers/nodeRedAuthController'),
    nodesDir: path.join(__dirname, '../'),
    autoInstallModules: true,
    functionGlobalContext: {
      _: require('lodash'),
      factories: {
        sm: require('../factories/sc/smartContractsFactory'),
        messages: {
          address: require('../factories/messages/addressMessageFactory'),
          generic: require('../factories/messages/genericMessageFactory'),
          tx: require('../factories/messages/txMessageFactory')
        }
      }
    },
    storageModule: require('../controllers/nodeRedStorageController')
  }
};

module.exports = config;
