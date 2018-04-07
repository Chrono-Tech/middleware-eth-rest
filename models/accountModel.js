/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Mongoose model. Used to store hashes, which need to be pinned.
 * @module models/accountModel
 * @returns {Object} Mongoose model
 */

const mongoose = require('mongoose'),
  config = require('../config'),
  messages = require('middleware_service.sdk').factories.messages.addressMessageFactory;
require('mongoose-long')(mongoose);

/**
 * Account model definition
 * @param  {Object} obj Describes account's model
 * @return {Object} Model's object
 */
const Account = new mongoose.Schema({
  address: {
    type: String,
    unique: true,
    required: true,
    validate: [a=>  /^(0x)?[0-9a-fA-F]{40}$/.test(a), messages.wrongAddress]
  },
  nem: { //todo refactor
    type: String,
    validate: [a=>  /^[0-9A-Z]{40}$/.test(a), messages.wrongAddress]
  },
  balance: {type: mongoose.Schema.Types.Long, default: 0},
  created: {type: Date, required: true, default: Date.now},
  isActive: {type: Boolean, required: true, default: true},
  erc20token: {type: mongoose.Schema.Types.Mixed, default: {}}
});


module.exports = mongoose.accounts.model(`${config.mongo.accounts.collectionPrefix}Account`, Account);
