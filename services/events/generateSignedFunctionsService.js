/**
 * Middleware service for handling ERC20 token smart contracts
 * @module service/getTXHistoryService
 * @requires web3
 */

const Promise = require('bluebird'),
  net = require('net'),
  contract = require('truffle-contract'),
  Web3 = require('web3'),
  config = require('../../config'),
  _ = require('lodash'),
  smartContracts = require('../../factories/sc/smartContractsFactory'),
  messagesGeneric = require('../../factories/messages/genericMessageFactory');

module.exports = async (req, res) => {

  /*  if (!req.params.hash)
   return res.send(messagesGeneric.notEnoughArgs);

   let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
   const web3 = new Web3();
   web3.setProvider(provider);

   let tx = await Promise.promisify(web3.eth.getTransaction)(req.params.hash);
   web3.currentProvider.connection.end();
   res.send(tx);*/

  if (!_.isArray(req.body))
    return res.send(messagesGeneric.notEnoughArgs);

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

  let calls = await Promise.all(_.chain(req.body)
    .map(async item => {

      let funcDefinition = item.func.split('.');

      let contractDefinition = smartContracts[funcDefinition[0]];

      if (!contractDefinition)
        return {};

      let callContract = contract(contractDefinition);
      callContract.setProvider(provider);
      let callContractInstance = await callContract.deployed();
      let data = web3.eth.contract(smartContracts[funcDefinition[0]].abi).at(callContractInstance.address)[funcDefinition[1]].getData(...item.args);
      return data;
    })
  );

  web3.currentProvider.connection.end();
  res.send(calls);

};
