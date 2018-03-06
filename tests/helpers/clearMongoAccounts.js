const accountModel = require('../../models/accountModel');


module.exports =  async function () {
    await accountModel.remove()
};