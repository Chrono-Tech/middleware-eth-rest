/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const config = require('../config'),
  _ = require('lodash'),
  request = require('request');

module.exports = (options, res) => {
  return request( _.merge(options, {
    headers: {
      'Authorization': 'Bearer ' + config.dev.signature
    }
  }), res);
};
