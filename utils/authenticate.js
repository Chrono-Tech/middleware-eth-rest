/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Middleware service for handling Authentication
 * @module utils/authenticate
 * @requires models/accountModel
 */

const config = require('../config'),
  messages = require('../factories/messages/genericMessageFactory');

module.exports = {
  /**
   * Middleware for user authentication
   * @return {Object} Output 401 error
   */
  check: (req, res, next) => {
    if (!config.rest.auth)
      next();

    if (!res.user.address)
      res.status(401).send(messages.fail);
    else
      next();
  },
  /**
   * [description]
   * @param  {Object} res     Express object
   * @param  {string} address Address to compare
   * @return {boolean}
   */
  isOwner: (res, address) => (res.user.address === address)
};
