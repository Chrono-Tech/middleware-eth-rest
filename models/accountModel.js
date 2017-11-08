const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  messages = require('../factories/messages/accountMessageFactory');
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
  password: {type: String}
});

Account.virtual('clean_password')
  .set(function (clean_password) {
    this.password = this.encryptPassword(clean_password);
  })
  .get(function () { return this.password });

Account.methods = {
  authenticate: function(plainPassword) {
    return bcrypt.compareSync(plainPassword, this.password)
  },
  encryptPassword: function(password) {
    if (!password)
      return '';
    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    return bcrypt.hashSync(password, salt);
  }
};

module.exports = mongoose.model('EthAccount', Account);
