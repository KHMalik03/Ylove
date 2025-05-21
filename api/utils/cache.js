const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5-minute default TTL

const getCache = (key) => {
  return cache.get(key);
};

const setCache = (key, data, ttl = 300) => {
  cache.set(key, data, ttl);
};

const clearCache = (key) => {
  cache.del(key);
};

module.exports = {
  getCache,
  setCache,
  clearCache
};