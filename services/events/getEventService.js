/**
 * Middleware service for handling ERC20 token smart contracts
 * @module service/getEventService
 * @requires query-to-mongo
 */

const queryToMongo = require('query-to-mongo'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.chronoErc20Processor'});

/**
 * Handling for event queries
 * @param  {Object} req   Express Request
 * @param  {Object} res   Express Response
 * @param  {Object} model models/accountModel
 * @return {undefined}       
 */
module.exports = async (req, res, model) => {

  //convert query request to mongo's
  let q = queryToMongo(req.query);
  
  // Handling for distinct option
  if(q.criteria.distinct) {
    let result = await model.distinct(q.criteria.distinct)
      .catch(err => log.error(err));
    res.send(result);
    return;
  }
  
  //retrieve all records, which satisfy the query
  let result = await model.find(q.criteria, q.options.fields)
    .sort(q.options.sort)
    .limit(q.options.limit);

  res.send(result);

};
