import express from 'express';
import { prisma } from '../config/database.mjs';
import { auth } from '../middleware/auth.mjs';

const router = express.Router();

// Admin middleware
const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.use(auth);
router.use(isAdmin);

// User analytics
router.get('/analytics/users', async (req, res) => {
  try {
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);
    res.json({ totalUsers, newUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Search analytics
router.get('/analytics/searches', async (req, res) => {
  try {
    const searches = await prisma.searchHistory.groupBy({
      by: ['type'],
      _count: true,
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    });
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search analytics' });
  }
});

// Popular media
router.get('/analytics/popular', async (req, res) => {
  try {
    const [topRated, mostWishlisted] = await Promise.all([
      prisma.rating.groupBy({
        by: ['mediaId'],
        _avg: { value: true },
        _count: true,
        orderBy: {
          _avg: {
            value: 'desc'
          }
        },
        take: 10
      }),
      prisma.wishlist.groupBy({
        by: ['mediaId', 'title'],
        _count: true,
        orderBy: {
          _count: {
            _all: 'desc'
          }
        },
        take: 10
      })
    ]);
    res.json({ topRated, mostWishlisted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popularity analytics' });
  }
});

export const adminRouter = router;