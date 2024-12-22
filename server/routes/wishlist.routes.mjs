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

// Get user's wishlist
router.get('/', verifyToken, async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            status: 'success',
            data: { wishlist }
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch wishlist'
        });
    }
});

// Add item to wishlist
router.post('/', verifyToken, async (req, res) => {
    try {
        const { itemId, itemType } = req.body;

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: req.userId,
                itemId,
                itemType
            }
        });

        res.status(201).json({
            status: 'success',
            data: { wishlistItem }
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add item to wishlist'
        });
    }
});

// Remove item from wishlist
router.delete('/:itemId', verifyToken, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { itemType } = req.body;

        await prisma.wishlist.delete({
            where: {
                userId_itemId_itemType: {
                    userId: req.userId,
                    itemId,
                    itemType
                }
            }
        });

        res.json({
            status: 'success',
            message: 'Item removed from wishlist'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to remove item from wishlist'
        });
    }
});

export default router; 