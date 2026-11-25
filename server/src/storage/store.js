/**
 * storage/store.js
 * Unified storage adapter. Controllers only ever talk to this module; the
 * concrete backend is selected from the active storage mode at call time.
 */
const database = require('../config/database');

let fileStore;
let mongooseStore;

function active() {
  if (database.storageMode === 'mongodb') {
    if (!mongooseStore) mongooseStore = require('./mongooseStore');
    return mongooseStore;
  }
  if (!fileStore) fileStore = require('./fileStore');
  return fileStore;
}

const store = {
  createUser: (...args) => active().createUser(...args),
  findUserByEmail: (...args) => active().findUserByEmail(...args),
  findUserById: (...args) => active().findUserById(...args),
  updateUser: (...args) => active().updateUser(...args),
  createAnalysis: (...args) => active().createAnalysis(...args),
  findAnalyses: (...args) => active().findAnalyses(...args),
  findAnalysisById: (...args) => active().findAnalysisById(...args),
  deleteAnalysis: (...args) => active().deleteAnalysis(...args),
  getAllAnalysesForUser: (...args) => active().getAllAnalysesForUser(...args)
};

module.exports = store;
