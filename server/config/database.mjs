import { PrismaClient } from '@prisma/client';
import config from './config.mjs';

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url
        }
      },
      log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      // Add connection pooling
      connection: {
        pool: {
          min: 2,
          max: config.database.maxConnections
        }
      }
    });

    // Add middleware for query logging in development
    if (config.env === 'development') {
      this.prisma.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
        return result;
      });
    }

    Database.instance = this;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('Successfully connected to database');
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
      console.error(`Failed to connect to database (attempt ${this.retryCount + 1}/${this.maxRetries}):`, error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying connection in ${this.retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect(); // Retry connection
      }
      
      throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log('Successfully disconnected from database');
    } catch (error) {
      console.error('Failed to disconnect from database:', error);
      throw error;
    }
  }

  getClient() {
    return this.prisma;
  }

  // Add health check method
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const database = new Database();

// Handle process termination
process.on('SIGINT', async () => {
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await database.disconnect();
  process.exit(0);
});

// Add periodic health checks
setInterval(async () => {
  const isHealthy = await database.healthCheck();
  if (!isHealthy && database.retryCount === 0) {
    console.log('Database connection lost, attempting to reconnect...');
    await database.connect();
  }
}, 30000); // Check every 30 seconds

export const prisma = database.getClient();
export default database;