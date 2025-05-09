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

// In-memory cache implementation
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

// Cache appointment details for 2 hours
const APPOINTMENT_CACHE_EXPIRE = 2 * 60 * 60; // 2 hours in seconds

const cacheUtil = {
    // Store appointment details during payment process
    async cacheAppointmentDetails(orderId, details) {
        try {
            if (!orderId || !details) {
                console.warn('Invalid cache parameters:', { orderId, hasDetails: !!details });
                return;
            }
            memoryCache.set(orderId, details);
            memoryCacheExpiry.set(orderId, Date.now() + (APPOINTMENT_CACHE_EXPIRE * 1000));
            console.log(`Cached appointment details in memory for order: ${orderId}`);
            console.log('Cache expiry:', new Date(memoryCacheExpiry.get(orderId)).toISOString());
        } catch (err) {
            console.error('Cache error:', err);
            throw new Error('Failed to cache appointment details: ' + err.message);
        }
    },

    // Retrieve appointment details
    async getAppointmentDetails(orderId) {
        try {
            if (!orderId) {
                console.warn('Invalid orderId for cache retrieval');
                return null;
            }

            const memDetails = memoryCache.get(orderId);
            const expiry = memoryCacheExpiry.get(orderId);
            
            console.log(`Checking cache for order ${orderId}:`, {
                hasDetails: !!memDetails,
                expiry: expiry ? new Date(expiry).toISOString() : null,
                now: new Date().toISOString()
            });
            
            if (memDetails && expiry > Date.now()) {
                console.log(`Retrieved details from memory cache for order: ${orderId}`);
                return memDetails;
            } else if (memDetails) {
                // Clean up expired cache entry
                console.log(`Cache expired for order: ${orderId}`);
                memoryCache.delete(orderId);
                memoryCacheExpiry.delete(orderId);
            }
            
            console.log(`No cached details found for order: ${orderId}`);
            return null;
        } catch (err) {
            console.error('Cache retrieval error:', err);
            return null;
        }
    },

    // Remove appointment details from cache
    async removeAppointmentDetails(orderId) {
        try {
            if (!orderId) {
                console.warn('Invalid orderId for cache removal');
                return;
            }
            memoryCache.delete(orderId);
            memoryCacheExpiry.delete(orderId);
            console.log(`Removed cached details from memory for order: ${orderId}`);
        } catch (err) {
            console.error('Cache removal error:', err);
            throw new Error('Failed to remove cached appointment details: ' + err.message);
        }
    }
};

module.exports = {
  getPermissionsFromCache,
  setPermissionsInCache,
  removePermissionsFromCache,
  getMongooseOptions,
  cacheUtil
};
