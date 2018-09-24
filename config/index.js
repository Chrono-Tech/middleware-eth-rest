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
  mongoose = require('mongoose'),
  _ = require('lodash'),
  eventToQueryConverter = require('../utils/converters/eventToQueryConverter'),
  queryResultToEventArgsConverter = require('../utils/converters/queryResultToEventArgsConverter'),
  smartContractsPath = process.env.SMART_CONTRACTS_PATH || path.join(__dirname, '../node_modules/chronobank-smart-contracts/build/contracts'),
  smartContracts = require('../factories/sc/smartContractsFactory')(smartContractsPath),
  smartContractsEvents = require('../factories/sc/smartContractsEventsFactory')(smartContractsPath),
  BigNumber = require('bignumber.js'),
  accountPrefix = process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth',
  profilePrefix = process.env.MONGO_PROFILE_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth',
  collectionPrefix = process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth',
  rabbit = {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_eth'
  };


let config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: accountPrefix
    },
    profile: {
      uri: process.env.MONGO_PROFILE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: profilePrefix
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix
    }
  },
  rabbit,
  systemRabbit: {
    url: process.env.SYSTEM_RABBIT_URI || process.env.RABBIT_URI || 'amqp://localhost:5672',
    exchange: process.env.SYSTEM_RABBIT_EXCHANGE || 'internal',
    serviceName: process.env.SYSTEM_RABBIT_SERVICE_NAME || 'system' 
  },
  checkSystem: process.env.CHECK_SYSTEM ? parseInt(process.env.CHECK_SYSTEM) : true,
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081,
    auth: process.env.USE_AUTH || false
  },
  smartContracts: {
    path: process.env.SMART_CONTRACTS_PATH ? path.normalize(process.env.SMART_CONTRACTS_PATH) : path.join(__dirname, '../node_modules/chronobank-smart-contracts/build/contracts')
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.NODE_RED_MONGO_COLLECTION_PREFIX || '',
    },
    logging: {
      console: {
        level: process.env.LOG_LEVEL || 'info'
      }
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
            eventToQueryConverter: eventToQueryConverter(smartContractsPath),
            queryResultToEventArgsConverter: queryResultToEventArgsConverter(smartContractsPath)
          }
        },
      },
      'truffle-contract': require('truffle-contract'),
      connections: {
        primary: mongoose
      },
      settings: {
        events: {
          address: _.get(smartContracts, `MultiEventsHistory.networks.${process.env.SMART_CONTRACTS_NETWORK_ID || '4'}.address`)
        },
        mongo: {
          accountPrefix,
          collectionPrefix
        },
        rabbit,
        laborx: {
          url: process.env.LABORX_RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.LABORX_RABBIT_SERVICE_NAME || '',
          authProvider: process.env.LABORX || 'http://localhost:3001/api/v1/security',
          profileModel: profilePrefix + 'Profile',
          useAuth: process.env.LABORX_USE_AUTH ? parseInt(process.env.LABORX_USE_AUTH) : false,
          useCache: process.env.LABORX_USE_CACHE ? parseInt(process.env.LABORX_USE_CACHE) : true,
          dbAlias: 'profile'
        }
      }
    }
  }
};

module.exports = config;
