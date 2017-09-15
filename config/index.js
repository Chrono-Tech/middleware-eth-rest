require('dotenv').config();

const config = {
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/data'
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  },
  transactions: {
    ttl: parseInt(process.env.TRANSACTION_TTL) || false
  },
  smartContracts: {
    events: {
      listen: parseInt(process.env.SMART_CONTRACTS_EVENTS_LISTEN) || false,
      ttl: parseInt(process.env.SMART_CONTRACTS_EVENTS_TTL) || false
    }
  }
};

module.exports = config;
