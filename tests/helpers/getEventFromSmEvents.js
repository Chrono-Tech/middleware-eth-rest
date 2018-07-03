/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 */

const _ = require('lodash');

module.exports = (smEvents, key) => {
    console.log(smEvents)
    return _.toPairs(smEvents)[key][1];
}