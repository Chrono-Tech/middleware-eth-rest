/**
 * Chronobank/eth-rest
 * @module service/registerAddrTokenService
 * @returns {undefined}
 */

const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory'),
  _ = require('lodash');

module.exports = async (req, res) => {

  const addr = req.params.addr;
  const erc20addr = req.body.erc20tokens;
  const user = await accountModel.findOne({address: addr});

  if (!user)
    return res.send(messages.fail);

  const toAdd = _.chain(erc20addr)
    .reject(val => _.has(user.erc20token, val))
    .transform((acc, addr) => {
      acc[`erc20token.${addr}`] = 0;
    }, {})
    .value();

  await accountModel.update({address: addr}, {$set: toAdd});
  res.send(messages.success);
};
