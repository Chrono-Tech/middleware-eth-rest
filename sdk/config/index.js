/**
 * Chronobank/eth-rest configuration
 * @module config
 * @returns {Object} Configuration
 */
require('dotenv').config();
const path = require('path'),
  bunyan = require('bunyan'),
  util = require('util'),
  mongoose = require('mongoose'),
  log = bunyan.createLogger({name: 'core.rest'});

let config = {
  mongo: {
    accounts: {
      uri: 'mongodb://localhost:27017/data',
      collectionPrefix: 'sdk'
    },
    data: {
      uri: 'mongodb://localhost:27017/data',
      collectionPrefix: 'sdk',
      useData: 1
    }
  },
  rabbit: {
    url: 'amqp://localhost:5672',
    serviceName: 'app_sdk'
  },
  rest: {
    domain: 'localhost',
    port: 8081
  },
  nodered: {
    mongo: {
      uri: 'mongodb://localhost:27017/data'
    },
    migrationsDir: path.join(__dirname, '../migrations'),
    adminAuth: require('../controllers/nodeRedAuthController'),
    storageModule: require('../controllers/nodeRedStorageController'),
    autoSyncMigrations: true,
    httpAdminRoot: '/admin',
    httpNodeRoot: '/',
    debugMaxLength: 1000,
    nodesDir: path.join(__dirname, '../'),
    autoInstallModules: true,
    functionGlobalContext: {
      _: require('lodash'),
      factories: {
        messages: {
          address: require('../factories/messages/addressMessageFactory'),
          generic: require('../factories/messages/genericMessageFactory'),
          tx: require('../factories/messages/txMessageFactory')
        }
      },
      connections: {
        red: mongoose
      },
      settings: {
        mongo: {
          accountPrefix: 'sdk',
          collectionPrefix: 'sdk'
        },
        rabbit: {
          url: 'amqp://localhost:5672',
          serviceName: 'app_sdk'
        }
      }
    },
    logging: {
      console: {
        level: 'info',
        metrics: true,
        handler: () =>
          (msg) => {
            log.info(util.inspect(msg, null, 3));
          }
      }
    }
  }
};

module.exports = config;
