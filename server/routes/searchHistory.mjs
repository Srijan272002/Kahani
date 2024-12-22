import express from 'express';
import { prisma } from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Get user's search history
router.get('/', async (req, res) => {
  try {
    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// Add search to history
router.post('/', async (req, res) => {
  const { query, type } = req.body;
  try {
    const searchRecord = await prisma.searchHistory.create({
      data: {
        userId: req.user.id,
        query,
        type
      }
    });
    res.status(201).json(searchRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

export const searchHistoryRouter = router;