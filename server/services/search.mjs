import { prisma } from '../config/database.mjs';
import { redis } from '../config/redis.mjs';
import tmdb from './tmdb.mjs';

class SearchService {
  constructor() {
    this.cachePrefix = 'search:';
    this.cacheDuration = 60 * 60; // 1 hour
  }

  async search(query, type = 'all', page = 1) {
    const cacheKey = `${this.cachePrefix}${type}:${query}:${page}`;
    
    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log('Returning cached search results');
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Cache error:', error);
    }

    // If not in cache, fetch from TMDB
    try {
      let results = [];
      
      if (type === 'all' || type === 'movie') {
        const movies = await tmdb.searchMovies(query, page);
        results.push(...movies.results.map(movie => ({
          id: movie.id.toString(),
          title: movie.title,
          type: 'movie',
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          rating: movie.vote_average,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null
        })));
      }
      
      if (type === 'all' || type === 'tv') {
        const shows = await tmdb.searchTVShows(query, page);
        results.push(...shows.results.map(show => ({
          id: show.id.toString(),
          title: show.name,
          type: 'tv',
          poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
          rating: show.vote_average,
          year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
        })));
      }

      // Sort by rating
      results.sort((a, b) => b.rating - a.rating);

      // Cache the results
      try {
        await redis.setex(cacheKey, this.cacheDuration, JSON.stringify(results));
      } catch (error) {
        console.error('Cache error:', error);
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async searchHistory(userId) {
    try {
      const history = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      return history;
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  async saveSearch(userId, query, type) {
    try {
      await prisma.searchHistory.create({
        data: {
          userId,
          query,
          type
        }
      });
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  async clearHistory(userId) {
    try {
      await prisma.searchHistory.deleteMany({
        where: { userId }
      });
      return true;
    } catch (error) {
      console.error('Error clearing search history:', error);
      return false;
    }
  }
}

export const searchService = new SearchService(); 