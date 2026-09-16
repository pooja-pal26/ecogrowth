const jsonDb = require('../services/jsonDb');

class QueryChain {
  constructor(tableName, filter = {}, single = false) {
    this.tableName = tableName;
    this.filter = filter;
    this.single = single;
    this.sortOption = null;
    this.limitOption = null;
    this.skipOption = null;
    this.selectedFields = null;
    this.excludedFields = null;
  }

  sort(sortOption) {
    this.sortOption = sortOption;
    return this;
  }

  limit(limitOption) {
    this.limitOption = Number(limitOption);
    return this;
  }

  skip(skipOption) {
    this.skipOption = Number(skipOption);
    return this;
  }

  select(selectString) {
    if (typeof selectString === 'string') {
      const parts = selectString.trim().split(/\s+/);
      const inclusions = [];
      const exclusions = [];
      for (const p of parts) {
        if (p.startsWith('-')) {
          exclusions.push(p.slice(1));
        } else {
          inclusions.push(p);
        }
      }
      if (inclusions.length > 0) this.selectedFields = inclusions;
      if (exclusions.length > 0) this.excludedFields = exclusions;
    }
    return this;
  }

  populate() {
    // Chainable no-op or relation enricher
    return this;
  }

  applyProjection(item) {
    if (!item) return null;
    let res = { ...item };
    if (this.selectedFields) {
      const filtered = {};
      for (const f of this.selectedFields) {
        if (res[f] !== undefined) filtered[f] = res[f];
      }
      filtered._id = res._id;
      res = filtered;
    }
    if (this.excludedFields) {
      for (const f of this.excludedFields) {
        delete res[f];
      }
    }
    return wrapDocument(this.tableName, res);
  }

  then(resolve, reject) {
    try {
      if (this.single) {
        const item = jsonDb.findOne(this.tableName, this.filter);
        resolve(this.applyProjection(item));
      } else {
        const items = jsonDb.find(this.tableName, this.filter, {
          sort: this.sortOption,
          limit: this.limitOption,
          skip: this.skipOption
        });
        resolve(items.map(item => this.applyProjection(item)));
      }
    } catch (err) {
      if (reject) reject(err);
      else throw err;
    }
  }

  catch(reject) {
    return this.then(null, reject);
  }
}

function wrapDocument(tableName, doc) {
  if (!doc) return null;
  if (doc._isWrapped) return doc;

  const instance = { ...doc };
  Object.defineProperty(instance, '_isWrapped', { value: true, enumerable: false });

  instance.save = async function() {
    const dataToSave = { ...instance };
    delete dataToSave.save;
    const updated = jsonDb.update(tableName, instance._id, dataToSave);
    if (!updated) {
      return jsonDb.insert(tableName, dataToSave);
    }
    return updated;
  };

  return instance;
}

class JsonModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  find(filter = {}) {
    return new QueryChain(this.tableName, filter, false);
  }

  findOne(filter = {}) {
    return new QueryChain(this.tableName, filter, true);
  }

  findById(id) {
    return new QueryChain(this.tableName, { _id: String(id) }, true);
  }

  async findByIdAndUpdate(id, data, options = {}) {
    const updated = jsonDb.update(this.tableName, id, data);
    return wrapDocument(this.tableName, updated);
  }

  async findOneAndUpdate(filter, data, options = {}) {
    const target = jsonDb.findOne(this.tableName, filter);
    if (!target) return null;
    const updated = jsonDb.update(this.tableName, target._id, data);
    return wrapDocument(this.tableName, updated);
  }

  async findByIdAndDelete(id) {
    return jsonDb.delete(this.tableName, id, false);
  }

  async findOneAndDelete(filter) {
    return jsonDb.delete(this.tableName, filter, false);
  }

  async countDocuments(filter = {}) {
    return jsonDb.count(this.tableName, filter);
  }

  async create(data) {
    const doc = jsonDb.insert(this.tableName, data);
    return wrapDocument(this.tableName, doc);
  }

  // Support constructor call: new Model(data)
  createInstance(data) {
    const tableName = this.tableName;
    const instance = { ...data };
    instance.save = async function() {
      const dataToSave = { ...instance };
      delete dataToSave.save;
      const inserted = jsonDb.insert(tableName, dataToSave);
      Object.assign(instance, inserted);
      return instance;
    };
    return instance;
  }
}

/**
 * Factory creating model callable both as Model.find() and new Model(data)
 */
function createJsonModel(tableName) {
  const modelInstance = new JsonModel(tableName);

  function ModelConstructor(data) {
    return modelInstance.createInstance(data);
  }

  // Copy methods from modelInstance to ModelConstructor
  ModelConstructor.tableName = tableName;
  ModelConstructor.find = (f) => modelInstance.find(f);
  ModelConstructor.findOne = (f) => modelInstance.findOne(f);
  ModelConstructor.findById = (id) => modelInstance.findById(id);
  ModelConstructor.findByIdAndUpdate = (id, d, o) => modelInstance.findByIdAndUpdate(id, d, o);
  ModelConstructor.findOneAndUpdate = (f, d, o) => modelInstance.findOneAndUpdate(f, d, o);
  ModelConstructor.findByIdAndDelete = (id) => modelInstance.findByIdAndDelete(id);
  ModelConstructor.findOneAndDelete = (f) => modelInstance.findOneAndDelete(f);
  ModelConstructor.countDocuments = (f) => modelInstance.countDocuments(f);
  ModelConstructor.create = (d) => modelInstance.create(d);

  return ModelConstructor;
}

module.exports = {
  JsonModel,
  createJsonModel
};
