import express from 'express';
import { prisma } from '../app.mjs';

const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
    try {
        const movies = await prisma.mediaItem.findMany({
            where: { type: 'MOVIE' },
            take: 20
        });

        res.json({
            status: 'success',
            data: { movies }
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch movies'
        });
    }
});

// Get a single movie
router.get('/:id', async (req, res) => {
    try {
        const movie = await prisma.mediaItem.findUnique({
            where: {
                id: req.params.id,
                type: 'MOVIE'
            }
        });

        if (!movie) {
            return res.status(404).json({
                status: 'error',
                message: 'Movie not found'
            });
        }

        res.json({
            status: 'success',
            data: { movie }
        });
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch movie'
        });
    }
});

// Get trending movies
router.get('/trending', async (req, res) => {
    try {
        const trending = await prisma.mediaItem.findMany({
            where: { type: 'MOVIE' },
            orderBy: { rating: 'desc' },
            take: 10
        });

        res.json({
            status: 'success',
            data: { trending }
        });
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch trending movies'
        });
    }
});

export default router; 