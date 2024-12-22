import express from 'express';
import { auth } from '../middleware/auth.mjs';
import { validateSearch } from '../middleware/validate.mjs';
import { searchService } from '../services/search.mjs';
import { AppError } from '../middleware/errorHandler.mjs';

const router = express.Router();

// Add basic request logging
router.use((req, res, next) => {
  console.log(`[Search] ${req.method} ${req.url}`);
  next();
});

// Search endpoint
router.get('/', validateSearch, async (req, res, next) => {
  try {
    const { query, type = 'all', page = 1 } = req.query;
    console.log('Search request:', { query, type, page });

    const results = await searchService.search(query, type, parseInt(page));
    
    console.log(`Found ${results.length} results`);
    res.json({ data: results });
  } catch (error) {
    console.error('Search error:', error);
    next(new AppError('Failed to perform search', 500));
  }
});

// Get search history (requires authentication)
router.get('/history', auth, async (req, res, next) => {
  try {
    console.log('Fetching search history for user:', req.user.id);
    
    const history = await searchService.searchHistory(req.user.id);
    
    console.log(`Found ${history.length} search history items`);
    res.json({ data: history });
  } catch (error) {
    console.error('Error fetching search history:', error);
    next(new AppError('Failed to fetch search history', 500));
  }
});

// Save search to history (requires authentication)
router.post('/history', auth, async (req, res, next) => {
  try {
    const { query, type } = req.body;
    
    if (!query) {
      return next(new AppError('Search query is required', 400));
    }
    
    console.log('Saving search to history:', { userId: req.user.id, query, type });
    
    await searchService.saveSearch(req.user.id, query, type);
    res.status(201).json({ message: 'Search saved to history' });
  } catch (error) {
    console.error('Error saving search:', error);
    next(new AppError('Failed to save search to history', 500));
  }
});

// Clear search history (requires authentication)
router.delete('/history', auth, async (req, res, next) => {
  try {
    console.log('Clearing search history for user:', req.user.id);
    
    const success = await searchService.clearHistory(req.user.id);
    
    if (success) {
      res.json({ message: 'Search history cleared' });
    } else {
      next(new AppError('Failed to clear search history', 500));
    }
  } catch (error) {
    console.error('Error clearing search history:', error);
    next(new AppError('Failed to clear search history', 500));
  }
});

export { router as searchRouter }; 