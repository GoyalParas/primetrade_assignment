const NodeCache = require('node-cache');
const logger = require('../config/logger');

// Cache TTL: 5 minutes (300 seconds), check period: 60 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const get = (key) => {
  const value = cache.get(key);
  if (value !== undefined) {
    logger.debug(`Cache HIT for key: ${key}`);
    return value;
  }
  logger.debug(`Cache MISS for key: ${key}`);
  return null;
};

const set = (key, value, ttl = 300) => {
  logger.debug(`Cache SET for key: ${key} with TTL: ${ttl}s`);
  return cache.set(key, value, ttl);
};

const del = (key) => {
  logger.debug(`Cache DEL for key: ${key}`);
  return cache.del(key);
};

const flush = () => {
  logger.info('Flushing all cache...');
  return cache.flushAll();
};

/**
 * Delete cache keys starting with a prefix
 * Useful for invalidating all queries of a specific user
 */
const delByPrefix = (prefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter((key) => key.startsWith(prefix));
  if (keysToDelete.length > 0) {
    logger.debug(`Cache invalidating ${keysToDelete.length} keys with prefix: ${prefix}`);
    cache.del(keysToDelete);
  }
};

module.exports = {
  get,
  set,
  del,
  flush,
  delByPrefix,
};
