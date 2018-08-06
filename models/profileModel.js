/**
 * Mongoose model. Accounts
 * @module models/accountModel
 * @returns {Object} Mongoose model
 * @requires factories/addressMessageFactory
 *
 *
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const mongoose = require('mongoose'),
  config = require('../config');


const Profile = new mongoose.Schema({
  token: {type: String, required: true, index: true},
  user: {type: Number},
  addresses: {type: mongoose.Schema.Types.Mixed}
});

module.exports = mongoose.profile.model(`${config.mongo.profile.collectionPrefix}Profile`, Profile);
