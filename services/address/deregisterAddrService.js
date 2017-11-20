/**
 * Chronobank/eth-rest 
 * @module service/deregisterAddrService
 * @returns {undefined}
 */

const accountModel = require('../../models/accountModel'),
  auth = require('../../utils/authenticate'),
  messages = require('../../factories/messages/genericMessageFactory');

module.exports = async (req, res) => {

  if (!req.body.address)
    return res.send(messages.fail);

  try {
    await accountModel.remove({address: req.body.address.toLowerCase()});
    if(!auth.isOwner(res, req.body.address.toLowerCase()))
      throw new Error('Not owner');
  } catch (e) {
    return res.send(messages.fail);
  }
  res.send(messages.success);
};
