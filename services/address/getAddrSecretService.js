/**
 * Chronobank/eth-rest 
 * @module service/getAddrSecretService
 * @returns {undefined}
 */

const accountModel = require('../../models/accountModel'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.chronoErc20Processor'}),
  messages = require('../../factories/messages/genericMessageFactory');

module.exports = async (req, res) => {

  const account = await accountModel.findOne({address: req.params.addr})
    .catch(e => log.error(e));
 
  const message = (req.body.secret && account && account.authenticate(req.body.secret)) ?
    {token: account.password} : messages.fail;

  res.send(message);
};
