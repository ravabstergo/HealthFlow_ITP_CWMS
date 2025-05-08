let permissionsCache = {};

// Get cached permissions
const getPermissionsFromCache = (roleId) => {
  return permissionsCache[roleId];
};

// Set permissions to cache
const setPermissionsInCache = (roleId, permissions) => {
  permissionsCache[roleId] = permissions;
};

// Remove permissions from cache (used when logging out or when role changes)
const removePermissionsFromCache = (roleId) => {
  delete permissionsCache[roleId];
};

const mongoose = require('mongoose');

const getMongooseOptions = () => {
    return {
        // Force MongoDB to return fresh data
        readPreference: 'primary',
        // Add timeout to prevent hanging queries
        maxTimeMS: 30000,
        // Don't use MongoDB query cache
        noCursorTimeout: true
    };
};

module.exports = {
  getPermissionsFromCache,
  setPermissionsInCache,
  removePermissionsFromCache,
  getMongooseOptions
};
