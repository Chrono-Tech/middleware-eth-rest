/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const toQueryTests = require('./utils/converters/eventToQueryConverter');
  toEventArgsTests = require('./utils/converters/queryResultToEventArgsConverter');

module.exports = (ctx) => {

  describe('utils/eventToQueryConverter', () => toQueryTests(ctx));

  describe('utils/queryResultToEventArgsConverter', () => toEventArgsTests(ctx));

};
