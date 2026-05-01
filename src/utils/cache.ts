import redis from '../app/config/redis';

// ==========================
// GET CACHE
// ==========================
export const getCache = async (key: string) => {
  const data = await redis.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// ==========================
// SET CACHE
// ==========================
// ==========================
// SET CACHE (NO TYPE ERROR)
// ==========================
export const setCache = async (
  key: string,
  value: unknown,
  ttl: number = 300,
) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

// ==========================
// CLEAR CACHE BY PATTERN (PRODUCTION SAFE)
// ==========================
export const clearCacheByPattern = async (pattern: string) => {
  const stream = redis.scanStream({
    match: pattern,
    count: 200,
  });

  const keys: string[] = [];

  stream.on('data', (resultKeys: string[]) => {
    keys.push(...resultKeys);
  });

  await new Promise<void>((resolve) => {
    stream.on('end', () => resolve());
  });

  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
