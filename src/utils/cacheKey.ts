export const createCacheKey = (prefix: string, query: unknown) => {
  return `${prefix}:${JSON.stringify(query)}`;
};
