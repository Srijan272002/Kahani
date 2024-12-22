import express from 'express';
import { prisma } from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Comments
router.post('/comments', async (req, res) => {
  const { mediaId, content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        userId: req.user.id,
        mediaId,
        content
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.get('/comments/:mediaId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { mediaId: req.params.mediaId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Ratings
router.post('/ratings', async (req, res) => {
  const { mediaId, value } = req.body;
  try {
    const rating = await prisma.rating.upsert({
      where: {
        userId_mediaId: {
          userId: req.user.id,
          mediaId
        }
      },
      update: { value },
      create: {
        userId: req.user.id,
        mediaId,
        value
      }
    });
    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

router.get('/ratings/:mediaId', async (req, res) => {
  try {
    const ratings = await prisma.rating.aggregate({
      where: { mediaId: req.params.mediaId },
      _avg: { value: true },
      _count: true
    });
    res.json({
      average: ratings._avg.value || 0,
      count: ratings._count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

export const socialRouter = router;