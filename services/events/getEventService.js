const queryToMongo = require('query-to-mongo');

module.exports = async (req, res, model) => {

  //convert query request to mongo's
  let q = queryToMongo(req.query);
  //retrieve all records, which satisfy the query
  let result = await model.find(q.criteria, q.options.fields)
    .sort(q.options.sort)
    .limit(q.options.limit);

  res.send(result);

};
