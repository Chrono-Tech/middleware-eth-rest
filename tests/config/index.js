/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const config = require('../../config');
config.dev = {
  url: 'http://' + config.rest.domain + ':' + config.rest.port,
  laborx: {
    proxyPort: 3001,
    key: 'sdfsdfsf',
    token: '123123123123'
  }
};

module.exports = config;