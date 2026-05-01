import redis from '../app/config/redis';

export const getCache = async (key: string) => {
  const data = await redis.get(key);

  if (!data) return null;

  return JSON.parse(data);
};

export const setCache = async (key: string, value: unknown, ttl = 300) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

export const clearCache = async (pattern: string) => {
  const keys = await redis.keys(pattern);

  if (keys.length) {
    await redis.del(keys);
  }
};
