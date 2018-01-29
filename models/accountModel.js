/** 
 * Mongoose model. Used to store hashes, which need to be pinned.
 * @module models/accountModel
 * @returns {Object} Mongoose model
 */

const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  config = require('../config'),
  messages = require('../../middleware-service-sdk').factories.messages.addressMessageFactory,
  SALT_WORK_FACTOR = 10;

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
    unique: true,
    validate: [a=>  /^[0-9A-Z]{40}$/.test(a), messages.wrongAddress]
  },
  balance: {type: mongoose.Schema.Types.Long, default: 0},
  created: {type: Date, required: true, default: Date.now},
  isActive: {type: Boolean, required: true, default: true},
  erc20token: {type: mongoose.Schema.Types.Mixed, default: {}},
  password: {type: String}
});

/**
 * Use virtual field for encrypting the password 
 */
Account.virtual('clean_password')
  .set(function (clean_password) {
    this.password = this.encryptPassword(clean_password);
  })
  .get(function () { return this.password; });

Account.methods = {
  /**
   * Password comparison
   * @param  {string} plainPassword
   * @return {boolean}
   */
  authenticate: function (plainPassword) {
    return bcrypt.compareSync(plainPassword, this.password);
  },
  /**
   * 
   * @param  {string} password Plain password to encrypt
   * @return {string} Encrypted password
   */
  encryptPassword: function (password) {
    if (!password)
      return '';
    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    return bcrypt.hashSync(password, salt);
  }
};

module.exports = mongoose.accounts.model(`${config.mongo.accounts.collectionPrefix}Account`, Account);
