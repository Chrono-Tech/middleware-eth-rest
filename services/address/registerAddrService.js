/**
 * Chronobank/eth-rest
 * @module service/registerAddrService
 * @returns {undefined}
 */

const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory'),
  _ = require('lodash');

module.exports = async (req, res) => {
  req.body.erc20token = _.chain(req.body.erc20tokens)
    .transform((acc, addr) => {
      acc[addr.toLowerCase()] = 0;
    }, {})
    .value();
  req.body.address = req.body.address.toLowerCase();
  let account = new accountModel(req.body);

  if (account.validateSync())
    return res.send(messages.fail);

  await account.save();
  const success = Object.assign(messages.success, {secret: account.secret});

  res.send(success);
};
