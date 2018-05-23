
module.exports.id = '26.e415e43d.f10178';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow e415e43d.f10178 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({'path':'e415e43d.f10178','type':'flows'}, {
    $set: {'path':'e415e43d.f10178','body':[{'id':'6b2f3912.a09f08','type':'http response','z':'e415e43d.f10178','name':'','statusCode':'','x':1018.5,'y':395.5,'wires':[]},{'id':'12413869.ddc528','type':'http in','z':'e415e43d.f10178','name':'tx','url':'/tx/:hash','method':'get','upload':false,'swaggerDoc':'','x':288.75,'y':395.5,'wires':[['b7cddb28.6e1828']]},{'id':'b7cddb28.6e1828','type':'function','z':'e415e43d.f10178','name':'transform params','func':'const prefix = global.get(\'settings.mongo.collectionPrefix\');\n\nmsg.payload ={ \n    model: `${prefix}TX`, \n    request: {\n      _id: msg.req.params.hash\n  }\n};\n\nreturn msg;','outputs':1,'noerr':0,'x':478.750007629395,'y':395.50000381469704,'wires':[['755ca9a1.cdbfc8','7680330c.33e24c']]},{'id':'b68ffffb.8e49e','type':'catch','z':'e415e43d.f10178','name':'','scope':null,'x':307,'y':585,'wires':[['49075d44.432d44','cf9070d6.5ab8d']]},{'id':'5c2fd91f.e496a8','type':'http response','z':'e415e43d.f10178','name':'','statusCode':'','x':764,'y':586,'wires':[]},{'id':'49075d44.432d44','type':'function','z':'e415e43d.f10178','name':'transform','func':'\nlet factories = global.get("factories"); \n\nmsg.payload = factories.messages.generic.fail;\n    \nreturn msg;','outputs':1,'noerr':0,'x':548,'y':585,'wires':[['5c2fd91f.e496a8']]},{'id':'cf9070d6.5ab8d','type':'debug','z':'e415e43d.f10178','name':'','active':true,'console':'false','complete':'error','x':451,'y':539,'wires':[]},{'id':'cb93a20a.bb5d3','type':'http in','z':'e415e43d.f10178','name':'history','url':'/tx/:addr/history','method':'get','upload':false,'swaggerDoc':'','x':281,'y':237,'wires':[['e558bff.7e2784']]},{'id':'e558bff.7e2784','type':'function','z':'e415e43d.f10178','name':'','func':'const prefix = global.get(\'settings.mongo.collectionPrefix\');\nconst _ = global.get(\'_\');\n\nmsg.address = msg.req.params.addr.toLowerCase();\n\n\nmsg.payload ={ \n    model: `${prefix}TX`, \n    request: {\n      $or: [\n        {\'to\': msg.address},\n        {\'from\': msg.address}\n      ]\n  },\n  options: {\n      sort: {timestamp: -1},\n      limit: parseInt(msg.req.query.limit) || 100,\n      skip: parseInt(msg.req.query.skip) || 0\n  }\n};\n\nreturn msg;','outputs':1,'noerr':0,'x':421,'y':237,'wires':[['45ab2beb.917bc4']]},{'id':'45ab2beb.917bc4','type':'mongo','z':'e415e43d.f10178','model':'','request':'{}','options':'{}','name':'mongo','mode':'1','requestType':'0','dbAlias':'primary.data','x':603,'y':237,'wires':[['4442f4c7.f8858c']]},{'id':'ab0df8ed.00d388','type':'http response','z':'e415e43d.f10178','name':'','statusCode':'','x':944,'y':236,'wires':[]},{'id':'755ca9a1.cdbfc8','type':'mongo','z':'e415e43d.f10178','model':'','request':'{}','options':'{}','name':'mongo','mode':'1','requestType':'0','dbAlias':'primary.data','x':675,'y':395,'wires':[['a3dba2cb.a99a5','7680330c.33e24c']]},{'id':'a3dba2cb.a99a5','type':'function','z':'e415e43d.f10178','name':'transform output','func':'const _ = global.get(\'_\');\n\n\nmsg.payload = _.get(msg.payload, \'0\', {});\n\nif(msg.payload._id){\n    msg.payload.hash = msg.payload._id;\n    delete msg.payload._id;\n}\n\n\nreturn msg;','outputs':1,'noerr':0,'x':842,'y':395,'wires':[['6b2f3912.a09f08']]},{'id':'7680330c.33e24c','type':'debug','z':'e415e43d.f10178','name':'','active':true,'console':'false','complete':'false','x':743,'y':463,'wires':[]},{'id':'4442f4c7.f8858c','type':'function','z':'e415e43d.f10178','name':'transform output','func':'\nmsg.payload = msg.payload.map(tx=>{\n   tx.hash = tx._id;\n   delete tx._id;\n   return tx;\n});\n\nreturn msg;','outputs':1,'noerr':0,'x':776.0694732666016,'y':236.24308013916016,'wires':[['ab0df8ed.00d388']]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({'path':'e415e43d.f10178','type':'flows'}, done);
};
