/**
 * Mongoose model. Used to store hashes, which need to be pinned.
 * @module models/accountModel
 * @returns {Object} Mongoose model
 */

const mongoose = require('mongoose');

/**
 * Account model definition
 * @param  {Object} obj Describes account's model
 * @return {Object} Model's object
 */
const Migration = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  }
});

module.exports = mongoose.red.model('_migration', Migration);
