import express from 'express';
import { auth } from '../middleware/auth.mjs';
import { recommendationEngine } from '../services/recommendationEngine.mjs';
import { MoodAnalyzer } from '../services/mood/moodAnalyzer.mjs';
import { ContentFilter } from '../services/recommendations/contentFilter.js';
import { prisma } from '../config/database.mjs';
import tmdb from '../services/tmdb.mjs';

const router = express.Router();
const moodAnalyzer = new MoodAnalyzer();
const contentFilter = new ContentFilter(prisma);

// Only use auth middleware in production
if (process.env.NODE_ENV === 'production') {
  router.use(auth);
}

// Add basic request logging
router.use((req, res, next) => {
  console.log(`[Recommendations] ${req.method} ${req.url}`);
  next();
});

// Get top recommendations
router.get('/top', async (req, res) => {
  try {
    console.log('Fetching top recommendations...');
    const [movies, tv] = await Promise.all([
      tmdb.getPopularMovies(),
      tmdb.getPopularTVShows()
    ]);

    if (!movies?.results || !tv?.results) {
      console.error('Invalid response format:', { movies, tv });
      throw new Error('Invalid response format from TMDB');
    }

    const recommendations = [
      ...movies.results.slice(0, 5).map(movie => ({
        id: movie.id.toString(),
        title: movie.title,
        type: 'movie',
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        rating: movie.vote_average
      })),
      ...tv.results.slice(0, 5).map(show => ({
        id: show.id.toString(),
        title: show.name,
        type: 'tv',
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        rating: show.vote_average
      }))
    ];

    console.log('Sending recommendations:', recommendations);
    res.json({ data: recommendations });
  } catch (error) {
    console.error('Error fetching top recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch top recommendations', details: error.message });
  }
});

// Get movie recommendations
router.get('/movies', async (req, res) => {
  try {
    console.log('Fetching movie recommendations...');
    const movies = await tmdb.getPopularMovies();

    if (!movies?.results) {
      console.error('Invalid movies response format:', movies);
      throw new Error('Invalid response format from TMDB');
    }

    const recommendations = movies.results.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      type: 'movie',
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      rating: movie.vote_average
    }));

    console.log('Sending movie recommendations:', recommendations);
    res.json({ data: recommendations });
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch movie recommendations', details: error.message });
  }
});

// Get TV show recommendations
router.get('/tv', async (req, res) => {
  try {
    console.log('Fetching TV show recommendations...');
    const tv = await tmdb.getPopularTVShows();

    if (!tv?.results) {
      console.error('Invalid TV shows response format:', tv);
      throw new Error('Invalid response format from TMDB');
    }

    const recommendations = tv.results.map(show => ({
      id: show.id.toString(),
      title: show.name,
      type: 'tv',
      poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
      rating: show.vote_average
    }));

    console.log('Sending TV recommendations:', recommendations);
    res.json({ data: recommendations });
  } catch (error) {
    console.error('Error fetching TV recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch TV recommendations', details: error.message });
  }
});

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
    console.error('Error getting mood-based recommendations:', error);
    res.status(500).json({ error: 'Failed to get mood-based recommendations', details: error.message });
  }
});

export const recommendationsRouter = router;