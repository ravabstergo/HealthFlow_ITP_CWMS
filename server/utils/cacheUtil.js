// Import Redis client
const { createClient } = require("redis");

// In-memory cache as fallback when Redis is unavailable
let permissionsCache = {};

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Redis connection management
let redisConnected = false;

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    redisConnected = true;
    console.log("Connected to Redis server successfully");
    return true;
  } catch (error) {
    redisConnected = false;
    console.warn(
      "Redis connection failed, using in-memory cache instead:",
      error.message
    );
    return false;
  }
};

// Initialize Redis connection
connectRedis().catch((err) => {
  console.warn(
    "Redis initial connection failed, using in-memory cache:",
    err.message
  );
});

// Get cached permissions
const getPermissionsFromCache = async (roleId) => {
  try {
    // Try to get from Redis if connected
    if (redisConnected) {
      const cachedPermissions = await redisClient.get(`permissions:${roleId}`);
      if (cachedPermissions) {
        return JSON.parse(cachedPermissions);
      }
    }
  } catch (error) {
    console.warn(
      "Error getting permissions from Redis, falling back to in-memory cache:",
      error.message
    );
  }

  // Fallback to in-memory cache
  return permissionsCache[roleId];
};

// Set permissions to cache
const setPermissionsInCache = async (roleId, permissions) => {
  try {
    // Try to store in Redis if connected
    if (redisConnected) {
      await redisClient.set(
        `permissions:${roleId}`,
        JSON.stringify(permissions),
        {
          EX: 86400, // 24 hours expiration
        }
      );
    }
  } catch (error) {
    console.warn(
      "Error setting permissions in Redis, falling back to in-memory cache:",
      error.message
    );
  }

  // Always store in memory as fallback
  permissionsCache[roleId] = permissions;
};

// Remove permissions from cache (used when logging out or when role changes)
const removePermissionsFromCache = async (roleId) => {
  try {
    // Try to remove from Redis if connected
    if (redisConnected) {
      await redisClient.del(`permissions:${roleId}`);
    }
  } catch (error) {
    console.warn("Error removing permissions from Redis:", error.message);
  }

  // Always remove from memory cache
  delete permissionsCache[roleId];
};

module.exports = {
  getPermissionsFromCache,
  setPermissionsInCache,
  removePermissionsFromCache,
  redisClient,
  connectRedis,
};
