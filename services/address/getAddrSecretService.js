/**
 * Chronobank/eth-rest 
 * @module service/getAddrSecretService
 * @returns {undefined}
 */

const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory'),
  _ = require('lodash');

module.exports = async (req, res) => {

  const account = await accountModel.findOne({address: req.params.addr})
  	.catch(e => console.error(e));
 
  const message = (req.body.secret && account && account.authenticate(req.body.secret)) ?
      {token: account.password} : messages.fail;

    res.send(message);
};
