const NodeRedStorageModel = require('../models/nodeRedStorageModel'),
  when = require('when'),
  path = require('path');

let simpleLoad = (type, path) => {

  return when.resolve((async () => {
    let storageDocument = await NodeRedStorageModel.findOne({type: type, path: path});

    if (!storageDocument || !storageDocument.body)
      return [];

    return typeof(storageDocument.body) === 'string' ?
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

  getFlows: () => simpleLoad('flows', '/'),

  saveFlows: flows => simpleSave('flows', '/', flows),

  getCredentials: () => simpleLoad('credentials', '/'),

  saveCredentials: credentials => simpleSave('credentials', '/', credentials),

  getSettings: () => simpleLoad('settings', '/'),

  saveSettings: settings => simpleSave('settings', '/', settings),

  getSessions: () => simpleLoad('sessions', '/'),

  saveSessions: sessions => simpleSave('sessions', '/', sessions),

  getLibraryEntry: (type, path) => {

    return when.resolve((async () => {
      let resolvedType = 'library-' + type;
      let storageDocument = await NodeRedStorageModel.findOne({type: resolvedType, path: path});

      if (storageDocument)
        return JSON.parse(storageDocument.body);

      // Probably a directory listing...
      // Crudely return everything.
      let storageDocuments = await NodeRedStorageModel.find({type: resolvedType});
      let result = sortDocumentsIntoPaths(storageDocuments);
      return result[path] || [];

    })());
  },

  saveLibraryEntry: (type, path, meta, body) => {

    return when.promise((async () => {
      let resolvedType = 'library-' + type;
      let storageDocument = await NodeRedStorageModel.findOne({type: resolvedType, path: path});

      if (!storageDocument)
        storageDocument = new NodeRedStorageModel({type: resolvedType, path: path});

      storageDocument.meta = JSON.stringify(meta);
      storageDocument.body = JSON.stringify(body);

      await storageDocument.save();
    })());
  }
};

module.exports = mongodb;
