import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FRONTEND_URL',
  'TMDB_API_KEY',
  'TMDB_ACCESS_TOKEN',
  'TMDB_API_BASE_URL',
  'DATABASE_URL'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    apiUrl: process.env.API_URL || `http://localhost:3000`,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10),
    ssl: process.env.DATABASE_SSL === 'true'
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: `${process.env.API_URL || 'http://localhost:3000'}/api/auth/google/callback`
    }
  },
  tmdb: {
    apiKey: process.env.TMDB_API_KEY,
    accessToken: process.env.TMDB_ACCESS_TOKEN,
    baseUrl: process.env.TMDB_API_BASE_URL,
    imageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'
  },
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: join(__dirname, '../../logs')
  }
};

// Log non-sensitive configuration
console.log('Environment Configuration:', {
  NODE_ENV: config.env,
  FRONTEND_URL: config.server.frontendUrl,
  API_URL: config.server.apiUrl,
  PORT: config.server.port,
  DATABASE_SSL: config.database.ssl,
  LOG_LEVEL: config.logging.level
});

export default config; 