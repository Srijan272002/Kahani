import express from 'express';
import { prisma } from '../config/database.mjs';
import { auth } from '../middleware/auth.mjs';
import { validate, commonValidations } from '../middleware/validate.mjs';
import { asyncHandler } from '../middleware/errorMiddleware.mjs';
import { AppError } from '../middleware/errorHandler.mjs';

const router = express.Router();

// Get user profile
router.get('/profile', 
  auth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        preferences: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user }
    });
  })
);

// Update user profile
router.put('/profile',
  auth,
  validate([commonValidations.name]),
  asyncHandler(async (req, res) => {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json({
      status: 'success',
      data: { user }
    });
  })
);

// Update user preferences
router.put('/preferences',
  auth,
  validate([
    {
      in: ['body'],
      custom: {
        options: (value) => {
          const { favoriteGenres, contentRating, language } = value;
          if (!favoriteGenres || !Array.isArray(favoriteGenres)) {
            throw new Error('favoriteGenres must be an array');
          }
          if (!contentRating || typeof contentRating !== 'string') {
            throw new Error('contentRating must be a string');
          }
          if (!language || typeof language !== 'string') {
            throw new Error('language must be a string');
          }
          return true;
        }
      }
    }
  ]),
  asyncHandler(async (req, res) => {
    const { favoriteGenres, contentRating, language } = req.body;

    const preferences = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        preferences: {
          favoriteGenres,
          contentRating,
          language,
          updatedAt: new Date()
        }
      },
      select: {
        id: true,
        preferences: true
      }
    });

    res.json({
      status: 'success',
      data: { preferences }
    });
  })
);

// Get user watch history
router.get('/history',
  auth,
  validate([
    commonValidations.page,
    commonValidations.limit
  ]),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          mediaId: true,
          type: true,
          createdAt: true
        }
      }),
      prisma.watchHistory.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      status: 'success',
      data: { 
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

export default router; 