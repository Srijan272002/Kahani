const Redis = require('ioredis');
const { AppError } = require('../middleware/errorHandler');

let redis;

const connectRedis = async () => {
    try {
        redis = new Redis(process.env.REDIS_URL);
        
        redis.on('error', (error) => {
            console.error('Redis Error:', error);
        });

        redis.on('connect', () => {
            console.log('Redis connected successfully');
        });

        return redis;
    } catch (error) {
        throw new AppError('Redis connection failed', 500);
    }
};

module.exports = {
    connectRedis,
    getRedis: () => redis
}; 