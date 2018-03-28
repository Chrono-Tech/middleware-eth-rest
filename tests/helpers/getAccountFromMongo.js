const accountModel = require('../../models/accountModel');

module.exports = async(address) => {
    return accountModel.findOne({address: address});
};