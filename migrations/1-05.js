'use strict';

module.exports.id = '1.05';

/**
 * @description tabs flow settings
 * @param done
 */

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.insert({
    'meta': {},
    'type': 'flows',
    'path': 'tabs',
    'body': [
      {
        'id': 'e415e43d.f10178',
        'type': 'tab',
        'label': 'tx',
        'disabled': false,
        'info': ''
      },
      {
        'id': '2c9dd332.05334c',
        'type': 'tab',
        'label': 'address',
        'disabled': false,
        'info': ''
      },
      {
        'id': '11926f6d.95c3e1',
        'type': 'tab',
        'label': 'events',
        'disabled': false,
        'info': ''
      },
      {
        'id': 'fd816480.bb00b8',
        'type': 'tab',
        'label': 'sc',
        'disabled': false,
        'info': ''
      }
    ]
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({
    'type': 'flows',
    'path': 'tabs'
  }, done);
  done();
};
