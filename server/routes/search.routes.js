const express = require('express');
const router = express.Router();
const searchService = require('../services/search');
const { validateSearch } = require('../middleware/validate');
const { rateLimit } = require('../config/rateLimit');

// Apply rate limiting to search endpoints
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30 // 30 requests per minute
});

/**
 * @route GET /api/search
 * @description Search across all media types
 * @access Public
 */
router.get('/', searchLimiter, validateSearch, async (req, res) => {
    try {
        const { q: query, types, sort } = req.query;
        const typeArray = types ? types.split(',') : [];

        const results = await searchService.search(query, typeArray, sort);
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform search',
            error: error.message
        });
    }
});

/**
 * @route GET /api/search/suggestions
 * @description Get search suggestions based on partial query
 * @access Public
 */
router.get('/suggestions', searchLimiter, async (req, res) => {
    try {
        const { q: query } = req.query;
        if (!query || query.length < 2) {
            return res.json({
                success: true,
                data: {
                    suggestions: []
                }
            });
        }

        // Get suggestions from cache or generate new ones
        const suggestions = await searchService.getSuggestions(query);
        res.json({
            success: true,
            data: {
                suggestions
            }
        });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get search suggestions',
            error: error.message
        });
    }
});

module.exports = router; 