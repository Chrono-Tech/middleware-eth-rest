
module.exports.id = '23.4b764554.3a9cec';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow 4b764554.3a9cec update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"4b764554.3a9cec","type":"flows"}, {
    $set: {"path":"4b764554.3a9cec","body":[{"id":"92971ba0.f46588","type":"http in","z":"4b764554.3a9cec","name":"get issues","url":"/events/mint/issues","method":"get","upload":false,"swaggerDoc":"","x":100,"y":500,"wires":[["4f553410.2de05c"]]},{"id":"b480b4fe.002428","type":"function","z":"4b764554.3a9cec","name":"transform params","func":"const _ = global.get('_');\n\n\nconst issueCriteria = _.chain(msg.payload.criteria)\n.toPairs()\n.filter(pair=>pair[0].includes('issue.'))\n.map(pair=>[[pair[0].replace('issue.', '')], pair[1]])\n.fromPairs()\n.value();\n\n\nconst revokeCriteria = _.chain(msg.payload.criteria)\n.toPairs()\n.filter(pair=>pair[0].includes('revoke.'))\n.map(pair=>[[pair[0].replace('revoke.', '')], pair[1]])\n.fromPairs()\n.value();\n\nmsg.payload = [\n    {\n        model: 'Issue',\n        request: issueCriteria\n    }, \n    {\n        model: 'Revoke',\n        request: revokeCriteria\n    }\n    ];\n\nreturn msg;","outputs":1,"noerr":0,"x":490,"y":500,"wires":[["11a6009b.7634ff"]]},{"id":"3ec6d68b.1200fa","type":"http response","z":"4b764554.3a9cec","name":"","statusCode":"","headers":{},"x":1630,"y":500,"wires":[]},{"id":"24152db7.a29162","type":"mongo","z":"4b764554.3a9cec","model":"","request":"","options":"","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":970,"y":500,"wires":[["6be91a9.2e491e4"]]},{"id":"81608156.a74c9","type":"catch","z":"4b764554.3a9cec","name":"","scope":null,"x":470,"y":693.5,"wires":[["8f8c1bb7.feb598","aa1840d1.e7835"]]},{"id":"2c2f926b.890f1e","type":"http response","z":"4b764554.3a9cec","name":"","statusCode":"","x":927,"y":694.5,"wires":[]},{"id":"8f8c1bb7.feb598","type":"function","z":"4b764554.3a9cec","name":"transform","func":"\nlet factories = global.get(\"factories\"); \n\nmsg.payload = factories.messages.generic.fail;\n    \nreturn msg;","outputs":1,"noerr":0,"x":711,"y":693.5,"wires":[["2c2f926b.890f1e"]]},{"id":"11a6009b.7634ff","type":"split","z":"4b764554.3a9cec","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":690,"y":500,"wires":[["88b32113.3569c"]]},{"id":"eb6b90ac.23cc9","type":"join","z":"4b764554.3a9cec","name":"","mode":"auto","build":"string","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":"false","timeout":"","count":"","x":1290,"y":500,"wires":[["1fa0d0ba.8aea8f"]]},{"id":"6be91a9.2e491e4","type":"function","z":"4b764554.3a9cec","name":"","func":"\n\nmsg.payload = {\n  type: msg.type,\n  items: msg.payload\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":1124,"y":500,"wires":[["eb6b90ac.23cc9"]]},{"id":"88b32113.3569c","type":"function","z":"4b764554.3a9cec","name":"","func":"\nmsg.type = msg.payload.model;\n\n\nreturn msg;","outputs":1,"noerr":0,"x":830,"y":500,"wires":[["24152db7.a29162"]]},{"id":"1fa0d0ba.8aea8f","type":"function","z":"4b764554.3a9cec","name":"","func":"const _ = global.get('_');\n\n\nmsg.payload = _.chain(msg.payload)\n.map(set=> \n    set.items.map(item=>\n    _.merge(item, {type: set.type})\n    )\n)\n.flattenDeep()\n.orderBy('created', 'desc');\n\nreturn msg;","outputs":1,"noerr":0,"x":1450,"y":500,"wires":[["3ec6d68b.1200fa"]]},{"id":"4f553410.2de05c","type":"query-to-mongo","z":"4b764554.3a9cec","request_type":"0","name":"query-to-mongo","x":280,"y":500,"wires":[["b480b4fe.002428"]]},{"id":"aa1840d1.e7835","type":"debug","z":"4b764554.3a9cec","name":"","active":true,"console":"false","complete":"error","x":692,"y":802,"wires":[]},{"id":"65dabc88.459d94","type":"http in","z":"4b764554.3a9cec","name":"get manager list by token","url":"/events/mint/managerListByToken","method":"get","upload":false,"swaggerDoc":"","x":130,"y":80,"wires":[["b0bb910a.558ac"]]},{"id":"b0bb910a.558ac","type":"query-to-mongo","z":"4b764554.3a9cec","request_type":"0","name":"query-to-mongo","x":400,"y":80,"wires":[["e63ad54f.36b598"]]},{"id":"e63ad54f.36b598","type":"function","z":"4b764554.3a9cec","name":"transform params","func":"const _ = global.get('_');\n\nmsg.symbols = Array.isArray(msg.payload.criteria.symbol) ? \nmsg.payload.criteria.symbol : [msg.payload.criteria.symbol];\n\nmsg.payload = \n    {\n        model: 'OwnershipChange',\n        request: {\n            symbol: msg.payload.criteria.symbol\n        },\n    };\n\nreturn msg;","outputs":1,"noerr":0,"x":650,"y":80,"wires":[["eae6dc94.5ccf5","4b2f282b.d58bb8"]]},{"id":"eae6dc94.5ccf5","type":"mongo","z":"4b764554.3a9cec","model":"","request":"","options":"","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":850,"y":80,"wires":[["4f597ea9.3f262"]]},{"id":"dbe41e9e.63366","type":"http response","z":"4b764554.3a9cec","name":"","statusCode":"","headers":{},"x":1210,"y":80,"wires":[]},{"id":"4f597ea9.3f262","type":"function","z":"4b764554.3a9cec","name":"","func":"const _ = global.get('_');\n\nlet items = {};\nconst zero = \"0x0000000000000000000000000000000000000000\";\nlet managerList = {};\nmsg.payload = msg.payload.sort((a, b) => {\n    if (a.created === b.created) {\n      return a.from !== zero;\n    }\n    return a.created > b.created;\n  }).map((item) => {\n      if (!managerList[item.from]) {\n          managerList[item.from] = 0\n      }\n      if (!managerList[item.to]) {\n          managerList[item.to] = 0\n      }\n      \n    managerList[item.from] -= 1;\n    managerList[item.to] += 1;\n  });\n\nmsg.payload = Object.entries(managerList).filter(item => item[1] > 0).map(item => item[0]);\nreturn msg;","outputs":1,"noerr":0,"x":1030,"y":80,"wires":[["dbe41e9e.63366"]]},{"id":"4b2f282b.d58bb8","type":"debug","z":"4b764554.3a9cec","name":"","active":true,"console":"false","complete":"true","x":870,"y":200,"wires":[]},{"id":"b7cd0f8.a962ff","type":"http in","z":"4b764554.3a9cec","name":"get issues","url":"/events/mint/platforms","method":"get","upload":false,"swaggerDoc":"","x":100,"y":360,"wires":[["e229bd73.53a07"]]},{"id":"1a5047dd.d5cbf8","type":"function","z":"4b764554.3a9cec","name":"transform params","func":"const _ = global.get('_');\n\nmsg.payload = [{\n    model: 'PlatformRequested',\n    request: {\n      by: msg.payload.criteria.by,\n    }\n  },\n  {\n    model: 'PlatformAttached',\n    request: {\n      by: msg.payload.criteria.by,\n    }\n  },\n  {\n    model: 'PlatformDetached',\n    request: {\n      by: msg.payload.criteria.by,\n    }\n  }\n];\n\nreturn msg;","outputs":1,"noerr":0,"x":490,"y":360,"wires":[["50b5dc93.5fc074"]]},{"id":"e874eab7.d0f718","type":"http response","z":"4b764554.3a9cec","name":"","statusCode":"","headers":{},"x":1630,"y":360,"wires":[]},{"id":"e6eeec2e.31237","type":"mongo","z":"4b764554.3a9cec","model":"","request":"","options":"","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":970,"y":360,"wires":[["7507b7b7.934e48"]]},{"id":"50b5dc93.5fc074","type":"split","z":"4b764554.3a9cec","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":690,"y":360,"wires":[["80d6d55a.1abc78"]]},{"id":"694ba7f6.91d328","type":"join","z":"4b764554.3a9cec","name":"","mode":"auto","build":"string","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":"false","timeout":"","count":"","x":1290,"y":360,"wires":[["a40db6c9.5c0a78"]]},{"id":"7507b7b7.934e48","type":"function","z":"4b764554.3a9cec","name":"","func":"\n\nmsg.payload = {\n  type: msg.type,\n  items: msg.payload\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":1124,"y":360,"wires":[["694ba7f6.91d328"]]},{"id":"80d6d55a.1abc78","type":"function","z":"4b764554.3a9cec","name":"","func":"\nmsg.type = msg.payload.model;\n\n\nreturn msg;","outputs":1,"noerr":0,"x":830,"y":360,"wires":[["e6eeec2e.31237"]]},{"id":"a40db6c9.5c0a78","type":"function","z":"4b764554.3a9cec","name":"","func":"const _ = global.get('_');\n\nlet result = {};\n\n_.chain(msg.payload)\n.map(set=> \n    set.items.map(item=>\n    _.merge(item, {type: set.type})\n    )\n)\n.flattenDeep()\n.orderBy('created', 'asc')\n.value()\n.map((item) => {\n  switch (item.type) {\n    case 'PlatformRequested':\n    case 'PlatformAttached':\n      result[ item.platform ] = item;\n      break;\n    case 'PlatformDetached':\n      if (result[ item.platform ]) {\n        delete result[ item.platform ];\n      }\n      break;\n  }\n});\n\nmsg.payload = Object.values(result);\n\nreturn msg;","outputs":1,"noerr":0,"x":1450,"y":360,"wires":[["e874eab7.d0f718"]]},{"id":"e229bd73.53a07","type":"query-to-mongo","z":"4b764554.3a9cec","request_type":"0","name":"query-to-mongo","x":280,"y":360,"wires":[["1a5047dd.d5cbf8"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"4b764554.3a9cec","type":"flows"}, done);
};
