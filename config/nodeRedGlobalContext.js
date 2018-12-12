require('dotenv').config();

const mongoose = require('mongoose'),
  eventToQueryConverter = require('../utils/converters/eventToQueryConverter'),
  queryResultToEventArgsConverter = require('../utils/converters/queryResultToEventArgsConverter'),
  smartContractsEventsFactory = require('../factories/sc/smartContractsEventsFactory'),
  BigNumber = require('bignumber.js');

module.exports = config => {

  const contractFactory = smartContractsEventsFactory(config.smartContracts.path, config.smartContracts.eventContract, config.smartContracts.networkId);

  return {
    factories: {
      smEvents: contractFactory.events
    },
    libs: {
      BigNumber: BigNumber,
      utils: {
        converters: {
          eventToQueryConverter: eventToQueryConverter(contractFactory.events),
          queryResultToEventArgsConverter: queryResultToEventArgsConverter(contractFactory.events)
        }
      }
    },
    connections: {
      primary: mongoose
    },
    settings: {
      events: {
        address: contractFactory.address
      },
      mongo: {
        accountPrefix: config.mongo.accounts.collectionPrefix,
        collectionPrefix: config.mongo.data.collectionPrefix
      },
      rabbit: config.rabbit,
      laborx: {
        url: process.env.LABORX_RABBIT_URI || 'amqp://localhost:5672',
        serviceName: process.env.LABORX_RABBIT_SERVICE_NAME || '',
        authProvider: process.env.LABORX || 'http://localhost:3001/api/v1/security',
        profileModel: config.mongo.profile.collectionPrefix + 'Profile',
        useAuth: process.env.LABORX_USE_AUTH ? parseInt(process.env.LABORX_USE_AUTH) : false,
        useCache: process.env.LABORX_USE_CACHE ? parseInt(process.env.LABORX_USE_CACHE) : true,
        dbAlias: 'profile'
      }
    }
  }
};