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

module.exports = {
  getPermissionsFromCache,
  setPermissionsInCache,
  removePermissionsFromCache,
};
