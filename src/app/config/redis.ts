import Redis from 'ioredis';
import config from './index';

const redis = new Redis({
  host: config.redis?.host || '127.0.0.1',
  port: Number(config.redis?.port) || 6379,
  password: config.redis?.password || undefined,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('✅ Redis Connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error', err);
});

export default redis;
