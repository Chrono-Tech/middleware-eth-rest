/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Load all events for smartContracts, output models
 * @module utils/generateSMEvents
 * @requires truffle-contract
 */

const requireAll = require('require-all'),
  fs = require('fs'),
  contract = require('truffle-contract');


module.exports = (scPath)=>{
  let contracts = {};

  if (fs.existsSync(scPath))
    contracts = requireAll({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
      dirname: scPath,
      filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/,
      resolve: Contract => contract(Contract)
    });

  return contracts;
};
