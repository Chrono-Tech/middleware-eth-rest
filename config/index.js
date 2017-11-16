/**
 * Chronobank/eth-rest configuration
 * @module config
 * @returns {Object} Configuration
 */
require('dotenv').config();
const path = require('path'),
  nodeMongo = require('node-red-flows-mongo');


nodeMongo.init = (settings)=>{
  nodeMongo.settings = settings;
};

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
    flowFile: path.join(__dirname, 'nodered', 'flow.json'),
    httpAdminRoot: '/red/admin',
    userDir: path.join(__dirname, 'nodered'),
    httpNodeRoot: '/red',
    mqttReconnectTime: 4000,
    serialReconnectTime: 4000,
    debugMaxLength: 1000,
/*    adminAuth: {
      type: 'credentials',
      users: [{
        username: 'admin',
        password: '$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.',
        permissions: '*'
      }]
    },*/
    nodesDir: path.join(__dirname, '../'),
    autoInstallModules: true,
    functionGlobalContext: {
      _: require('lodash')
    },
    //storageModule: require('node-red-flows-mongo'),
    //mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/data'
  }
};

module.exports = config;
