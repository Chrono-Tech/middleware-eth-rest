
module.exports.id = '11926f6d.95c3e1';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow 11926f6d.95c3e1 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"11926f6d.95c3e1","type":"flows"}, {
    $set: {"path":"11926f6d.95c3e1","body":[{"id":"f71e4f8.f819fb","type":"http in","z":"11926f6d.95c3e1","name":"events","url":"/events","method":"get","upload":false,"swaggerDoc":"","x":190,"y":200,"wires":[["12e2a4a.b20b25b"]]},{"id":"12e2a4a.b20b25b","type":"function","z":"11926f6d.95c3e1","name":"transform params","func":"\nconst smEvents = global.get('factories.smEvents');\nconst _ = global.get('_');\n\n\nmsg.payload = smEvents.map(ev=>ev.name);\n\nreturn msg;","outputs":1,"noerr":0,"x":423.5,"y":199.50000667572021,"wires":[["c49a5649.c046a8"]]},{"id":"c49a5649.c046a8","type":"http response","z":"11926f6d.95c3e1","name":"","statusCode":"","x":647.500015258789,"y":199.25000333786,"wires":[]},{"id":"5a97720b.d0cc1c","type":"http in","z":"11926f6d.95c3e1","name":"get event","url":"/events/:event","method":"get","upload":false,"swaggerDoc":"","x":200,"y":320,"wires":[["b1cd37e5.74a048"]]},{"id":"26896dec.5a53d2","type":"function","z":"11926f6d.95c3e1","name":"transform params","func":"\nconst factories = global.get('factories');\nconst _ = global.get('_');\nconst prefix = global.get('settings.mongo.collectionPrefix');\nconst eventAddress = global.get('settings.events.address');\nconst eventToQueryConverter = global.get('libs.utils.converters.eventToQueryConverter');\n\n\nconst skip = parseInt(msg.req.query.skip) || 0;\nconst limit = parseInt(msg.req.query.limit) || 100;\n\nconst criteria = eventToQueryConverter(msg.req.params.event.toLowerCase(), msg.payload.criteria);\n\nif(!criteria){\n    msg.payload = [];\n    return msg;\n}\n\ncriteria.address = msg.payload.eventAddress || eventAddress;\n\n\nmsg.payload = { \n    model: `${prefix}TxLog`, \n    request: [\n            {$match: criteria},\n            {$skip: skip},\n            {$limit: limit > 100 ? 100 : limit}\n        ]\n};\n\n\nreturn msg;","outputs":1,"noerr":0,"x":590,"y":320,"wires":[["9c1b15d7.237468"]]},{"id":"2858f1ab.675c5e","type":"http response","z":"11926f6d.95c3e1","name":"","statusCode":"","x":1310,"y":360,"wires":[]},{"id":"b1cd37e5.74a048","type":"query-to-mongo","z":"11926f6d.95c3e1","request_type":"0","name":"query-to-mongo","x":376,"y":320.75,"wires":[["26896dec.5a53d2"]]},{"id":"5b0b9e21.6451c","type":"mongo","z":"11926f6d.95c3e1","model":"","request":"","options":"","name":"mongo","mode":"1","requestType":"4","dbAlias":"primary.data","x":970,"y":360,"wires":[["ee180ae3.7e16a8"]]},{"id":"98d44384.a7dde","type":"catch","z":"11926f6d.95c3e1","name":"","scope":null,"x":200,"y":500,"wires":[["555b9a3a.231ad4","4fb7ef71.775ad"]]},{"id":"5410ef0.54afe1","type":"http response","z":"11926f6d.95c3e1","name":"","statusCode":"","x":657,"y":501,"wires":[]},{"id":"555b9a3a.231ad4","type":"function","z":"11926f6d.95c3e1","name":"transform","func":"\nlet factories = global.get(\"factories\"); \n\nmsg.payload = factories.messages.generic.fail;\n    \nreturn msg;","outputs":1,"noerr":0,"x":441,"y":500,"wires":[["5410ef0.54afe1"]]},{"id":"4fb7ef71.775ad","type":"debug","z":"11926f6d.95c3e1","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"error","x":430,"y":620,"wires":[]},{"id":"9c1b15d7.237468","type":"switch","z":"11926f6d.95c3e1","name":"","property":"payload.request","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","repair":false,"outputs":2,"x":790,"y":320,"wires":[["813160af.3f7fe"],["5b0b9e21.6451c"]]},{"id":"813160af.3f7fe","type":"http response","z":"11926f6d.95c3e1","name":"","statusCode":"","x":970,"y":260,"wires":[]},{"id":"ee180ae3.7e16a8","type":"function","z":"11926f6d.95c3e1","name":"","func":"const _ = global.get('_');\nconst queryResultToEventArgsConverter = global.get('libs.utils.converters.queryResultToEventArgsConverter');\n\nmsg.payload = queryResultToEventArgsConverter(msg.req.params.event.toLowerCase(), msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":1130,"y":360,"wires":[["2858f1ab.675c5e"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"11926f6d.95c3e1","type":"flows"}, done);
};
