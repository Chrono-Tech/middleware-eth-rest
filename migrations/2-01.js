'use strict';

const bcrypt = require('bcryptjs');

module.exports.id = '02';

module.exports.up = function (done) {
  let coll = this.db.collection('noderedusers');
  coll.insert({
    username : 'admin',
    password : bcrypt.hashSync('123'),
    isActive : true,
    permissions : '*'
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({username : 'admin'}, done);
  done();
};
