import express from 'express';
import { auth } from '../middleware/auth.js';
import { recommendationEngine } from '../services/recommendationEngine.js';
import { MoodAnalyzer } from '../services/mood/moodAnalyzer.js';
import { ContentFilter } from '../services/recommendations/contentFilter.js';
import { db } from '../config/database.js';

const router = express.Router();
const moodAnalyzer = new MoodAnalyzer();
const contentFilter = new ContentFilter(db);

router.use(auth);

// Get mood-based recommendations
router.post('/mood', async (req, res) => {
  try {
    const { text } = req.body;
    const mood = await moodAnalyzer.analyzeMood(text);
    
    const recommendations = await recommendationEngine.getRecommendations(
      req.user.id,
      'all'
    );

    const filteredRecommendations = await contentFilter.filterByMood(
      recommendations,
      mood.mood
    );

    res.json({
      mood,
      recommendations: filteredRecommendations
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get mood-based recommendations' });
  }
});

// Get personalized recommendations
router.get('/:mediaType', async (req, res) => {
  try {
    const { mediaType } = req.params;
    const recommendations = await recommendationEngine.getRecommendations(
      req.user.id,
      mediaType
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export const recommendationsRouter = router;