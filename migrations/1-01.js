'use strict';

module.exports.id = '1.01';

/**
 * @description tx flow
 * @param done
 */

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.insert({
    'meta': {},
    'type': 'flows',
    'path': 'e415e43d.f10178',
    'body': [
      {
        'id': 'd6a414d4.4d3f58',
        'type': 'web3',
        'z': 'e415e43d.f10178',
        'mode': '1',
        'method': 'web3_clientVersion',
        'params': [
          '55'
        ],
        'name': 'web3',
        'x': 815.000015258789,
        'y': 263.750003814697,
        'wires': [
          [
            'bc865a57.2be5f8'
          ]
        ]
      },
      {
        'id': '12389700.950d89',
        'type': 'http response',
        'z': 'e415e43d.f10178',
        'name': '',
        'statusCode': '',
        'x': 1397.50001907349,
        'y': 283.750003814697,
        'wires': []
      },
      {
        'id': '56898567.f2105c',
        'type': 'http in',
        'z': 'e415e43d.f10178',
        'name': 'history',
        'url': '/tx/:addr/history/:startBlock/:endBlock',
        'method': 'get',
        'upload': false,
        'swaggerDoc': '',
        'x': 270,
        'y': 260,
        'wires': [
          [
            'c94cf16f.f9c25'
          ]
        ]
      },
      {
        'id': '6cb71338.08ce1c',
        'type': 'function',
        'z': 'e415e43d.f10178',
        'name': 'filter txs',
        'func': 'const _ = global.get(\'_\');\n\n\nlet address = msg.req.params.addr.toLowerCase();\n\nmsg.payload = _.chain(msg.payload)\n.filter(block=> _.has(block, \'transactions\'))\n.map(block=>block.transactions)\n.flattenDeep()\n.filter(tx=>[tx.to, tx.from].includes(address))\n.value()\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 1160.00001525879,
        'y': 263.750003814697,
        'wires': [
          [
            '12389700.950d89'
          ]
        ]
      },
      {
        'id': 'c94cf16f.f9c25',
        'type': 'function',
        'z': 'e415e43d.f10178',
        'name': 'transform params',
        'func': '\nconst _ = global.get(\'_\');\n\n/*msg.payload = {\n    address: msg.req.params.addr,\n    startBlock: msg.req.params.startBlock,\n    endBlock: msg.req.params.endBlock\n}*/\n\nlet start = parseInt(msg.req.params.startBlock);\nlet end = parseInt(msg.req.params.endBlock);\n\n\nmsg.payload = _.chain(new Array(end - start))\n.map((e, i)=>({\n    method: \'eth_getBlockByNumber\',\n    params: [start + i, true]\n})).value()\n\n\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 460.000007629395,
        'y': 260.000003814697,
        'wires': [
          [
            'e3b7b3c3.c4b1a'
          ]
        ]
      },
      {
        'id': 'e3b7b3c3.c4b1a',
        'type': 'split',
        'z': 'e415e43d.f10178',
        'name': '',
        'splt': '\\n',
        'spltType': 'str',
        'arraySplt': 1,
        'arraySpltType': 'len',
        'stream': false,
        'addname': '',
        'x': 660.000009536743,
        'y': 262.500003814697,
        'wires': [
          [
            'd6a414d4.4d3f58',
            'a0517c8d.c029'
          ]
        ]
      },
      {
        'id': 'bc865a57.2be5f8',
        'type': 'join',
        'z': 'e415e43d.f10178',
        'name': '',
        'mode': 'auto',
        'build': 'string',
        'property': 'payload',
        'propertyType': 'msg',
        'key': 'topic',
        'joiner': '\\n',
        'joinerType': 'str',
        'accumulate': false,
        'timeout': '',
        'count': '',
        'x': 985,
        'y': 261.25,
        'wires': [
          [
            '6cb71338.08ce1c'
          ]
        ]
      },
      {
        'id': 'a0517c8d.c029',
        'type': 'debug',
        'z': 'e415e43d.f10178',
        'name': '',
        'active': true,
        'console': 'false',
        'complete': 'false',
        'x': 786.25,
        'y': 162.5,
        'wires': []
      },
      {
        'id': '620e0f8.ccd2bf',
        'type': 'web3',
        'z': 'e415e43d.f10178',
        'mode': '1',
        'method': 'eth_getTransactionByHash',
        'params': [],
        'name': 'web3',
        'x': 710.000011444092,
        'y': 588.750008583069,
        'wires': [
          [
            '70fb1e14.f84a2',
            '6b2f3912.a09f08'
          ]
        ]
      },
      {
        'id': '6b2f3912.a09f08',
        'type': 'http response',
        'z': 'e415e43d.f10178',
        'name': '',
        'statusCode': '',
        'x': 907.500019073486,
        'y': 587.500009536743,
        'wires': []
      },
      {
        'id': '12413869.ddc528',
        'type': 'http in',
        'z': 'e415e43d.f10178',
        'name': 'tx',
        'url': '/tx/:hash',
        'method': 'get',
        'upload': false,
        'swaggerDoc': '',
        'x': 288.75,
        'y': 587.499996185303,
        'wires': [
          [
            'b7cddb28.6e1828'
          ]
        ]
      },
      {
        'id': 'b7cddb28.6e1828',
        'type': 'function',
        'z': 'e415e43d.f10178',
        'name': 'transform params',
        'func': 'msg.payload ={\n    method: \'eth_getTransactionByHash\',\n    params: [msg.req.params.hash]\n}\n\n\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 478.750007629395,
        'y': 587.5,
        'wires': [
          [
            '620e0f8.ccd2bf'
          ]
        ]
      },
      {
        'id': '70fb1e14.f84a2',
        'type': 'debug',
        'z': 'e415e43d.f10178',
        'name': '',
        'active': true,
        'console': 'false',
        'complete': 'false',
        'x': 920.000011444092,
        'y': 498.750007629395,
        'wires': []
      },
      {
        'id': 'b68ffffb.8e49e',
        'type': 'catch',
        'z': 'e415e43d.f10178',
        'name': '',
        'scope': null,
        'x': 301,
        'y': 780,
        'wires': [
          [
            '49075d44.432d44'
          ]
        ]
      },
      {
        'id': '5c2fd91f.e496a8',
        'type': 'http response',
        'z': 'e415e43d.f10178',
        'name': '',
        'statusCode': '',
        'x': 758,
        'y': 781,
        'wires': []
      },
      {
        'id': '49075d44.432d44',
        'type': 'function',
        'z': 'e415e43d.f10178',
        'name': 'transform',
        'func': '\nlet factories = global.get("factories"); \n\nmsg.payload = factories.messages.generic.fail;\n    \nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 542,
        'y': 780,
        'wires': [
          [
            '5c2fd91f.e496a8'
          ]
        ]
      }
    ]
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({
    'type': 'flows',
    'path': 'e415e43d.f10178'
  }, done);
  done();
};
