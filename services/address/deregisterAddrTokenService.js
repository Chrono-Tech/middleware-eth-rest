/**
 * Chronobank/eth-rest 
 * @module service/deregisterAddrTokenService
 * @requires models/accountModel
 * @requires factories/genericMessageFactory
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

  const toRemove = _.chain(erc20addr)
    .filter(val => _.has(user.erc20token, val))
    .transform((acc, addr) => {
      acc[`erc20token.${addr}`] = 1;
    }, {})
    .value();

  try {
    await accountModel.update({address: addr}, {$unset: toRemove});
  } catch (e) {
    return res.send(messages.fail);
  }

  res.send(messages.success);
};
