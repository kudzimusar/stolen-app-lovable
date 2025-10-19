// Redis client stub
const cacheManager = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  keys: async () => [],
  isReady: () => false
};

export default cacheManager;
