const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory');

module.exports = async (req, res) => {

  if (!req.body.address)
    return res.send(messages.fail);

  try {
    await accountModel.remove({address: req.body.address});
  } catch (e) {
    return res.send(messages.fail);
  }
  res.send(messages.success);

};
