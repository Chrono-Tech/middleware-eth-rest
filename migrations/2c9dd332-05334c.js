
module.exports.id = '2c9dd332.05334c';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow 2c9dd332.05334c update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"2c9dd332.05334c","type":"flows"}, {
    $set: {"path":"2c9dd332.05334c","body":[{"id":"27b27b8e.9827a4","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo create addr","mode":"1","requestType":"1","dbAlias":"primary.accounts","x":810,"y":180,"wires":[["fd1a3686.1bd028"]]},{"id":"7c68e0a0.c140d","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":770,"y":540,"wires":[["e7d143e1.bb6ec"]]},{"id":"316484c0.63001c","type":"function","z":"2c9dd332.05334c","name":"transform params","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\nmsg.address = msg.payload.address.toLowerCase();\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: [{\n       address: msg.address\n   }, {isActive: false}]\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":510,"y":540,"wires":[["7c68e0a0.c140d"]]},{"id":"468de3dc.eb162c","type":"http in","z":"2c9dd332.05334c","name":"balance","url":"/addr/:addr/balance","method":"get","upload":false,"swaggerDoc":"","x":90,"y":820,"wires":[["140e271b.4d1909"]]},{"id":"6731d0f7.68fb4","type":"function","z":"2c9dd332.05334c","name":"transform params","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":470,"y":820,"wires":[["a66b89d5.08b868"]]},{"id":"a66b89d5.08b868","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.accounts","x":660,"y":821.25000095367,"wires":[["36a27ede.06cd52"]]},{"id":"36a27ede.06cd52","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"\nconst _ = global.get('_');\n\nmsg.payload = {\n  balance: _.get(msg.payload, '0.balance', 0),\n  erc20token: _.get(msg.payload, '0.erc20token', {})\n}\n\nreturn msg;","outputs":1,"noerr":0,"x":853.750003814697,"y":821.25000095367,"wires":[["6e227f25.b210e"]]},{"id":"6e227f25.b210e","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":1088.750003814697,"y":820.00000095367,"wires":[]},{"id":"e859d127.685df","type":"catch","z":"2c9dd332.05334c","name":"","scope":["564cd86a.7d34d8","468de3dc.eb162c","5a35929d.0a716c","3b167e6c.86e5e2","3a6a58b4.444e28","6e227f25.b210e","2e2f80ee.29994","d8755eab.f3e54","6738b594.b1247c","e4822e75.693fd","d0426981.27e8a8","e164e510.1bd768","191feca2.b31993","67c7ccc.0094834","7c68e0a0.c140d","89650827.b33e98","a66b89d5.08b868","aa22bc0a.a85cf","3a688a79.929cb6","8eb922da.30d21","96bcd2ae.c0006","57d1ce3.87e913","65927d71.4e8c44","ab703d2f.3a52f","788b81cd.854b9","70c0d489.250b1c","46a7901e.31b49","d47923c.db3aae","fb5fada6.0738e","8ab75856.970bb8","36a27ede.06cd52","48b8b6ef.8ac958","15bc7bed.f70844","3e8c8bed.c94f44","cdd0bdcd.24b59","316484c0.63001c","6731d0f7.68fb4","4ce9b6d1.fbf3f8","7b1a621c.9f0d5c","2d4e82d1.1d6b1e","d4152e22.23fbb"],"x":100,"y":920,"wires":[["d47923c.db3aae","82a83666.a276e8"]]},{"id":"2e2f80ee.29994","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":730,"y":900,"wires":[]},{"id":"d47923c.db3aae","type":"function","z":"2c9dd332.05334c","name":"transform","func":"\nlet factories = global.get(\"factories\"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n \nif (msg.statusCode == '401')\n    msg.payload = factories.messages.generic.failAuth;\n   \nreturn msg;","outputs":1,"noerr":0,"x":340,"y":920,"wires":[["692906ce.c34228"]]},{"id":"edc524a.f0b1ed8","type":"catch","z":"2c9dd332.05334c","name":"","scope":["27b27b8e.9827a4"],"x":620,"y":80,"wires":[["46a7901e.31b49"]]},{"id":"46a7901e.31b49","type":"function","z":"2c9dd332.05334c","name":"transform","func":"const factories = global.get(\"factories\");\n\nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nif(error.code !== 11000)\nthrow new Error(msg.error.message);\n\nmsg.payload = {\n    model: 'EthAccount', \n    request: [\n        {address: msg.payload.request.address}, \n        {$set: msg.payload.request.nem ? { \n            nem: msg.payload.request.nem,\n            isActive: true\n        } : {\n            isActive: true\n        }\n            \n        }\n        ]\n   \n};\n\nreturn msg;","outputs":1,"noerr":0,"x":820,"y":80,"wires":[["8eb922da.30d21"]]},{"id":"8eb922da.30d21","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":1030,"y":80,"wires":[["fd1a3686.1bd028"]]},{"id":"623d7287.8bfe9c","type":"async-function","z":"2c9dd332.05334c","name":"calc balance","func":"const factories = global.get('factories');\nconst _ = global.get('_');\nconst web3 = global.get('web3');\nconst prefix = global.get('settings.mongo.accountPrefix');\n\nlet balance = 0;\n\n\nlet erc20token = _.chain(msg.payload.erc20tokens)\n    .transform((acc, addr) => {\n      acc[addr.toLowerCase()] = 0;\n    }, {})\n    .value();\n\nmsg.address = msg.payload.address.toLowerCase();\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.payload.address.toLowerCase(),\n       erc20token: erc20token,\n       balance: balance,\n       isActive: true,\n       nem: msg.payload.nem\n       }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":510,"y":180,"wires":[["27b27b8e.9827a4"]]},{"id":"66d9378b.b5ca68","type":"amqp in","z":"2c9dd332.05334c","name":"post addresses","topic":"${config.rabbit.serviceName}.account.create","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":120,"y":260,"wires":[["e63736fc.ecaf58"]]},{"id":"e63736fc.ecaf58","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":310,"y":260,"wires":[["623d7287.8bfe9c"]]},{"id":"e69e2f39.1956d","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.created","iotype":"3","ioname":"events","server":"","servermode":"1","x":1330,"y":120,"wires":[]},{"id":"63ec21e7.0aa9b","type":"amqp in","z":"2c9dd332.05334c","name":"delete addresses","topic":"${config.rabbit.serviceName}.account.delete","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":120,"y":660,"wires":[["9966b6dc.782878"]]},{"id":"9966b6dc.782878","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":310,"y":660,"wires":[["316484c0.63001c"]]},{"id":"e7d143e1.bb6ec","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":1030,"y":560,"wires":[["9cbed3f4.973d1"]]},{"id":"9cbed3f4.973d1","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.deleted","iotype":"3","ioname":"events","server":"","servermode":"1","x":1170,"y":560,"wires":[]},{"id":"692906ce.c34228","type":"switch","z":"2c9dd332.05334c","name":"","property":"amqpMessage","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","outputs":2,"x":510,"y":920,"wires":[["2e2f80ee.29994"],["20e2bac.5686746","71f5d41.f7d1d2c"]]},{"id":"20e2bac.5686746","type":"async-function","z":"2c9dd332.05334c","name":"","func":"if(msg.error.message.includes('CONNECTION ERROR')){\n    await Promise.delay(5000);\n    await msg.amqpMessage.nackMsg();\n}else{\n    await msg.amqpMessage.ackMsg();\n}\n    \nmsg.payload = typeof msg.error.message;    \n    \nreturn msg;","outputs":1,"noerr":6,"x":730,"y":960,"wires":[[]]},{"id":"71f5d41.f7d1d2c","type":"debug","z":"2c9dd332.05334c","name":"","active":true,"console":"false","complete":"error","x":739.0729522705078,"y":1005.895881652832,"wires":[]},{"id":"82a83666.a276e8","type":"debug","z":"2c9dd332.05334c","name":"","active":true,"console":"false","complete":"error","x":283.0833282470703,"y":1074.9063186645508,"wires":[]},{"id":"3089efd5.1a8e5","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}_user.created","iotype":"3","ioname":"internal","server":"","servermode":"1","x":1320,"y":220,"wires":[]},{"id":"fd1a3686.1bd028","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":1130,"y":180,"wires":[["3089efd5.1a8e5","e69e2f39.1956d"]]},{"id":"12d55817.f522d8","type":"amqp in","z":"2c9dd332.05334c","name":"create addr","topic":"address.created","iotype":"1","ioname":"profiles","noack":"0","durablequeue":"0","durableexchange":"1","server":"","servermode":"1","x":110,"y":160,"wires":[["d7824ab5.ea3128"]]},{"id":"d7824ab5.ea3128","type":"laborx_get_addr","z":"2c9dd332.05334c","addr":"","name":"laborx_get_addr","x":300,"y":180,"wires":[["623d7287.8bfe9c"]]},{"id":"89876d78.4a617","type":"amqp in","z":"2c9dd332.05334c","name":"delete addr","topic":"address.deleted","iotype":"1","ioname":"profiles","noack":"0","durablequeue":"0","durableexchange":"1","server":"","servermode":"1","x":80,"y":480,"wires":[["171969bd.63a006"]]},{"id":"171969bd.63a006","type":"laborx_get_addr","z":"2c9dd332.05334c","addr":"","name":"laborx_get_addr","x":280,"y":500,"wires":[["316484c0.63001c"]]},{"id":"140e271b.4d1909","type":"laborx_auth","z":"2c9dd332.05334c","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":250,"y":820,"wires":[["6731d0f7.68fb4"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"2c9dd332.05334c","type":"flows"}, done);
};
