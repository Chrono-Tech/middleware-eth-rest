/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Chronobank/eth-rest configuration
 * @module config
 * @returns {Object} Configuration
 */
require('dotenv').config();
const path = require('path'),
  Web3 = require('web3'),
  bunyan = require('bunyan'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  smartContracts = require('../factories/sc/smartContractsFactory'),
  smartContractsEvents = require('../factories/sc/smartContractsEventsFactory'),
  eventToQueryConverter = require('../utils/converters/eventToQueryConverter'),
  queryResultToEventArgsConverter = require('../utils/converters/queryResultToEventArgsConverter'),
  log = bunyan.createLogger({name: 'core.rest'}),
  BigNumber = require('bignumber.js'),
  net = require('net');

const accountPrefix = process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth';

let config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: accountPrefix
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth',
      useData: process.env.USE_MONGO_DATA ? parseInt(process.env.USE_MONGO_DATA) : 1
    }
  },
  web3: {
    networkId: parseInt(process.env.NETWORK_ID) || 4,
    network: process.env.NETWORK || 'development',
    uri: `${/^win/.test(process.platform) ? '\\\\.\\pipe\\' : ''}${process.env.WEB3_URI || `/tmp/${(process.env.NETWORK || 'development')}/geth.ipc`}`
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081,
    auth: process.env.USE_AUTH || false
  },
  smartContracts: {
    path: process.env.SMART_CONTRACTS_PATH || path.join(__dirname, '../node_modules/chronobank-smart-contracts/build/contracts')
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.NODE_RED_MONGO_COLLECTION_PREFIX || '',
    },
    migrationsInOneFile: true,
    autoSyncMigrations: process.env.NODERED_AUTO_SYNC_MIGRATIONS || true,
    httpAdminRoot: process.env.HTTP_ADMIN || false,
    customNodesDir: [path.join(__dirname, '../')],
    migrationsDir: path.join(__dirname, '../migrations'),
    functionGlobalContext: {
      factories: {
        sm: smartContracts,
        smEvents: smartContractsEvents
      },
      libs: {
        BigNumber: BigNumber,
        utils: {
          converters: {
            eventToQueryConverter: eventToQueryConverter,
            queryResultToEventArgsConverter: queryResultToEventArgsConverter
          }
        },
      },
      'truffle-contract': require('truffle-contract'),
      connections: {
        primary: mongoose
      },
      settings: {
        events: {
          address: _.get(smartContracts, `MultiEventsHistory.networks.${process.env.NETWORK_ID || 4}.address`)
        },
        mongo: {
          accountPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth',
          collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth'
        },
        rabbit: {
          url: process.env.RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.RABBIT_SERVICE_NAME || 'app_eth'
        },
        laborx: {
          authProvider: process.env.LABORX || 'http://localhost:3001i/api/v1/security',
          profileModel: accountPrefix + 'Profile',
          dbAlias: 'accounts'
        }
      }
    }
  }
};

const initWeb3Provider = (web3) => {

  const provider = /^http/.test(config.web3.uri) ?
    new Web3.providers.HttpProvider(config.web3.uri) :
    new Web3.providers.IpcProvider(`${/^win/.test(process.platform) ? '\\\\.\\pipe\\' : ''}${config.web3.uri}`, net);

  web3.setProvider(provider);
  if (web3.currentProvider.connection)
    web3.currentProvider.connection.on('error', async () => {
      log.error('restart ipc client');
      await Promise.delay(5000);
      initWeb3Provider(web3);
    });

};

module.exports = (() => {
  config.nodered.functionGlobalContext.web3 = new Web3();
  initWeb3Provider(config.nodered.functionGlobalContext.web3);
  return config;
})();
