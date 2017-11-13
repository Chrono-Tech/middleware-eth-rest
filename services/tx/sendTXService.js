/**
 * Middleware service for handling ERC20 token smart contracts
 * @module service/sendTXService
 * @requires web3
 */

const Promise = require('bluebird'),
  net = require('net'),
  Web3 = require('web3'),
  config = require('../../config'),
  messagesGeneric = require('../../factories/messages/genericMessageFactory');

module.exports = async (req, res) => {

  if (!req.body.tx)
    return res.send(messagesGeneric.fail);

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

  let response = await Promise.promisify(web3.eth.sendRawTransaction)(req.body.tx);

  web3.currentProvider.connection.end();

  res.send(response);

};
