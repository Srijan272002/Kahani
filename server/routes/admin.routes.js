const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { auth, isAdmin } = require('../middleware/auth');

/**
 * @route GET /api/admin/ab-tests
 * @description Get all A/B tests
 * @access Admin
 */
router.get('/ab-tests', auth, isAdmin, async (req, res) => {
    try {
        const tests = await prisma.aBTest.findMany({
            include: {
                variants: true,
                userAssignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            data: tests
        });
    } catch (error) {
        console.error('Error fetching A/B tests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch A/B tests',
            error: error.message
        });
    }
});

/**
 * @route POST /api/admin/ab-tests
 * @description Create a new A/B test
 * @access Admin
 */
router.post('/ab-tests', auth, isAdmin, async (req, res) => {
    try {
        const { name, description, variants } = req.body;

        const test = await prisma.aBTest.create({
            data: {
                name,
                description,
                variants: {
                    create: variants.map(variant => ({
                        name: variant.name,
                        description: variant.description || '',
                        configuration: variant.configuration
                    }))
                }
            },
            include: {
                variants: true
            }
        });

        res.json({
            success: true,
            data: test
        });
    } catch (error) {
        console.error('Error creating A/B test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create A/B test',
            error: error.message
        });
    }
});

/**
 * @route PATCH /api/admin/ab-tests/:id/status
 * @description Update A/B test status
 * @access Admin
 */
router.patch('/ab-tests/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const test = await prisma.aBTest.update({
            where: { id },
            data: {
                status,
                ...(status === 'COMPLETED' ? { endDate: new Date() } : {})
            }
        });

        res.json({
            success: true,
            data: test
        });
    } catch (error) {
        console.error('Error updating A/B test status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update A/B test status',
            error: error.message
        });
    }
});

/**
 * @route GET /api/admin/analytics
 * @description Get analytics data
 * @access Admin
 */
router.get('/analytics', auth, isAdmin, async (req, res) => {
    try {
        const { timeRange, metrics } = req.query;
        const requestedMetrics = metrics?.split(',') || [];

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Fetch analytics data
        const analyticsData = {};

        // Engagement rate
        if (requestedMetrics.includes('engagement')) {
            const engagementData = await prisma.analyticsEvent.groupBy({
                by: ['timestamp'],
                where: {
                    eventType: 'recommendation_interaction',
                    timestamp: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _count: true
            });

            analyticsData.engagementRate = engagementData.map(data => ({
                date: data.timestamp,
                value: data._count
            }));
        }

        // Click-through rate
        if (requestedMetrics.includes('ctr')) {
            const clickData = await prisma.recommendationMetrics.groupBy({
                by: ['createdAt'],
                where: {
                    clickThrough: true,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _count: true
            });

            analyticsData.clickThroughRate = clickData.map(data => ({
                date: data.createdAt,
                value: data._count
            }));
        }

        // Average ratings
        if (requestedMetrics.includes('ratings')) {
            const ratingData = await prisma.recommendationMetrics.groupBy({
                by: ['createdAt'],
                where: {
                    rating: { not: null },
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _avg: {
                    rating: true
                }
            });

            analyticsData.averageRating = ratingData.map(data => ({
                date: data.createdAt,
                value: data._avg.rating
            }));
        }

        // Media type distribution
        if (requestedMetrics.includes('distribution')) {
            const distributionData = await prisma.history.groupBy({
                by: ['itemType'],
                where: {
                    viewedAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _count: true
            });

            const total = distributionData.reduce((sum, item) => sum + item._count, 0);
            analyticsData.mediaTypeDistribution = distributionData.reduce((acc, item) => {
                acc[item.itemType] = Math.round((item._count / total) * 100);
                return acc;
            }, {});
        }

        // Algorithm performance
        if (requestedMetrics.includes('performance')) {
            const performanceData = await prisma.recommendationMetrics.groupBy({
                by: ['recommendationId'],
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _avg: {
                    rating: true
                }
            });

            analyticsData.algorithmPerformance = performanceData.reduce((acc, item) => {
                acc[item.recommendationId] = item._avg.rating;
                return acc;
            }, {});
        }

        res.json({
            success: true,
            data: analyticsData
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
});

module.exports = router; 