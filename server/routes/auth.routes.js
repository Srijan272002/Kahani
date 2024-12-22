import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';

const router = express.Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  async (req, res) => {
    try {
      const { user, accessToken, refreshToken } = req;
      
      // Update or create user with tokens
      await prisma.user.upsert({
        where: { googleId: user.googleId },
        update: { 
          accessToken,
          refreshToken,
          name: user.name,
          picture: user.picture,
          email: user.email
        },
        create: {
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          picture: user.picture,
          accessToken,
          refreshToken
        }
      });

      // Create JWT token for client
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  }
);

// Get current user
router.get('/me', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log('GET /me - User from token:', req.user);
      
      if (!req.user?.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      // Return the user data from the token
      res.json({
        status: 'success',
        data: { user: req.user }
      });
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user data'
      });
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export default router; 