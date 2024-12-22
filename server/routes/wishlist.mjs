import express from 'express';
import { prisma } from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { mediaId, mediaType, title, year, poster, description } = req.body;
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        mediaId,
        mediaType,
        title,
        year,
        poster,
        description
      }
    });
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.wishlist.deleteMany({
      where: {
        mediaId: req.params.id,
        userId: req.user.id
      }
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export const wishlistRouter = router;