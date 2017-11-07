const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory'),
  _ = require('lodash');

module.exports = async (req, res) => {

  const account = await accountModel.findOne({address: req.params.addr});
 
  const message = (req.body.secret && account && account.authenticate(req.body.secret)) ?
      {token: account.password} : messages.fail;

    res.send(message);
};
