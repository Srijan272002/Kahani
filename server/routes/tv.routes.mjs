import express from 'express';
import { prisma } from '../app.mjs';

const router = express.Router();

// Get all TV shows
router.get('/', async (req, res) => {
    try {
        const tvShows = await prisma.mediaItem.findMany({
            where: { type: 'TV_SHOW' },
            take: 20
        });

        res.json({
            status: 'success',
            data: { tvShows }
        });
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch TV shows'
        });
    }
});

// Get a single TV show
router.get('/:id', async (req, res) => {
    try {
        const tvShow = await prisma.mediaItem.findUnique({
            where: {
                id: req.params.id,
                type: 'TV_SHOW'
            }
        });

        if (!tvShow) {
            return res.status(404).json({
                status: 'error',
                message: 'TV show not found'
            });
        }

        res.json({
            status: 'success',
            data: { tvShow }
        });
    } catch (error) {
        console.error('Error fetching TV show:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch TV show'
        });
    }
});

// Get trending TV shows
router.get('/trending', async (req, res) => {
    try {
        const trending = await prisma.mediaItem.findMany({
            where: { type: 'TV_SHOW' },
            orderBy: { rating: 'desc' },
            take: 10
        });

        res.json({
            status: 'success',
            data: { trending }
        });
    } catch (error) {
        console.error('Error fetching trending TV shows:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch trending TV shows'
        });
    }
});

export default router; 