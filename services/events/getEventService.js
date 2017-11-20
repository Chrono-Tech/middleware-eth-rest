/**
 * Middleware service for handling ERC20 token smart contracts
 * @module service/getEventService
 * @requires query-to-mongo
 */

const queryToMongo = require('query-to-mongo'),
  _ = require('lodash');

/**
 * Handling for event queries
 * @param  {Object} req   Express Request
 * @param  {Object} res   Express Response
 * @param  {Object} model models/eventModel
 * @return {undefined}       
 */
module.exports = async (req, res, model) => {

  //convert query request to mongo's
  let q = queryToMongo(req.query);
  
  //retrieve all records, which satisfy the query
  let result = await model.find(q.criteria, q.options.fields)
    .sort(q.options.sort)
    .limit(q.options.limit);

  if(q.criteria.distinct)
    result = _.uniqBy(result, q.criteria.distinct);


  res.send(result);

};
