const accountModel = require('../models/accountModel'),
  config = require('../config'),
  messages = require('../factories/messages/genericMessageFactory');

module.exports = {
    check: (req, res, next) => {
      if(!config.rest.auth)
        next();

      if(!res.user.address)
        res.status(401).send(messages.fail);
      else 
        next();      
    },
    isOwner: (res, address) => (res.user.address === address)
};