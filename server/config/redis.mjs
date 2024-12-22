import Redis from 'ioredis';
import { AppError } from '../middleware/errorHandler.mjs';

let redis;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Redis connection failed', 500);
    }
  });

  redis.on('connect', () => {
    console.log('Successfully connected to Redis');
  });
} catch (error) {
  console.error('Failed to initialize Redis:', error);
  if (process.env.NODE_ENV === 'production') {
    throw new AppError('Redis initialization failed', 500);
  }
}

export { redis }; 