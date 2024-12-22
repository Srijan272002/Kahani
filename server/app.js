import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Import routes
import authRoutes from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Initialize Prisma
export const prisma = new PrismaClient();

// Verify JWT Secret
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

// JWT Strategy configuration
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      jsonWebTokenOptions: {
        maxAge: '7d'
      }
    },
    async (jwtPayload, done) => {
      try {
        console.log('[JWT] Verifying token payload:', jwtPayload);
        
        // Return the user data from the token
        const user = {
          id: jwtPayload.userId,
          email: jwtPayload.email,
          name: jwtPayload.name,
          picture: jwtPayload.picture
        };
        
        return done(null, user);
      } catch (error) {
        console.error('[JWT] Strategy error:', error);
        return done(error, false);
      }
    }
  )
);

// Google OAuth configuration
const GOOGLE_CALLBACK_URL = `${API_URL}/api/auth/google/callback`;
console.log('Google OAuth Configuration:', {
  callbackURL: GOOGLE_CALLBACK_URL,
  frontendURL: FRONTEND_URL,
  apiURL: API_URL,
  clientID: process.env.GOOGLE_CLIENT_ID ? '***' + process.env.GOOGLE_CLIENT_ID.slice(-6) : 'missing'
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('[OAuth] Google callback received:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          picture: profile.photos?.[0]?.value
        });

        // Create or update user in database
        const user = await prisma.user.upsert({
          where: { 
            googleId: profile.id 
          },
          update: {
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            email: profile.emails?.[0]?.value,
            accessToken,
            refreshToken,
            updatedAt: new Date()
          },
          create: {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            accessToken,
            refreshToken,
            role: 'USER'
          }
        });

        console.log('[OAuth] User upserted:', { 
          id: user.id, 
          email: user.email,
          role: user.role 
        });
        
        return done(null, user);
      } catch (error) {
        console.error('[OAuth] Error in Google callback:', error);
        return done(error, null);
      }
    }
  )
);

// Middleware
app.use(cors({
  origin: [FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());

// Basic request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// OAuth Routes (these need to be before /api routes)
app.get('/api/auth/google', (req, res, next) => {
  console.log('[OAuth] Starting Google OAuth flow');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

app.get('/api/auth/google/callback',
  (req, res, next) => {
    console.log('[OAuth] Received callback from Google');
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('[OAuth] Creating JWT token for user:', req.user);
      
      const token = jwt.sign(
        { 
          userId: req.user.id,
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const redirectUrl = `${FRONTEND_URL}/auth/callback?token=${token}`;
      console.log('[OAuth] Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('[OAuth] Error in callback handler:', error);
      res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('[Health] Health check requested');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'Kahani API',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL,
      API_URL
    }
  });
});

// Start server
try {
  app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`API URL: ${API_URL}`);
    console.log('Auth endpoints:');
    console.log(`  - Google OAuth: ${API_URL}/auth/google`);
    console.log(`  - Callback URL: ${GOOGLE_CALLBACK_URL}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('=================================');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

export default app; 