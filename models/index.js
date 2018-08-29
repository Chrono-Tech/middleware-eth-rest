/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const requireAll = require('require-all'),
  models = requireAll({
    dirname: __dirname,
    filter: /(.+Model)\.js$/
  });

/** @function
 * @description prepare (init) the mongoose models
 *
 */

const init = () => {
  for (let modelName of Object.keys(models))
    ctx[modelName] = models[modelName]();
};

const ctx = {
  init: init
};

/** @factory
 * @return {{init: init, ...Models}}
 */

module.exports = ctx;
