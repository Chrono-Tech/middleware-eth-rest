/**
 * Mongoose model. Used to store node-red data.
 * @module models/nodeRedStorageModel
 * @returns {Object} Mongoose model
 */

const mongoose = require('mongoose');

/**
 * Account model definition
 * @param  {Object} obj Describes node-red storage model
 * @return {Object} Model's object
 */
const NodeRedUser = new mongoose.Schema({
  username: {type: String},
  password: {type: String},
  permissions: {type: String},
  isActive: {type: Boolean, default: true}
});

module.exports = mongoose.red.model('NodeRedUser', NodeRedUser);
