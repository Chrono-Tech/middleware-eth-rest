
module.exports.id = 'tabs';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow tabs update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({'path':'tabs','type':'flows'}, {
    $set: {'path':'tabs','body':[{'id':'e415e43d.f10178','type':'tab','label':'tx','disabled':false,'info':''},{'id':'2c9dd332.05334c','type':'tab','label':'address','disabled':false,'info':''},{'id':'11926f6d.95c3e1','type':'tab','label':'events','disabled':false,'info':''},{'id':'715242fa.0f30cc','type':'tab','label':'ChronoMint','disabled':false,'info':''},{'id':'4b764554.3a9cec','type':'tab','label':'AssetManager','disabled':false,'info':''}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({'path':'tabs','type':'flows'}, done);
};
