import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from './config/passport.mjs';
import config from './config/config.mjs';
import database from './config/database.mjs';
import { errorMiddleware } from './middleware/errorMiddleware.mjs';
import { AppError } from './middleware/errorHandler.mjs';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.mjs';
import movieRoutes from './routes/movie.routes.mjs';
import tvRoutes from './routes/tv.routes.mjs';
import { recommendationsRouter } from './routes/recommendations.mjs';

const app = express();

// Initialize database connection
await database.connect().catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());

// Basic request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/recommendations', recommendationsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('[Health] Health check requested');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'Kahani API',
    env: {
      NODE_ENV: config.env,
      FRONTEND_URL: config.server.frontendUrl,
      API_URL: config.server.apiUrl
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  next(new AppError(`Route not found: ${req.method} ${req.url}`, 404));
});

// Error handling middleware
app.use(errorMiddleware);

export default app; 