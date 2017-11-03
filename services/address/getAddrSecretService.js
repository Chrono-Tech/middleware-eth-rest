const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory'),
  SECRET_FIELD = 'secret',
  _ = require('lodash');

module.exports = async (req, res) => {

  const account = await accountModel.findOne({address: req.params.addr});
 
  const message = (req.body.secret && account && account.compareSecret(req.body.secret)) ?
      {token: account[SECRET_FIELD]} : messages.fail;

    res.send(message);
};
