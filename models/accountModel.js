const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  messages = require('../factories/messages/accountMessageFactory');
  SECRET_FIELD = 'secret',
  SALT_WORK_FACTOR = 10;

require('mongoose-long')(mongoose);

/** @model accountModel
 *  @description account model - represents an eth account
 */
const Account = new mongoose.Schema({
  address: {
    type: String,
    unique: true,
    required: true,
    validate: [a=>  /^(0x)?[0-9a-fA-F]{40}$/.test(a), messages.wrongAddress]
  },
  balance: {type: mongoose.Schema.Types.Long, default: 0},
  created: {type: Date, required: true, default: Date.now},
  erc20token: {type: mongoose.Schema.Types.Mixed, default: {}},
  [SECRET_FIELD]: {type: String}
});

Account.pre('save', function(next) {
  let user = this;

  if(!user[SECRET_FIELD]) next();
  
  const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  const hash = bcrypt.hashSync(user[SECRET_FIELD], salt);
  user[SECRET_FIELD] = hash;

  next();
});

Account.methods.compareSecret = function(candidateSecret) {
  if(!candidateSecret) return false;
  return bcrypt.compareSync(candidateSecret, this[SECRET_FIELD]);
};

module.exports = mongoose.model('EthAccount', Account);
