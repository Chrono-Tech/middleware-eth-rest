/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 */

const accountModel = require('../../models/accountModel');

module.exports = async(address) => {
    return accountModel.findOne({address: address});
};