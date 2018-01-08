'use strict';

module.exports.id = '3.01';

/**
 * @description address flow update
 * @param done
 */

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.update({
    'type': 'flows',
    'path': '2c9dd332.05334c'
  }, {
    $set: {
      'meta': {},
      'type': 'flows',
      'path': '2c9dd332.05334c',
      'body': [
        {
          'id': '5a35929d.0a716c',
          'type': 'http in',
          'z': '2c9dd332.05334c',
          'name': 'create addr',
          'url': '/addr',
          'method': 'post',
          'upload': false,
          'swaggerDoc': '',
          'x': 150,
          'y': 180,
          'wires': [
            [
              '6d052eef.a0912'
            ]
          ]
        },
        {
          'id': 'e4822e75.693fd',
          'type': 'http response',
          'z': '2c9dd332.05334c',
          'name': '',
          'statusCode': '',
          'x': 1350,
          'y': 180,
          'wires': []
        },
        {
          'id': '27b27b8e.9827a4',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo create addr',
          'mode': '1',
          'requestType': '1',
          'x': 650,
          'y': 180,
          'wires': [
            [
              '8ab75856.970bb8'
            ]
          ]
        },
        {
          'id': '8ab75856.970bb8',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = msg.payload.error.code === 11000 ? \n    factories.messages.address.existAddress :\n    factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 1115,
          'y': 183,
          'wires': [
            [
              'e4822e75.693fd'
            ]
          ]
        },
        {
          'id': '6d052eef.a0912',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform params',
          'func': '\nconst _ = global.get(\'_\');\n\nlet erc20token = _.chain(msg.payload.erc20tokens)\n    .transform((acc, addr) => {\n      acc[addr.toLowerCase()] = 0;\n    }, {})\n    .value();\n\n\nmsg.payload = {\n    model: \'EthAccount\', \n    request: {\n       address: msg.payload.address.toLowerCase(),\n       erc20token: erc20token,\n       nem: msg.payload.nem\n   }\n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 350,
          'y': 180,
          'wires': [
            [
              '27b27b8e.9827a4'
            ]
          ]
        },
        {
          'id': '65927d71.4e8c44',
          'type': 'http in',
          'z': '2c9dd332.05334c',
          'name': 'remove addr',
          'url': '/addr',
          'method': 'delete',
          'upload': false,
          'swaggerDoc': '',
          'x': 150,
          'y': 340,
          'wires': [
            [
              '316484c0.63001c'
            ]
          ]
        },
        {
          'id': 'd0426981.27e8a8',
          'type': 'http response',
          'z': '2c9dd332.05334c',
          'name': '',
          'statusCode': '',
          'x': 1050,
          'y': 340,
          'wires': []
        },
        {
          'id': '7c68e0a0.c140d',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '3',
          'x': 610,
          'y': 340,
          'wires': [
            [
              'cdd0bdcd.24b59'
            ]
          ]
        },
        {
          'id': 'cdd0bdcd.24b59',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 820,
          'y': 340,
          'wires': [
            [
              'd0426981.27e8a8'
            ]
          ]
        },
        {
          'id': '316484c0.63001c',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform params',
          'func': '\nmsg.payload = {\n    model: \'EthAccount\', \n    request: {\n       address: msg.payload.address.toLowerCase()\n   }\n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 350,
          'y': 340,
          'wires': [
            [
              '7c68e0a0.c140d'
            ]
          ]
        },
        {
          'id': '564cd86a.7d34d8',
          'type': 'http in',
          'z': '2c9dd332.05334c',
          'name': 'add erc20',
          'url': '/addr/:addr/token',
          'method': 'post',
          'upload': false,
          'swaggerDoc': '',
          'x': 60,
          'y': 500,
          'wires': [
            [
              '4ce9b6d1.fbf3f8',
              '57d1ce3.87e913'
            ]
          ]
        },
        {
          'id': 'd8755eab.f3e54',
          'type': 'http response',
          'z': '2c9dd332.05334c',
          'name': '',
          'statusCode': '',
          'x': 1411,
          'y': 500,
          'wires': []
        },
        {
          'id': 'aa22bc0a.a85cf',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '2',
          'x': 1045,
          'y': 464,
          'wires': [
            [
              '48b8b6ef.8ac958'
            ]
          ]
        },
        {
          'id': '48b8b6ef.8ac958',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 1223,
          'y': 464,
          'wires': [
            [
              'd8755eab.f3e54'
            ]
          ]
        },
        {
          'id': '4ce9b6d1.fbf3f8',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform params',
          'func': '\n\nmsg.payload = {\n    model: \'EthAccount\', \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 259,
          'y': 444,
          'wires': [
            [
              '3a688a79.929cb6'
            ]
          ]
        },
        {
          'id': 'e164e510.1bd768',
          'type': 'join',
          'z': '2c9dd332.05334c',
          'name': '',
          'mode': 'custom',
          'build': 'array',
          'property': 'payload',
          'propertyType': 'msg',
          'key': 'topic',
          'joiner': '\\n',
          'joinerType': 'str',
          'accumulate': false,
          'timeout': '',
          'count': '2',
          'x': 584,
          'y': 498,
          'wires': [
            [
              '788b81cd.854b9'
            ]
          ]
        },
        {
          'id': '3a688a79.929cb6',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '0',
          'x': 465,
          'y': 444,
          'wires': [
            [
              'e164e510.1bd768'
            ]
          ]
        },
        {
          'id': '57d1ce3.87e913',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'query',
          'func': '\n\nmsg.payload = [{\n  address: msg.req.params.addr,\n  erc20tokens: msg.payload.erc20tokens\n}];\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 330,
          'y': 501,
          'wires': [
            [
              'e164e510.1bd768'
            ]
          ]
        },
        {
          'id': '3b167e6c.86e5e2',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': '',
          'func': '\nlet _ = global.get(\'_\');\n\nlet user = msg.payload[1][0];\nlet query = msg.payload[0][0];\n\n  const toAdd = _.chain(query.erc20tokens)\n    .map(addr=>addr.toLowerCase())\n    .reject(val => _.has(user.erc20token, val))\n    .transform((acc, addr) => {\n      acc[`erc20token.${addr}`] = 0;\n    }, {})\n    .value();\n\n\nmsg.payload = {\n    model: \'EthAccount\', \n    request: [{address: user.address}, {$set: toAdd}]\n   \n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 897,
          'y': 465,
          'wires': [
            [
              'aa22bc0a.a85cf'
            ]
          ]
        },
        {
          'id': '788b81cd.854b9',
          'type': 'switch',
          'z': '2c9dd332.05334c',
          'name': '',
          'property': 'payload[1][0]',
          'propertyType': 'msg',
          'rules': [
            {
              't': 'nnull'
            },
            {
              't': 'null'
            }
          ],
          'checkall': 'true',
          'outputs': 2,
          'x': 739,
          'y': 499,
          'wires': [
            [
              '3b167e6c.86e5e2'
            ],
            [
              'fb5fada6.0738e'
            ]
          ]
        },
        {
          'id': 'fb5fada6.0738e',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nlet factories = global.get("factories"); \n\n    \nmsg.payload = factories.messages.generic.fail;\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 1147,
          'y': 608,
          'wires': [
            [
              'd8755eab.f3e54'
            ]
          ]
        },
        {
          'id': 'ab703d2f.3a52f',
          'type': 'http in',
          'z': '2c9dd332.05334c',
          'name': 'remove erc20',
          'url': '/addr/:addr/token',
          'method': 'delete',
          'upload': false,
          'swaggerDoc': '',
          'x': 75,
          'y': 922.5,
          'wires': [
            [
              '7b1a621c.9f0d5c',
              '96bcd2ae.c0006'
            ]
          ]
        },
        {
          'id': '6738b594.b1247c',
          'type': 'http response',
          'z': '2c9dd332.05334c',
          'name': '',
          'statusCode': '',
          'x': 1416,
          'y': 922.5,
          'wires': []
        },
        {
          'id': '89650827.b33e98',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '2',
          'x': 1050,
          'y': 886.5,
          'wires': [
            [
              '15bc7bed.f70844'
            ]
          ]
        },
        {
          'id': '15bc7bed.f70844',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 1228,
          'y': 886.5,
          'wires': [
            [
              '6738b594.b1247c'
            ]
          ]
        },
        {
          'id': '7b1a621c.9f0d5c',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform params',
          'func': '\nmsg.payload = {\n    model: \'EthAccount\', \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 264,
          'y': 866.5,
          'wires': [
            [
              '67c7ccc.0094834'
            ]
          ]
        },
        {
          'id': '191feca2.b31993',
          'type': 'join',
          'z': '2c9dd332.05334c',
          'name': '',
          'mode': 'custom',
          'build': 'array',
          'property': 'payload',
          'propertyType': 'msg',
          'key': 'topic',
          'joiner': '\\n',
          'joinerType': 'str',
          'accumulate': false,
          'timeout': '',
          'count': '2',
          'x': 589,
          'y': 920.5,
          'wires': [
            [
              '70c0d489.250b1c'
            ]
          ]
        },
        {
          'id': '67c7ccc.0094834',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '0',
          'x': 470,
          'y': 866.5,
          'wires': [
            [
              '191feca2.b31993'
            ]
          ]
        },
        {
          'id': '96bcd2ae.c0006',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'query',
          'func': '\n\nmsg.payload = [{\n  address: msg.req.params.addr,\n  erc20tokens: msg.payload.erc20tokens\n}];\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 335,
          'y': 923.5,
          'wires': [
            [
              '191feca2.b31993'
            ]
          ]
        },
        {
          'id': '3a6a58b4.444e28',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': '',
          'func': '\nlet _ = global.get(\'_\');\n\nlet user = msg.payload[1][0];\nlet query = msg.payload[0][0];\n\n  const toRemove = _.chain(query.erc20tokens)\n    .map(addr=>addr.toLowerCase())\n    .filter(val => _.has(user.erc20token, val))\n    .transform((acc, addr) => {\n      acc[`erc20token.${addr}`] = 1;\n    }, {})\n    .value();\n\n\nmsg.payload = {\n    model: \'EthAccount\', \n    request: [{address: user.address}, {$unset: toRemove}]\n   \n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 902,
          'y': 887.5,
          'wires': [
            [
              '89650827.b33e98'
            ]
          ]
        },
        {
          'id': '70c0d489.250b1c',
          'type': 'switch',
          'z': '2c9dd332.05334c',
          'name': '',
          'property': 'payload[1][0]',
          'propertyType': 'msg',
          'rules': [
            {
              't': 'nnull'
            },
            {
              't': 'null'
            }
          ],
          'checkall': 'true',
          'outputs': 2,
          'x': 744,
          'y': 921.5,
          'wires': [
            [
              '3a6a58b4.444e28'
            ],
            [
              '3e8c8bed.c94f44'
            ]
          ]
        },
        {
          'id': '3e8c8bed.c94f44',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nlet factories = global.get("factories"); \n\n    \nmsg.payload = factories.messages.generic.fail;\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 1152,
          'y': 1030.5,
          'wires': [
            [
              '6738b594.b1247c'
            ]
          ]
        },
        {
          'id': '468de3dc.eb162c',
          'type': 'http in',
          'z': '2c9dd332.05334c',
          'name': 'balance',
          'url': '/addr/:addr/balance',
          'method': 'get',
          'upload': false,
          'swaggerDoc': '',
          'x': 126.250003814697,
          'y': 1343.75002098084,
          'wires': [
            [
              '6731d0f7.68fb4'
            ]
          ]
        },
        {
          'id': '6731d0f7.68fb4',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform params',
          'func': '\nmsg.payload = {\n    model: \'EthAccount\', \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 328.750007629395,
          'y': 1343.75001907349,
          'wires': [
            [
              'a66b89d5.08b868'
            ]
          ]
        },
        {
          'id': 'a66b89d5.08b868',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '0',
          'x': 518.750007629395,
          'y': 1345.00002002716,
          'wires': [
            [
              '36a27ede.06cd52'
            ]
          ]
        },
        {
          'id': '36a27ede.06cd52',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform output',
          'func': '\nconst _ = global.get(\'_\');\n\nmsg.payload = {\n  balance: _.get(msg.payload, \'0.balance\', 0),\n  erc20token: _.get(msg.payload, \'0.erc20token\', {})\n}\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 712.500011444092,
          'y': 1345.00002002716,
          'wires': [
            [
              '6e227f25.b210e'
            ]
          ]
        },
        {
          'id': '6e227f25.b210e',
          'type': 'http response',
          'z': '2c9dd332.05334c',
          'name': '',
          'statusCode': '',
          'x': 947.500011444092,
          'y': 1343.75002002716,
          'wires': []
        },
        {
          'id': 'e859d127.685df',
          'type': 'catch',
          'z': '2c9dd332.05334c',
          'name': '',
          'scope': [
            '564cd86a.7d34d8',
            '468de3dc.eb162c',
            'edc524a.f0b1ed8',
            '5a35929d.0a716c',
            '3a6a58b4.444e28',
            '3b167e6c.86e5e2',
            'd0426981.27e8a8',
            '2e2f80ee.29994',
            'e4822e75.693fd',
            '6e227f25.b210e',
            '6738b594.b1247c',
            'd8755eab.f3e54',
            'e164e510.1bd768',
            '191feca2.b31993',
            'aa22bc0a.a85cf',
            '3a688a79.929cb6',
            '7c68e0a0.c140d',
            '67c7ccc.0094834',
            'a66b89d5.08b868',
            '89650827.b33e98',
            '232cf783.a96748',
            'dee6708f.9e557',
            'b09ea136.52855',
            '96bcd2ae.c0006',
            '57d1ce3.87e913',
            '65927d71.4e8c44',
            'ab703d2f.3a52f',
            '788b81cd.854b9',
            '70c0d489.250b1c',
            'd47923c.db3aae',
            'cdd0bdcd.24b59',
            'fb5fada6.0738e',
            '36a27ede.06cd52',
            '15bc7bed.f70844',
            '3e8c8bed.c94f44',
            '8ab75856.970bb8',
            '48b8b6ef.8ac958',
            '7b1a621c.9f0d5c',
            '6d052eef.a0912',
            '4ce9b6d1.fbf3f8',
            '316484c0.63001c',
            '6731d0f7.68fb4'
          ],
          'x': 137,
          'y': 1612,
          'wires': [
            [
              'd47923c.db3aae'
            ]
          ]
        },
        {
          'id': '2e2f80ee.29994',
          'type': 'http response',
          'z': '2c9dd332.05334c',
          'name': '',
          'statusCode': '',
          'x': 594,
          'y': 1613,
          'wires': []
        },
        {
          'id': 'd47923c.db3aae',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform',
          'func': '\nlet factories = global.get("factories"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n   \nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 378,
          'y': 1612,
          'wires': [
            [
              '2e2f80ee.29994'
            ]
          ]
        },
        {
          'id': 'edc524a.f0b1ed8',
          'type': 'catch',
          'z': '2c9dd332.05334c',
          'name': '',
          'scope': [
            '27b27b8e.9827a4'
          ],
          'x': 460,
          'y': 80,
          'wires': [
            [
              '46a7901e.31b49'
            ]
          ]
        },
        {
          'id': '46a7901e.31b49',
          'type': 'function',
          'z': '2c9dd332.05334c',
          'name': 'transform',
          'func': '\nlet factories = global.get("factories"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nif(error.code !== 11000)\nthrow new Error();\n\nmsg.payload = {\n    model: \'EthAccount\', \n    request: [\n        {address: msg.payload.request.address}, \n        {$set:{ nem: msg.payload.request.nem}}\n        ]\n   \n};\n\nreturn msg;',
          'outputs': 1,
          'noerr': 0,
          'x': 660,
          'y': 80,
          'wires': [
            [
              '8eb922da.30d21'
            ]
          ]
        },
        {
          'id': '8eb922da.30d21',
          'type': 'mongo',
          'z': '2c9dd332.05334c',
          'model': 'EthAccount',
          'request': '{}',
          'name': 'mongo',
          'mode': '1',
          'requestType': '2',
          'x': 870,
          'y': 80,
          'wires': [
            [
              '8ab75856.970bb8'
            ]
          ]
        }
      ]
    }
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({
    'type': 'flows',
    'path': '2c9dd332.05334c'
  }, done);
};
