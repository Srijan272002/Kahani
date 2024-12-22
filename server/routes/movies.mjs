import axios from 'axios';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';

export const movieRouter = {
  async search(query) {
    try {
      const response = await axios.get(OMDB_API_URL, {
        params: {
          apikey: OMDB_API_KEY,
          s: query,
          type: 'movie',
        },
      });

      if (response.data.Error) {
        throw new Error(response.data.Error);
      }

      return {
        results: response.data.Search.map(movie => ({
          id: movie.imdbID,
          title: movie.Title,
          type: 'movie',
          year: movie.Year,
          poster: movie.Poster !== 'N/A' ? movie.Poster : undefined,
        })),
        totalResults: parseInt(response.data.totalResults),
      };
    } catch (error) {
      throw new Error('Failed to fetch movies: ' + error.message);
    }
  },
};