const _ = require('lodash'),
  Promise = require('bluebird'),
  net = require('net'),
  Web3 = require('web3'),
  config = require('../../config'),
  messagesGeneric = require('../../factories/messages/genericMessageFactory'),
  messagesTx = require('../../factories/messages/txServiceMessageFactory');

module.exports = async (req, res) => {


  req.params.startBlock = _.toNumber(req.params.startBlock);
  req.params.endBlock = _.toNumber(req.params.endBlock) || req.params.startBlock + 100;

  if (!_.isNumber(req.params.startBlock))
    return res.send(messagesGeneric.fail);


  if(req.params.endBlock - req.params.startBlock > 100)
    return res.send(messagesTx.largeBock);

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

  let txs = [];

  for(let i = req.params.startBlock; i < req.params.endBlock; i++){
    let rawBlock = await Promise.promisify(web3.eth.getBlock)(i, true);
    rawBlock.transactions.forEach(tx=>{
      if([tx.to, tx.from].includes(req.params.addr))
        txs.push(tx);
    });
  }

  web3.currentProvider.connection.end();

  res.send(txs);

};
