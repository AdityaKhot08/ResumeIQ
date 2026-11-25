/**
 * config/database.js
 * Decides which storage backend is active. A valid MONGODB_URI enables Mongoose;
 * otherwise (or if the connection fails at startup) a zero-dependency JSON file
 * store is used so the API still works out of the box.
 */
const mongoose = require('mongoose');
const env = require('./env');

let storageMode = 'file';

async function connectDatabase() {
  if (!env.MONGODB_URI) {
    console.log('MongoDB not configured — using local file store at .data/db.json');
    storageMode = 'file';
    return storageMode;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    storageMode = 'mongodb';
    console.log(`MongoDB connected (${maskUri(env.MONGODB_URI)})`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error && error.message ? error.message : error}`);
    console.warn('Falling back to the local file store at .data/db.json');
    storageMode = 'file';
  }

  return storageMode;
}

function maskUri(uri) {
  if (!uri || !uri.includes('://')) return 'configured instance';
  return uri.replace(/\/\/[^@]*@/, '//***@');
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  get storageMode() {
    return storageMode;
  },
  get isMongo() {
    return storageMode === 'mongodb';
  }
};
