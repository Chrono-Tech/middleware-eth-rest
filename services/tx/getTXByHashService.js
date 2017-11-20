/**
 * Middleware service for handling ERC20 token smart contracts
 * @module service/getTXHistoryService
 * @requires web3
 */

const Promise = require('bluebird'),
  net = require('net'),
  Web3 = require('web3'),
  config = require('../../config'),
  messagesGeneric = require('../../factories/messages/genericMessageFactory');

module.exports = async (req, res) => {

  if (!req.params.hash)
    return res.send(messagesGeneric.notEnoughArgs);

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

  let tx = await Promise.promisify(web3.eth.getTransaction)(req.params.hash);
  web3.currentProvider.connection.end();
  res.send(tx);
};
