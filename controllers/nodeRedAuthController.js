const NodeRedUserModel = require('../models/nodeRedUserModel'),
  when = require('when'),
  mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');

module.exports = {
  type: 'credentials',
  users: function (username) {
    return when.resolve((async () => {

      let UserModel = mongoose.red.models[NodeRedUserModel.collection.collectionName];
      let user = await UserModel.findOne({username: username, isActive: true});

      return user ?
        {username: user.username, permissions: user.permissions} : null;
    })());
  },
  authenticate: function (username, password) {
    return when.resolve((async () => {

      let UserModel = mongoose.red.models[NodeRedUserModel.collection.collectionName];
      let user = await UserModel.findOne({username: username, isActive: true});

      return user && bcrypt.compare(password, user.password) ?
        {username: user.username, permissions: user.permissions} : null;

    })());
  },
  default: function () {
    return when.resolve({anonymous: false});
  }
};
