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

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
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
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user profile'
        });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
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
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user profile'
        });
    }
});

// Update user preferences
router.put('/preferences', verifyToken, async (req, res) => {
    try {
        const { favoriteGenres, contentRating, language } = req.body;

        const preferences = await prisma.userPreferences.upsert({
            where: { userId: req.userId },
            update: {
                favoriteGenres,
                contentRating,
                language
            },
            create: {
                userId: req.userId,
                favoriteGenres,
                contentRating,
                language
            }
        });

        res.json({
            status: 'success',
            data: { preferences }
        });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user preferences'
        });
    }
});

export default router; 