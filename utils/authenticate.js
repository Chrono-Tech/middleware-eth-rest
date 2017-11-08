const accountModel = require('../models/accountModel'),
  messages = require('../factories/messages/genericMessageFactory');

module.exports = (req, res, next) => {
  if(!res.user.address)
    res.status(401).send(messages.fail);
  else 
    next();
};