const _ = require('lodash');

module.exports = (smEvents, key) => {
    return _.toPairs(smEvents)[key][1];
}