import express from 'express';
import { prisma } from '../app.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};

// Get recommendations for user
router.get('/', verifyToken, async (req, res) => {
    try {
        // Get user preferences
        const userPrefs = await prisma.userPreferences.findUnique({
            where: { userId: req.userId }
        });

        // Get user's watched history
        const history = await prisma.history.findMany({
            where: { userId: req.userId },
            select: { itemId: true }
        });

        const watchedIds = history.map(h => h.itemId);

        // Get recommendations based on preferences
        const recommendations = await prisma.mediaItem.findMany({
            where: {
                id: { notIn: watchedIds },
                ...(userPrefs?.favoriteGenres?.length > 0 && {
                    genre: {
                        hasSome: userPrefs.favoriteGenres
                    }
                })
            },
            orderBy: { rating: 'desc' },
            take: 20
        });

        res.json({
            status: 'success',
            data: { recommendations }
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recommendations'
        });
    }
});

// Provide feedback on recommendation
router.post('/:id/feedback', verifyToken, async (req, res) => {
    try {
        const { feedback } = req.body;

        const recommendationFeedback = await prisma.recommendationFeedback.create({
            data: {
                userId: req.userId,
                recommendationId: req.params.id,
                feedback
            }
        });

        res.status(201).json({
            status: 'success',
            data: { recommendationFeedback }
        });
    } catch (error) {
        console.error('Error saving recommendation feedback:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to save recommendation feedback'
        });
    }
});

export default router; 