import { prisma } from '../config/database.mjs';
import { redis } from '../config/redis.mjs';
import tmdb from './tmdb.mjs';

class RecommendationService {
  constructor() {
    this.cachePrefix = 'recommendations:';
    this.cacheDuration = 60 * 60; // 1 hour
  }

  async getRecommendations(userId, type = 'all') {
    const cacheKey = `${this.cachePrefix}${userId}:${type}`;
    
    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log('Returning cached recommendations');
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Cache error:', error);
    }

    try {
      // Get user preferences and history
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          watchHistory: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = user.preferences || {};
      const watchHistory = user.watchHistory || [];

      let recommendations = [];

      // Get recommendations based on type
      if (type === 'all' || type === 'movie') {
        const movies = await this.getMovieRecommendations(preferences, watchHistory);
        recommendations.push(...movies);
      }

      if (type === 'all' || type === 'tv') {
        const shows = await this.getTVRecommendations(preferences, watchHistory);
        recommendations.push(...shows);
      }

      // Sort by rating
      recommendations.sort((a, b) => b.rating - a.rating);

      // Cache the results
      try {
        await redis.setex(cacheKey, this.cacheDuration, JSON.stringify(recommendations));
      } catch (error) {
        console.error('Cache error:', error);
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  async getMovieRecommendations(preferences, watchHistory) {
    try {
      const watchedMovieIds = watchHistory
        .filter(item => item.type === 'movie')
        .map(item => item.mediaId);

      const movies = await tmdb.getPopularMovies();
      
      return movies.results
        .filter(movie => !watchedMovieIds.includes(movie.id.toString()))
        .map(movie => ({
          id: movie.id.toString(),
          title: movie.title,
          type: 'movie',
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          rating: movie.vote_average,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null
        }));
    } catch (error) {
      console.error('Error getting movie recommendations:', error);
      return [];
    }
  }

  async getTVRecommendations(preferences, watchHistory) {
    try {
      const watchedShowIds = watchHistory
        .filter(item => item.type === 'tv')
        .map(item => item.mediaId);

      const shows = await tmdb.getPopularTVShows();
      
      return shows.results
        .filter(show => !watchedShowIds.includes(show.id.toString()))
        .map(show => ({
          id: show.id.toString(),
          title: show.name,
          type: 'tv',
          poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
          rating: show.vote_average,
          year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
        }));
    } catch (error) {
      console.error('Error getting TV recommendations:', error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService(); 