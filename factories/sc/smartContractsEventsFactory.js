const _ = require('lodash'),
  Web3 = require('web3'),
  web3 = new Web3(),
  requireAll = require('require-all'),
  fs = require('fs');


module.exports = (scPath, eventContract, networkId) => {

  let contractsRaw = {};

  if (fs.existsSync(scPath))
    contractsRaw = requireAll({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
      dirname: scPath,
      filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/
    });

  const multiEventHistoryAddress = _.get(contractsRaw, `${eventContract}.networks.${networkId}.address`);


  const contractEvents = _.chain(contractsRaw)
    .map(contract =>
      _.chain(contract.abi)
        .filter({type: 'event'})
        .map(ev => {
          ev.signature = web3.utils.sha3(`${ev.name}(${ev.inputs.map(input => input.type).join(',')})`);
          return ev;
        })
        .value()
    )
    .flattenDeep()
    .uniqBy('signature')
    .value();

  return {
    events: contractEvents,
    address: multiEventHistoryAddress.toLowerCase()
  }

};
