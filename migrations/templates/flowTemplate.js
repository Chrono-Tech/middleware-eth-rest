module.exports = (flow, id) => {

  return `
module.exports.id = '${id}';

/**
 * @description flow ${flow.path} update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.update(${JSON.stringify({path: flow.path, type: 'flows'})}, {
    $set: ${JSON.stringify(flow)}
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove(${JSON.stringify({path: flow.path, type: 'flows'})}, done);
};
`;

};
