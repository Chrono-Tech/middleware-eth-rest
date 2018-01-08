const NodeRedStorageModel = require('../models/nodeRedStorageModel'),
  NodeRedMigrationModel = require('../models/migrationModel'),
  when = require('when'),
  _ = require('lodash'),
  fs = require('fs-extra'),
  flowTemplate = require('../migrations/templates/flowTemplate'),
  path = require('path');

let simpleLoad = (type, path, parse = true) => {
  return when.resolve((async () => {
    let storageDocument = await NodeRedStorageModel.findOne({type: type, path: path});

    if (!storageDocument || !storageDocument.body)
      return [];

    return parse ?
      JSON.parse(storageDocument.body) :
      storageDocument.body;
  })());

};

let simpleSave = (type, path, blob) => {

  return when.resolve((async () => {

    let storageDocument = await NodeRedStorageModel.findOne({type: type, path: path});
    if (!storageDocument || !storageDocument.body)
      storageDocument = new NodeRedStorageModel({type: type, path: path});

    storageDocument.body = JSON.stringify(blob);

    await NodeRedStorageModel.update({_id: storageDocument._id}, storageDocument, {
      upsert: true,
      setDefaultsOnInsert: true
    })
      .catch(e => {
        if (e.code !== 11000)
          return Promise.reject(e);
      });

  })());

};

let saveFlows = (blob) => {

  return when.resolve((async () => {

    let items = _.chain(blob)
      .groupBy('z')
      .toPairs()
      .map(pair => ({
        path: pair[0] === 'undefined' ? 'tabs' : pair[0],
        body: pair[1]
      })
      )
      .value();

    for (let item of items) {

      let storageDocument = await NodeRedStorageModel.findOne({type: 'flows', path: item.path});

      if (!storageDocument || !storageDocument.body)
        storageDocument = new NodeRedStorageModel({type: 'flows', path: item.path});

      if (!_.isEqual(storageDocument.body, item.body)) {
        let migrations = await NodeRedMigrationModel.find({});

        let newMigrationName = _.chain(migrations)
          .filter(m => m.id)
          .sortBy('id').last()
          .get('id', 0).split('.').head().toNumber()
          .round().add(1)
          .add(`.${item.path}`).value();

        await fs.writeFile(path.join(__dirname, '../migrations', `${newMigrationName.replace('.', '-')}.js`), flowTemplate(item, newMigrationName));
      }

      storageDocument.body = item.body;
      await NodeRedStorageModel.update({_id: storageDocument._id}, storageDocument, {
        upsert: true,
        setDefaultsOnInsert: true
      })
        .catch(e => {
          if (e.code !== 11000)
            return Promise.reject(e);
        });
    }
  })());

};

let loadFlows = () => {
  return when.resolve((async () => {

    let storageDocuments = await NodeRedStorageModel.find({type: 'flows'});

    if (!storageDocuments)
      return [];

    return _.chain(storageDocuments)
      .map(storageDocument => _.get(storageDocument, 'body', []))
      .flattenDeep()
      .uniqBy('id')
      .value();

  })());

};

let sortDocumentsIntoPaths = (documents) => {

  let sorted = {};
  for (let document of documents) {
    let p = path.dirname(document.path);
    if (p === '.')
      p = '';

    if (!sorted[p])
      sorted[p] = [];

    if (p !== '') {
      let bits = p.split('/');
      sorted[''].push(bits[0]);
      for (let j = 1; j < bits.length; j++) {
        // Add path to parent path.
        let mat = bits.slice(0, j).join('/');
        if (!sorted[mat])
          sorted[mat] = [];

        sorted[mat].push(bits[j]);
      }
    }
    let meta = JSON.parse(document.meta);
    meta.fn = path.basename(document.path);
    sorted[p].push(meta);
  }

  return sorted;
};

const mongodb = {
  init: () => when.resolve(), //thumb function

  getFlows: loadFlows,

  saveFlows: saveFlows,

  getCredentials: () => simpleLoad('credentials', '/', false),

  saveCredentials: credentials => simpleSave('credentials', '/', credentials),

  getSettings: () => simpleLoad('settings', '/'),

  saveSettings: settings => simpleSave('settings', '/', settings),

  getSessions: () => simpleLoad('sessions', '/'),

  saveSessions: sessions => simpleSave('sessions', '/', sessions),

  getLibraryEntry: (type, path) => {

    return when.resolve((async () => {
      let resolvedType = 'library-' + type;
      let storageDocument = await NodeRedMigrationModel.findOne({type: resolvedType, path: path});

      if (storageDocument)
        return JSON.parse(storageDocument.body);

      // Probably a directory listing...
      // Crudely return everything.
      let storageDocuments = await NodeRedMigrationModel.find({type: resolvedType});
      let result = sortDocumentsIntoPaths(storageDocuments);
      return result[path] || [];

    })());
  },

  saveLibraryEntry: (type, path, meta, body) => {

    return when.promise((async () => {
      let resolvedType = 'library-' + type;
      let storageDocument = await NodeRedMigrationModel.findOne({type: resolvedType, path: path});

      if (!storageDocument)
        storageDocument = new NodeRedMigrationModel({type: resolvedType, path: path});

      storageDocument.meta = JSON.stringify(meta);
      storageDocument.body = JSON.stringify(body);

      await storageDocument.save();
    })());
  }
};

module.exports = mongodb;
