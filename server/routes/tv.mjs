import axios from 'axios';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';

export const tvRouter = {
  async search(query) {
    try {
      const response = await axios.get(OMDB_API_URL, {
        params: {
          apikey: OMDB_API_KEY,
          s: query,
          type: 'series',
        },
      });

      if (response.data.Error) {
        throw new Error(response.data.Error);
      }

      return {
        results: response.data.Search.map(show => ({
          id: show.imdbID,
          title: show.Title,
          type: 'tv',
          year: show.Year,
          poster: show.Poster !== 'N/A' ? show.Poster : undefined,
        })),
        totalResults: parseInt(response.data.totalResults),
      };
    } catch (error) {
      throw new Error('Failed to fetch TV shows: ' + error.message);
    }
  },
};