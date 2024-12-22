import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.mjs';

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
    failureRedirect: '/login?error=oauth_failed',
    session: false 
  }),
  async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        console.error('No user data in request');
        return res.redirect('/login?error=no_user_data');
      }

      const { id, email, name, picture, role } = req.user;

      // Create JWT token for client
      const token = jwt.sign(
        { 
          userId: id,
          email,
          role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL);
      redirectUrl.searchParams.set('token', token);
      res.redirect(redirectUrl.toString());
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
      if (!req.user?.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          role: true
        }
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: { user }
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

// Verify token
router.post('/verify-token',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      status: 'success',
      data: { valid: true }
    });
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