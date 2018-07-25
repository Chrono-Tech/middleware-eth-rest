/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const express = require('express'),
  app = express(),
  config = require('../config');

// respond with "hello world" when a GET request is made to the homepage
app.post('/api/v1/security/signin/signature/addresses', function (req, res) {
  if (!req.headers.authorization) res.status(400).send('missing authorization header');
  
  const params = req.headers.authorization.split(' ');
  if (params[0] === 'Bearer' && params[1] === config.dev.signature) {
    res.status(200).send(JSON.stringify({
      'addresses': {
        'ethereum-public-key': config.dev['ethereum-public-key'],
        'waves-address': config.dev.accounts[0]
      }
    }));
    return;
  }
  res.status(401).send('not right authorization token');
});


app.listen(config.dev.proxyPort, function () {
  console.log('proxy listening on port ' + config.dev.proxyPort  + '!');
});



