const _ = require('lodash'),
	accountModel = require('../models').accountModel,
	messages = require('../factories').messages.genericMessageFactory;

module.exports = async (router) => {
  router.post('/:addr/push', async (req, res) => {
    let obj = {};
    const addr = req.params.addr;
    const erc20addr = req.body.erc20tokens;
    const user = await accountModel.findOne({address: addr});
    
    if(!user) { return res.send(messages.fail) }
    
    const toAdd = _.chain(erc20addr)
      .filter(val => !_.has(user.erc20token, val))
      .transform((acc, addr) => {
        acc[`erc20token.${addr}`] = 0;
      }, {})
      .value();
    
    await accountModel.update({address: addr}, {$set: toAdd})
      .catch(err => console.error(err));
    
    res.send(messages.success);
  });

  router.delete('/:addr', async (req, res) => {
    const addr = req.params.addr;
    const erc20addr = req.body.erc20tokens;

    const user = await accountModel.findOne({address: addr});

    if(!user) { return res.send(messages.fail) }
    
    const toRemove = _.chain(erc20addr)
      .filter(val => _.has(user.erc20token, val))
      .transform((acc, addr) => {
        acc[`erc20token.${addr}`] = 1;
      }, {})
      .value();

    await accountModel.update({address: addr}, {$unset: toRemove})
      .catch(err => console.error(err));
    
    res.send(messages.success);
  });

};