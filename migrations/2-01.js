'use strict';

const bcrypt = require('bcryptjs');
const config = require('../config');

module.exports.id = '2.01';

module.exports.up = function (done) {
  let coll = this.db.collection(`${config.nodered.mongo.collectionPrefix}noderedusers`);
  coll.insert({
    username : 'admin',
    password : bcrypt.hashSync('123'),
    isActive : true,
    permissions : '*'
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${config.nodered.mongo.collectionPrefix}noderedstorages`);
  coll.remove({username : 'admin'}, done);
  done();
};
