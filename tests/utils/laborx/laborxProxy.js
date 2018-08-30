/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const express = require('express'),
  app = express(),
  config = require('../../config');

const laborx = config.dev.laborx;
// respond with "hello world" when a GET request is made to the homepage
app.post('/api/v1/security/signin/signature/chronomint', function (req, res) {
  if (!req.headers.authorization) res.status(400).send('missing authorization header');
  
  const params = req.headers.authorization.split(' ');
  if (params[0] === 'Bearer' && params[1] === laborx.token) {
    res.status(200).send(JSON.stringify({
      addresses: {
        'ethereum-public-key': laborx.key,
        'eth-address': 'adasdasd'
      }
    }));
    return;
  }
  res.status(401).send('not right authorization token');
});


app.listen(laborx.proxyPort, function () {
  console.log('proxy listening on port ' + laborx.proxyPort  + '!');
});



