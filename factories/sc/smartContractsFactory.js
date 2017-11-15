/**
 * Load all events for smartContracts, output models
 * @module utils/generateSMEvents
 * @requires truffle-contract
 */

const requireAll = require('require-all'),
  path = require('path'),
  fs = require('fs'),
  contract = require('truffle-contract');

let contracts = {};
let contractsPath = path.join(__dirname, '../../node_modules', 'chronobank-smart-contracts/build/contracts');

if (fs.existsSync(contractsPath))
  contracts = requireAll({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
    dirname: contractsPath,
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/,
    resolve: Contract => contract(Contract)
  });

module.exports = contracts;
