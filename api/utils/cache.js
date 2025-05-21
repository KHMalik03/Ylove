// api/utils/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5-minute default TTL

// TTL constants in seconds
const TTL = {
  short: 60,      // 1 minute
  medium: 300,    // 5 minutes
  long: 3600,     // 1 hour
  day: 86400      // 24 hours
};

// Get data from cache
const getCache = (key, ttlType = 'medium') => {
  return cache.get(key);
};

// Set data in cache with configurable TTL
const setCache = (key, data, ttlType = 'medium') => {
  const ttl = typeof ttlType === 'string' ? TTL[ttlType] || TTL.medium : ttlType;
  cache.set(key, data, ttl);
};

// Delete from cache by key
const deleteCache = (key) => {
  return cache.del(key);
};

// Delete keys matching a pattern
const deleteCachePattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  return cache.del(matchingKeys);
};

// Flush all cache
const flushAll = () => {
  return cache.flushAll();
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  flushAll
};